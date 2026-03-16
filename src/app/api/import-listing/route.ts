import { NextRequest, NextResponse } from 'next/server';
import type { FuelType, TransmissionType, BodyType, DriveType } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParsedListing {
  title?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  body?: BodyType;
  color?: string;
  power?: number;       // kW
  powerHP?: number;     // KS/HP
  engineSize?: number;  // cc
  price?: number;
  currency?: string;
  description?: string;
  photos?: string[];
  city?: string;
  doors?: number;
  seats?: number;
  driveType?: DriveType;
  equipment?: string[];
  registrationUntil?: string;
  previousOwners?: number;
  registrationStatus?: string;
  negotiable?: boolean;
  importedFrom?: string;
  sourceUrl?: string;
}

// ---------------------------------------------------------------------------
// Supported domains
// ---------------------------------------------------------------------------

const SUPPORTED_DOMAINS = [
  'olx.ba',
  'autoplac.ba',
  'autobum.ba',
  'polovniautomobili.com',
];

// ---------------------------------------------------------------------------
// Mapping tables
// ---------------------------------------------------------------------------

const FUEL_MAP: Record<string, FuelType> = {
  benzin: 'benzin', petrol: 'benzin', gasoline: 'benzin',
  dizel: 'dizel', diesel: 'dizel',
  plin: 'plin', lpg: 'plin', 'tng / cng': 'plin', gas: 'plin',
  'benzin+plin': 'benzin+plin', 'benzin + plin': 'benzin+plin',
  hibrid: 'hibrid', hybrid: 'hibrid', 'plug-in hybrid': 'hibrid', 'plug-in hibrid': 'hibrid',
  elektricni: 'elektricni', 'električni': 'elektricni', electric: 'elektricni', elektro: 'elektricni',
};

const TRANSMISSION_MAP: Record<string, TransmissionType> = {
  manuelni: 'manuelni', manuelno: 'manuelni', manual: 'manuelni', 'ručni': 'manuelni',
  automatski: 'automatski', automatik: 'automatski', automatic: 'automatski',
  tiptronic: 'automatski', dsg: 'automatski', cvt: 'automatski',
  poluautomatski: 'poluautomatski', poluautomatik: 'poluautomatski',
};

const BODY_MAP: Record<string, BodyType> = {
  limuzina: 'limuzina', sedan: 'limuzina',
  karavan: 'karavan', estate: 'karavan', wagon: 'karavan', kombi: 'karavan',
  hatchback: 'hatchback', 'hečbek': 'hatchback',
  suv: 'SUV', terenac: 'SUV', 'džip': 'SUV', 'suv / terensko vozilo': 'SUV',
  coupe: 'coupe', 'kupé': 'coupe', kupe: 'coupe',
  cabrio: 'cabrio', kabriolet: 'cabrio',
  pickup: 'pickup',
  monovolumen: 'monovolumen', minivan: 'monovolumen',
};

const DRIVE_MAP: Record<string, DriveType> = {
  prednji: 'prednji', fwd: 'prednji',
  zadnji: 'zadnji', rwd: 'zadnji',
  'sva četiri': 'sva-cetiri', 'sva cetiri': 'sva-cetiri',
  '4x4': 'sva-cetiri', awd: 'sva-cetiri', '4wd': 'sva-cetiri',
  '4motion': 'sva-cetiri', xdrive: 'sva-cetiri', quattro: 'sva-cetiri',
};

function matchFuel(raw: string): FuelType | undefined {
  return FUEL_MAP[raw.toLowerCase().trim()];
}

function matchTransmission(raw: string): TransmissionType | undefined {
  return TRANSMISSION_MAP[raw.toLowerCase().trim()];
}

function matchBody(raw: string): BodyType | undefined {
  return BODY_MAP[raw.toLowerCase().trim()];
}

function matchDrive(raw: string): DriveType | undefined {
  return DRIVE_MAP[raw.toLowerCase().trim()];
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function getDomainFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Strip HTML tags, convert block elements to newlines, collapse whitespace. */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Parse a number from messy string input. */
function parseNum(raw: string | number | undefined | null): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'number') return isNaN(raw) ? undefined : Math.round(raw);
  const cleaned = raw.replace(/[^\d.,]/g, '');
  if (!cleaned) return undefined;
  // Treat dots as thousand separators if there's a comma, else as decimal
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const n = parseFloat(normalized);
  return isNaN(n) ? undefined : Math.round(n);
}

/** Convert engine size: "2.0" → 2000, "1998" stays 1998. */
function parseEngineSize(raw: string | number | undefined | null): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  const n = parseFloat(s.replace(',', '.'));
  if (isNaN(n)) return undefined;
  // Values like 2.0, 1.6, 3.0 → multiply by 1000
  if (n < 100) return Math.round(n * 1000);
  return Math.round(n);
}

/** Extract <meta> tag content by property or name. */
function getMetaContent(html: string, attr: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(attr)}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapeRegex(attr)}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

/** Extract __NEXT_DATA__ JSON from HTML page. */
function extractNextData(html: string): Record<string, unknown> | null {
  const match = html.match(/<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/i);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/** Extract JSON-LD from HTML page. */
function extractJsonLd(html: string): Record<string, unknown> | null {
  const match = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/** Get all og:image values. */
function getAllOgImages(html: string): string[] {
  const images: string[] = [];
  const re = /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']og:image["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const url = m[1] || m[2];
    if (url) images.push(url.trim());
  }
  return images;
}

/** Fetch HTML with good headers and timeout. */
async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'bs,hr,sr,en;q=0.5',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.text();
}

/** Parse doors string like "4/5" → 4 */
function parseDoors(raw: string | number | undefined | null): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  const m = s.match(/^(\d)/);
  return m ? Number(m[1]) : undefined;
}

// ---------------------------------------------------------------------------
// Make/model guessing from title (fallback)
// ---------------------------------------------------------------------------

const KNOWN_MAKES = [
  'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Bentley', 'Chevrolet',
  'Chrysler', 'Citroen', 'Citroën', 'Dacia', 'Daewoo', 'Dodge', 'Fiat',
  'Ford', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia',
  'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Maserati', 'Mazda',
  'Mercedes-Benz', 'Mercedes', 'Mini', 'MINI', 'Mitsubishi', 'Nissan',
  'Opel', 'Peugeot', 'Porsche', 'Renault', 'Rolls-Royce', 'Saab',
  'Seat', 'SEAT', 'Smart', 'Ssangyong', 'Subaru', 'Suzuki', 'Toyota',
  'Tesla', 'Volkswagen', 'VW', 'Volvo', 'Škoda', 'Skoda',
];

const MAKE_NORMALIZE: Record<string, string> = {
  vw: 'Volkswagen',
  mercedes: 'Mercedes-Benz',
  'citroën': 'Citroen',
  skoda: 'Škoda',
  mini: 'Mini',
  seat: 'Seat',
};

function normalizeMake(raw: string): string {
  return MAKE_NORMALIZE[raw.toLowerCase()] || raw;
}

function guessMakeModel(title: string): { make?: string; model?: string } {
  if (!title) return {};
  for (const make of KNOWN_MAKES) {
    const idx = title.toLowerCase().indexOf(make.toLowerCase());
    if (idx === -1) continue;
    const normalized = normalizeMake(make);
    const after = title.substring(idx + make.length).trim();
    const tokens: string[] = [];
    for (const part of after.split(/[\s,]+/)) {
      if (!part) break;
      if (/^\d{4}$/.test(part) && Number(part) >= 1990) break;
      if (/^\d+[\.,]?\d*\s*(km|KM|EUR|€|BAM)/.test(part)) break;
      tokens.push(part);
      if (tokens.length >= 3) break;
    }
    return { make: normalized, model: tokens.length > 0 ? tokens.join(' ') : undefined };
  }
  return {};
}

function extractYear(text: string): number | undefined {
  const currentYear = new Date().getFullYear();
  const matches = text.match(/\b(19\d{2}|20\d{2})\b/g);
  if (!matches) return undefined;
  for (const m of matches) {
    const y = Number(m);
    if (y >= 1990 && y <= currentYear + 1) return y;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Safe deep access helper
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function dig(obj: any, ...keys: string[]): any {
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// AUTOPLAC.BA parser — uses __NEXT_DATA__ JSON
// ---------------------------------------------------------------------------

function parseAutoPlac(html: string, url: string): ParsedListing {
  const listing: ParsedListing = { importedFrom: 'autoplac.ba', sourceUrl: url };

  const nextData = extractNextData(html);
  const data = dig(nextData, 'props', 'pageProps', 'data');

  if (!data) {
    // Fallback to meta tags if __NEXT_DATA__ not found
    return parseFromMetaTags(html, listing);
  }

  // Title
  listing.title = data.title || undefined;

  // Price
  if (data.price) {
    listing.price = parseNum(data.price);
  }
  // Currency from display_price
  const displayPrice = dig(data, 'object', 'data', 'display_price');
  if (typeof displayPrice === 'string') {
    if (displayPrice.includes('KM')) listing.currency = 'KM';
    else if (/€|EUR/.test(displayPrice)) listing.currency = 'EUR';
  }
  if (!listing.currency) listing.currency = 'KM'; // default for autoplac.ba

  // Make from brand array
  const brandArr = data.brand;
  if (Array.isArray(brandArr) && brandArr.length > 0) {
    listing.make = brandArr[0].name || undefined;
  }

  // Model from model array
  const modelArr = data.model;
  if (Array.isArray(modelArr) && modelArr.length > 0) {
    listing.model = modelArr[0].name || undefined;
  }

  // Images — pass CDN URLs directly, do NOT download
  const imagesArr = data.images;
  if (Array.isArray(imagesArr) && imagesArr.length > 0) {
    listing.photos = imagesArr
      .sort((a: { position?: number }, b: { position?: number }) =>
        (a.position ?? 0) - (b.position ?? 0))
      .map((img: { image_url?: string }) => img.image_url)
      .filter(Boolean) as string[];
  }

  // Description — strip HTML
  const descArr = data.description;
  if (Array.isArray(descArr) && descArr.length > 0 && descArr[0].description) {
    listing.description = stripHtml(decodeHtmlEntities(descArr[0].description));
  }

  // City — from data.city array first, then user.city_name fallback
  const cityArr = data.city;
  if (Array.isArray(cityArr) && cityArr.length > 0 && cityArr[0].name) {
    listing.city = cityArr[0].name;
  } else {
    const user = data.user;
    if (user?.city_name) {
      listing.city = user.city_name;
    }
  }

  // --- Attributes ---

  // Helper to find attribute value by display_name
  const findAttr = (section: string, name: string): string | undefined => {
    const attrs = dig(data, 'attributes', section);
    if (!Array.isArray(attrs)) return undefined;
    const item = attrs.find((a: { display_name?: string }) =>
      a.display_name?.toLowerCase() === name.toLowerCase());
    return item?.value;
  };

  // Basic attributes
  const mileageStr = findAttr('basic', 'Kilometraža');
  if (mileageStr) listing.mileage = parseNum(mileageStr);

  const yearStr = findAttr('basic', 'Godište');
  if (yearStr) listing.year = parseNum(yearStr);

  // Design attributes
  const bodyStr = findAttr('design', 'Tip karoserije');
  if (bodyStr) listing.body = matchBody(bodyStr);

  const colorStr = findAttr('design', 'Boja eksterijera');
  if (colorStr) listing.color = colorStr;

  const doorsStr = findAttr('design', 'Broj vrata');
  if (doorsStr) listing.doors = parseDoors(doorsStr);

  const seatsStr = findAttr('design', 'Broj sjedišta');
  if (seatsStr) listing.seats = parseNum(seatsStr);

  // Mechanic attributes
  const transStr = findAttr('mechanic', 'Transmisija');
  if (transStr) listing.transmission = matchTransmission(transStr);

  const engineStr = findAttr('mechanic', 'Kubikaža');
  if (engineStr) listing.engineSize = parseEngineSize(engineStr);

  const fuelStr = findAttr('mechanic', 'Gorivo');
  if (fuelStr) listing.fuel = matchFuel(fuelStr);

  const kwStr = findAttr('mechanic', 'Kilovata (KW)');
  if (kwStr) listing.power = parseNum(kwStr);

  const hpStr = findAttr('mechanic', 'Konjskih snaga');
  if (hpStr) listing.powerHP = parseNum(hpStr);

  const driveStr = findAttr('mechanic', 'Pogon');
  if (driveStr) listing.driveType = matchDrive(driveStr);

  // Additional info → extract dedicated fields + equipment
  const additionalInfo = dig(data, 'attributes', 'additional_info');
  const equipmentItems: string[] = [];

  if (Array.isArray(additionalInfo)) {
    for (const a of additionalInfo) {
      const name = (a.display_name || '').toLowerCase();
      const val = a.value || '';
      
      // Map known fields to dedicated listing properties
      if (name.includes('registrovan do') && val) {
        listing.registrationUntil = val;
      } else if (name.includes('prethodnih vlasnika') && val) {
        listing.previousOwners = parseNum(val);
      } else if (name.includes('godina prve registracije')) {
        // info only, skip
      } else if (name.includes('vlasništvo') || name.includes('vlasnistvo')) {
        // Registration status: "Domaće tablice", "Strane tablice", "Odjavljen"
        if (val.toLowerCase().includes('domaće') || val.toLowerCase().includes('domace')) {
          listing.registrationStatus = 'registrovan';
        } else if (val.toLowerCase().includes('strane')) {
          listing.registrationStatus = 'strane-tablice';
        } else if (val.toLowerCase().includes('odjavljen')) {
          listing.registrationStatus = 'neregistrovan';
        }
      } else if (name.includes('emisioni standard')) {
        equipmentItems.push(`${a.display_name}: ${val}`);
      } else {
        // Everything else goes to equipment with value
        if (val && val !== 'Da' && val !== 'Yes' && val !== '1' && val !== 'True') {
          equipmentItems.push(`${a.display_name}: ${val}`);
        } else {
          equipmentItems.push(a.display_name || '');
        }
      }
    }
  }

  // Additional equipment (boolean items like Navigacija=True, ABS=True)
  const additionalEquipment = dig(data, 'attributes', 'additional_equipment');
  if (Array.isArray(additionalEquipment)) {
    for (const a of additionalEquipment) {
      const name = a.display_name || '';
      const val = String(a.value || '').toLowerCase();
      // Only include items that are "true" / "True" / "Da"
      if (val === 'true' || val === 'da' || val === '1' || val === 'yes') {
        // Avoid duplicates
        if (!equipmentItems.includes(name)) {
          equipmentItems.push(name);
        }
      }
    }
  }

  // Also extract from design attributes that are equipment-like
  const designAttrs = dig(data, 'attributes', 'design');
  if (Array.isArray(designAttrs)) {
    for (const a of designAttrs) {
      const name = (a.display_name || '').toLowerCase();
      const val = a.value || '';
      if (name.includes('posjeduje gume') && val) {
        equipmentItems.push(`Gume: ${val}`);
      } else if (name.includes('veličina felgi') || name.includes('velicina felgi')) {
        equipmentItems.push(`Felge: ${val}"`);
      } else if (name.includes('svjetla') && val) {
        equipmentItems.push(`${val} svjetla`);
      } else if (name.includes('dizajn interijera') && val) {
        equipmentItems.push(`Enterijer: ${val}`);
      }
    }
  }

  // Also add from mechanic attributes
  const mechanicAttrs = dig(data, 'attributes', 'mechanic');
  if (Array.isArray(mechanicAttrs)) {
    for (const a of mechanicAttrs) {
      const name = (a.display_name || '').toLowerCase();
      const val = a.value || '';
      if (name.includes('broj stepeni prijenosa') && val) {
        equipmentItems.push(`Mjenjač: ${val}`);
      }
    }
  }

  listing.equipment = equipmentItems.filter(Boolean);

  return listing;
}

// ---------------------------------------------------------------------------
// AUTOBUM.BA parser — __NEXT_DATA__ or API fallback
// ---------------------------------------------------------------------------

function parseAutoBum(html: string, url: string): ParsedListing {
  const listing: ParsedListing = { importedFrom: 'autobum.ba', sourceUrl: url };

  const nextData = extractNextData(html);

  if (nextData) {
    // Try to get listing data from __NEXT_DATA__
    const pageProps = dig(nextData, 'props', 'pageProps');
    const data = pageProps?.listing || pageProps?.data || pageProps?.vehicle || pageProps;

    if (data && typeof data === 'object') {
      listing.title = data.title || data.name || undefined;
      listing.price = parseNum(data.price);
      listing.year = parseNum(data.year);
      listing.mileage = parseNum(data.mileage || data.km);

      if (data.fuel) listing.fuel = matchFuel(String(data.fuel));
      if (data.transmission) listing.transmission = matchTransmission(String(data.transmission));
      if (data.body || data.body_type) listing.body = matchBody(String(data.body || data.body_type));

      if (data.power_kw) listing.power = parseNum(data.power_kw);
      if (data.power_hp || data.power_ks) listing.powerHP = parseNum(data.power_hp || data.power_ks);
      if (data.engine_size || data.engine) listing.engineSize = parseEngineSize(data.engine_size || data.engine);
      if (data.color) listing.color = String(data.color);
      if (data.doors) listing.doors = parseNum(data.doors);
      if (data.seats) listing.seats = parseNum(data.seats);
      if (data.drive_type || data.drive) listing.driveType = matchDrive(String(data.drive_type || data.drive));

      if (data.make || data.brand) listing.make = normalizeMake(String(data.make || data.brand));
      if (data.model) listing.model = String(data.model);

      // City
      const city = data.city || dig(data, 'location', 'city') || dig(data, 'user', 'city');
      if (city) listing.city = String(typeof city === 'object' ? city.name || city : city);

      // Images
      if (Array.isArray(data.images)) {
        listing.photos = data.images.map((img: string | { url?: string; image_url?: string }) =>
          typeof img === 'string' ? img : (img.url || img.image_url || '')).filter(Boolean);
      } else if (data.image) {
        listing.photos = [String(data.image)];
      }

      // Description
      if (data.description) {
        listing.description = stripHtml(decodeHtmlEntities(String(data.description)));
      }

      if (data.currency) listing.currency = String(data.currency);
    }
  }

  // If we got nothing from __NEXT_DATA__, try JSON-LD
  if (!listing.title) {
    const jsonLd = extractJsonLd(html);
    if (jsonLd) {
      applyJsonLd(listing, jsonLd);
    }
  }

  // Final fallback to meta tags
  if (!listing.title) {
    parseFromMetaTags(html, listing);
  }

  // AutoBum embeds article data in React Server Component chunks with escaped quotes
  // Format: \"transmission\":\"Manuelni\",\"equipment\":[\"item1\",\"item2\"]
  
  // Extract transmission (escaped quotes in RSC)
  const transMatch = html.match(/\\"transmission\\":\\"([^\\]+)\\"/);
  if (transMatch && !listing.transmission) {
    listing.transmission = matchTransmission(transMatch[1]);
  }

  // Extract equipment array (escaped format)
  const equipMatch = html.match(/\\"equipment\\":\[([^\]]+)\]/);
  if (equipMatch && (!listing.equipment || listing.equipment.length === 0)) {
    const raw = equipMatch[1];
    listing.equipment = raw.split(',')
      .map((s: string) => s.replace(/\\"/g, '').replace(/"/g, '').trim())
      .filter(Boolean);
  }

  // Extract RSC fields with escaped quotes
  const rscFields: Record<string, RegExp> = {
    year: /\\"year\\":\\"(\d+)\\"/,
    mileage: /\\"mileage\\":\\"(\d+)\\"/,
    fuel: /\\"fuel\\":\\"([^\\]+)\\"/,
    power_kw: /\\"power_kw\\":\\"(\d+)\\"/,
    power_hp: /\\"power_hp\\":\\"(\d+)\\"/,
    capacity: /\\"capacity\\":\\"([^\\]+)\\"/,
  };

  for (const [field, regex] of Object.entries(rscFields)) {
    const m = html.match(regex);
    if (m) {
      switch (field) {
        case 'year': if (!listing.year) listing.year = parseInt(m[1]); break;
        case 'mileage': if (!listing.mileage) listing.mileage = parseInt(m[1]); break;
        case 'fuel': if (!listing.fuel) listing.fuel = matchFuel(m[1]); break;
        case 'power_kw': if (!listing.power) listing.power = parseInt(m[1]); break;
        case 'power_hp': if (!listing.powerHP) listing.powerHP = parseInt(m[1]); break;
        case 'capacity': if (!listing.engineSize) listing.engineSize = parseEngineSize(m[1]); break;
      }
    }
  }

  // Extract Klima from RSC
  const klimaMatch = html.match(/\\"Klima\\":\\"([^\\]+)\\"/);
  if (klimaMatch && listing.equipment) {
    listing.equipment.push(`Klima ${klimaMatch[1]}`);
  }

  // Extract title from <title> tag: "Auto Bum | Audi A3 Dizel 2011 1.6 66kw (UVOZ)"
  const titleMatch = html.match(/<title[^>]*>Auto Bum \| ([^<]+)<\/title>/);
  if (titleMatch && !listing.title) {
    listing.title = titleMatch[1].trim();
  }

  // Extract location/city from RSC
  const cityMatch = html.match(/\\"city\\":\\"([^\\]+)\\"/);
  if (cityMatch && !listing.city) {
    listing.city = cityMatch[1];
  }

  // AutoBum puts structured data in og:description: "Audi, A3, 2011, Dizel (Euro5), 1.6, 66 KW (89 KS), 271000 km"
  const ogDesc = getMetaContent(html, 'og:description');
  if (ogDesc) {
    const parts = ogDesc.split(',').map((s: string) => s.trim());
    if (parts.length >= 6) {
      if (!listing.make) listing.make = normalizeMake(parts[0]);
      if (!listing.model) listing.model = parts[1];
      if (!listing.year) listing.year = parseNum(parts[2]);
      // Fuel: "Dizel (Euro5)" or "Benzin"
      if (!listing.fuel) {
        const fuelPart = parts[3]?.split('(')[0]?.trim();
        if (fuelPart) listing.fuel = matchFuel(fuelPart);
      }
      // Engine: "1.6" or "2.0"
      if (!listing.engineSize) listing.engineSize = parseEngineSize(parts[4]);
      // Power: "66 KW (89 KS)" or "140 KW (190 KS)"
      const powerStr = parts[5];
      if (powerStr && !listing.power) {
        const kwMatch = powerStr.match(/(\d+)\s*KW/i);
        const hpMatch = powerStr.match(/(\d+)\s*KS/i);
        if (kwMatch) listing.power = parseInt(kwMatch[1]);
        if (hpMatch) listing.powerHP = parseInt(hpMatch[1]);
      }
      // Mileage: "271000 km"
      if (parts[6] && !listing.mileage) {
        const kmMatch = parts[6].match(/(\d+)\s*km/i);
        if (kmMatch) listing.mileage = parseInt(kmMatch[1]);
      }
    }
  }

  // Extract ALL images from AutoBum HTML (CDN pattern)
  if (!listing.photos || listing.photos.length <= 2) {
    const imgSet = new Set<string>();
    const imgRegex = /https:\/\/api\.autobum\.ba\/storage\/cache\/1200x5000\/[^\s"')]+\.jpg/g;
    let match: RegExpExecArray | null;
    while ((match = imgRegex.exec(html)) !== null) {
      imgSet.add(match[0]);
    }
    // Also get smaller resolution images if large ones not found
    if (imgSet.size === 0) {
      const imgRegex2 = /https:\/\/api\.autobum\.ba\/storage\/cache\/[^\s"')]+\.jpg/g;
      while ((match = imgRegex2.exec(html)) !== null) {
        imgSet.add(match[0]);
      }
    }
    if (imgSet.size > 0) {
      listing.photos = [...imgSet];
    }
  }

  // Extract price from AutoBum HTML
  if (!listing.price) {
    const priceMatch = html.match(/(\d[\d.]*)\s*KM/);
    if (priceMatch) {
      listing.price = parseNum(priceMatch[1].replace(/\./g, ''));
      listing.currency = 'KM';
    }
  }

  return listing;
}

// ---------------------------------------------------------------------------
// OLX.BA parser — uses open API (no Cloudflare!)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
async function parseOlx(url: string): Promise<ParsedListing> {
  const listing: ParsedListing = { importedFrom: 'olx.ba', sourceUrl: url };

  // Extract article ID from URL
  const idMatch = url.match(/artikal\/(\d+)/);
  if (!idMatch) {
    throw new Error('Neispravan OLX.ba link — nije pronađen ID oglasa.');
  }
  const articleId = idMatch[1];

  // Call OLX API directly
  const response = await fetch(`https://api.olx.ba/listings/${articleId}`, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`OLX API greška: HTTP ${response.status}`);
  }
  const data = await response.json();

  // Title
  listing.title = data.title || undefined;

  // Price
  if (data.price != null) {
    listing.price = parseNum(data.price);
    listing.currency = 'KM';
  }
  if (data.price_by_agreement) {
    listing.negotiable = true;
  }

  // Make & model
  if (data.brand?.name) listing.make = normalizeMake(data.brand.name);
  if (data.model?.name) listing.model = data.model.name;

  // Images — CDN URLs, use directly
  if (Array.isArray(data.images) && data.images.length > 0) {
    listing.photos = data.images.filter((img: string) => typeof img === 'string' && img.length > 0);
  }

  // Description — strip HTML
  if (data.additional?.description) {
    listing.description = stripHtml(decodeHtmlEntities(data.additional.description));
  }

  // City
  if (Array.isArray(data.cities) && data.cities.length > 0 && data.cities[0].name) {
    listing.city = data.cities[0].name;
  }

  // Build attribute lookup by attr_code
  const attrMap = new Map<string, any>();
  if (Array.isArray(data.attributes)) {
    for (const attr of data.attributes) {
      if (attr.attr_code) attrMap.set(attr.attr_code, attr);
    }
  }

  // Map attributes
  const getAttr = (code: string) => attrMap.get(code)?.value;

  const year = getAttr('godiste');
  if (year != null) listing.year = parseNum(year);

  const fuel = getAttr('gorivo');
  if (fuel) listing.fuel = matchFuel(String(fuel));

  const transmission = getAttr('transmisija');
  if (transmission) listing.transmission = matchTransmission(String(transmission));

  const mileage = getAttr('kilometra-a');
  if (mileage != null) listing.mileage = parseNum(mileage);

  const engineSize = getAttr('kubikaza');
  if (engineSize != null) {
    const n = typeof engineSize === 'number' ? engineSize : parseFloat(String(engineSize));
    if (!isNaN(n)) {
      listing.engineSize = n < 10 ? Math.round(n * 1000) : Math.round(n);
    }
  }

  const kw = getAttr('kilovata-kw');
  if (kw != null) listing.power = parseNum(kw);

  const hp = getAttr('konjskih-snaga');
  if (hp != null) listing.powerHP = parseNum(hp);

  const doors = getAttr('broj-vrata');
  if (doors != null) listing.doors = parseDoors(doors);

  const body = getAttr('tip');
  if (body) listing.body = matchBody(String(body));

  const drive = getAttr('pogon');
  if (drive) listing.driveType = matchDrive(String(drive));

  const color = getAttr('boja');
  if (color) listing.color = String(color);

  const seats = getAttr('sjedecih-mjesta');
  if (seats != null) listing.seats = parseNum(seats);

  const regUntil = getAttr('registrovan-do');
  if (regUntil) listing.registrationUntil = String(regUntil);

  // Equipment — attributes where value === "true"
  const equipment: string[] = [];
  if (Array.isArray(data.attributes)) {
    for (const attr of data.attributes) {
      if (attr.value === 'true' && attr.name) {
        equipment.push(attr.name);
      }
    }
  }
  if (equipment.length > 0) listing.equipment = equipment;

  return listing;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// POLOVNIAUTOMOBILI.COM parser — structured tables + meta + JSON-LD
// ---------------------------------------------------------------------------

function parsePolovniAutomobili(html: string, url: string): ParsedListing {
  const listing: ParsedListing = { importedFrom: 'polovniautomobili.com', sourceUrl: url };

  // Meta tags first
  listing.title = getMetaContent(html, 'og:title') || undefined;
  listing.description = getMetaContent(html, 'og:description') || undefined;

  const ogImages = getAllOgImages(html);
  if (ogImages.length > 0) {
    listing.photos = ogImages;
  }

  // JSON-LD
  const jsonLd = extractJsonLd(html);
  if (jsonLd) {
    applyJsonLd(listing, jsonLd);
  }

  // HTML detail tables with car specs
  const kvPairs = extractKeyValuePairs(html);
  for (const [label, value] of kvPairs) {
    applyKvToListing(listing, label, value);
  }

  // PA-specific: div-based detail sections
  const detailSections = html.match(
    /class=["'][^"']*(?:divider|uk-width)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*>([\s\S]*?)<\/div>/gi,
  ) || [];
  for (const section of detailSections) {
    const parts = section.match(/>([^<]+)</g);
    if (parts && parts.length >= 2) {
      const label = (parts[0] || '').replace(/^>|<$/g, '').trim();
      const value = (parts[1] || '').replace(/^>|<$/g, '').trim();
      if (label && value) applyKvToListing(listing, label, value);
    }
  }

  // City from location element
  if (!listing.city) {
    const cityMatch = html.match(/class=["'][^"']*(?:city|location|mesto|lokacija)[^"']*["'][^>]*>([^<]+)/i);
    if (cityMatch) listing.city = cityMatch[1].trim();
  }

  // Fallback: guess make/model from title
  if (!listing.make && listing.title) {
    const guess = guessMakeModel(listing.title);
    if (guess.make) listing.make = guess.make;
    if (guess.model) listing.model = guess.model;
  }

  if (!listing.year) {
    listing.year = extractYear(listing.title || '') || extractYear(listing.description || '');
  }

  // Currency defaults to EUR for Serbian site
  if (listing.price && !listing.currency) listing.currency = 'EUR';

  return listing;
}

// ---------------------------------------------------------------------------
// Shared helpers for OLX / PA parsers
// ---------------------------------------------------------------------------

function extractKeyValuePairs(html: string): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];

  // <dt>Label</dt><dd>Value</dd>
  const dlRe = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let m: RegExpExecArray | null;
  while ((m = dlRe.exec(html)) !== null) {
    pairs.push([strip(m[1]), strip(m[2])]);
  }

  // <th>Label</th><td>Value</td>
  const thTdRe = /<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi;
  while ((m = thTdRe.exec(html)) !== null) {
    pairs.push([strip(m[1]), strip(m[2])]);
  }

  // div label-value pairs
  const divRe = /class=["'][^"']*(?:label|key|name|property|attribute)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>\s*(?:<[^>]*>)*\s*class=["'][^"']*(?:value|data|info|result)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>/gi;
  while ((m = divRe.exec(html)) !== null) {
    pairs.push([strip(m[1]), strip(m[2])]);
  }

  // <li><strong>Label</strong>: Value</li>
  const liRe = /<li[^>]*>\s*<(?:strong|span|b)[^>]*>([\s\S]*?)<\/(?:strong|span|b)>\s*:?\s*([\s\S]*?)<\/li>/gi;
  while ((m = liRe.exec(html)) !== null) {
    pairs.push([strip(m[1]), strip(m[2])]);
  }

  return pairs;
}

function strip(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function applyKvToListing(listing: ParsedListing, rawLabel: string, rawValue: string): void {
  const label = rawLabel.toLowerCase().trim();
  const value = rawValue.trim();
  if (!value) return;

  if (/^(?:marka|brand|proizvod|proizvodjac|proizvođač|marka vozila)/.test(label)) {
    if (!listing.make) listing.make = normalizeMake(value);
  }
  if (/^(?:model|model vozila)/.test(label)) {
    if (!listing.model) listing.model = value;
  }
  if (/^(?:godišt|godist|godina|god\.|year|godina proizvodnje)/.test(label)) {
    if (!listing.year) listing.year = parseNum(value);
  }
  if (/^(?:kilomet|km|predjeno|pređeno|kilometr|mileage|stanje km)/.test(label)) {
    if (!listing.mileage) listing.mileage = parseNum(value);
  }
  if (/^(?:gorivo|fuel|vrsta goriva|pogonsko)/.test(label)) {
    if (!listing.fuel) listing.fuel = matchFuel(value);
  }
  if (/^(?:mjenjač|mjenjac|menjač|menjac|transmis|transmission|tip menjača)/.test(label)) {
    if (!listing.transmission) listing.transmission = matchTransmission(value);
  }
  if (/^(?:karoserija|body|tip karoserije|oblik|vrsta vozila)/.test(label)) {
    if (!listing.body) listing.body = matchBody(value);
  }
  if (/^(?:snaga|power|kilovat|kw)/.test(label)) {
    if (!listing.power) listing.power = parseNum(value);
  }
  if (/^(?:konjsk|ks|hp|ps)/.test(label)) {
    if (!listing.powerHP) listing.powerHP = parseNum(value);
  }
  if (/^(?:kubikaž|kubikaz|ccm|zapremina|engine|obim motora|radna zapremina)/.test(label)) {
    if (!listing.engineSize) listing.engineSize = parseEngineSize(value);
  }
  if (/^(?:boja|color|colour)/.test(label)) {
    if (!listing.color) listing.color = value;
  }
  if (/^(?:vrata|doors|broj vrata)/.test(label)) {
    if (!listing.doors) listing.doors = parseDoors(value);
  }
  if (/^(?:sjedišt|sjedist|sjedista|seats|broj sjedišta|broj sjedista)/.test(label)) {
    if (!listing.seats) listing.seats = parseNum(value);
  }
  if (/^(?:pogon|drive|privod)/.test(label)) {
    if (!listing.driveType) listing.driveType = matchDrive(value);
  }
  if (/^(?:grad|city|lokacija|location|mjesto|mesto)/.test(label)) {
    if (!listing.city) listing.city = value;
  }
  if (/^(?:cijena|cena|price|iznos)/.test(label)) {
    if (!listing.price) {
      listing.price = parseNum(value);
      if (/€|EUR/i.test(value)) listing.currency = 'EUR';
      else if (/KM|BAM/i.test(value)) listing.currency = 'KM';
    }
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyJsonLd(listing: ParsedListing, ld: any): void {
  if (!ld) return;
  if (ld.name && !listing.title) listing.title = String(ld.name);
  if (ld.description && !listing.description) listing.description = stripHtml(String(ld.description));

  if (ld.image) {
    const imgs = Array.isArray(ld.image) ? ld.image : [ld.image];
    const urls = imgs.map((i: any) => typeof i === 'string' ? i : i?.url).filter(Boolean);
    if (urls.length > 0) {
      listing.photos = listing.photos ? [...new Set([...listing.photos, ...urls])] : urls;
    }
  }

  if (ld.offers) {
    const offer = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
    if (offer?.price && !listing.price) listing.price = parseNum(String(offer.price));
    if (offer?.priceCurrency && !listing.currency) listing.currency = String(offer.priceCurrency);
  }

  if (ld.brand?.name && !listing.make) listing.make = normalizeMake(String(ld.brand.name));
  if (ld.model && !listing.model) listing.model = String(ld.model);
  if (ld.vehicleModelDate && !listing.year) listing.year = parseNum(String(ld.vehicleModelDate));
  if (ld.mileageFromOdometer?.value && !listing.mileage) listing.mileage = parseNum(String(ld.mileageFromOdometer.value));
  if (ld.fuelType && !listing.fuel) listing.fuel = matchFuel(String(ld.fuelType));
  if (ld.vehicleTransmission && !listing.transmission) listing.transmission = matchTransmission(String(ld.vehicleTransmission));
  if (ld.vehicleEngine?.engineDisplacement?.value && !listing.engineSize) {
    listing.engineSize = parseEngineSize(String(ld.vehicleEngine.engineDisplacement.value));
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Fallback: populate listing from og: meta tags. */
function parseFromMetaTags(html: string, listing: ParsedListing): ParsedListing {
  if (!listing.title) listing.title = getMetaContent(html, 'og:title') || undefined;
  if (!listing.description) listing.description = getMetaContent(html, 'og:description') || undefined;

  if (!listing.photos || listing.photos.length === 0) {
    const ogImages = getAllOgImages(html);
    if (ogImages.length > 0) listing.photos = ogImages;
  }

  // Guess make/model from title
  if (!listing.make && listing.title) {
    const guess = guessMakeModel(listing.title);
    if (guess.make) listing.make = guess.make;
    if (guess.model) listing.model = guess.model;
  }

  // Year from title/desc
  if (!listing.year) {
    listing.year = extractYear(listing.title || '') || extractYear(listing.description || '');
  }

  return listing;
}

// ---------------------------------------------------------------------------
// Router — select parser by domain
// ---------------------------------------------------------------------------

function parseByDomain(html: string, url: string): ParsedListing {
  const domain = getDomainFromUrl(url);

  switch (domain) {
    case 'autoplac.ba':
      return parseAutoPlac(html, url);
    case 'autobum.ba':
      return parseAutoBum(html, url);
    case 'polovniautomobili.com':
      return parsePolovniAutomobili(html, url);
    default: {
      const listing: ParsedListing = { importedFrom: domain || undefined, sourceUrl: url };
      return parseFromMetaTags(html, listing);
    }
  }
}

/** Clean the listing: remove undefined/null fields. */
function cleanListing(listing: ParsedListing): Partial<ParsedListing> {
  return Object.fromEntries(
    Object.entries(listing).filter(([, v]) => v !== undefined && v !== null),
  );
}

// ---------------------------------------------------------------------------
// API Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL je obavezan.' },
        { status: 400 },
      );
    }

    const domain = getDomainFromUrl(url);
    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Neispravan URL format.' },
        { status: 400 },
      );
    }

    if (!SUPPORTED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        {
          success: false,
          error: `Nepodržani sajt: ${domain}. Podržani: ${SUPPORTED_DOMAINS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    let listing: Partial<ParsedListing>;

    if (domain === 'olx.ba') {
      // OLX.ba — use their open API directly (no Cloudflare!)
      try {
        listing = cleanListing(await parseOlx(url));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Nepoznata greška';
        return NextResponse.json(
          { success: false, error: msg },
          { status: 500 },
        );
      }
    } else {
      // All other sites — fetch HTML and parse
      let html: string;
      try {
        html = await fetchHtml(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Nepoznata greška';
        return NextResponse.json(
          { success: false, error: `Greška prilikom dohvatanja stranice: ${msg}` },
          { status: 500 },
        );
      }
      listing = cleanListing(parseByDomain(html, url));
    }

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error('Import listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Greška prilikom obrade zahtjeva.' },
      { status: 500 },
    );
  }
}
