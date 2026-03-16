import { NextRequest, NextResponse } from 'next/server';
import type { FuelType, TransmissionType, BodyType } from '@/types';

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
  price?: number;
  currency?: string;
  description?: string;
  photos?: string[];
  city?: string;
  equipment?: string[];
  power?: number;
  engineSize?: number;
  color?: string;
  doors?: number;
  importedFrom?: string;
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
// Utility helpers
// ---------------------------------------------------------------------------

function getDomainFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Extract the content attribute of a <meta> tag by property or name. */
function getMetaContent(html: string, attr: string): string | null {
  // Handles both property="og:title" and name="description" etc.
  // Matches single or double quotes, and content before or after the property attr.
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapeRegex(attr)}["'][^>]+content=["']([^"']*)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapeRegex(attr)}["']`,
      'i',
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeHtmlEntities(m[1].trim());
  }
  return null;
}

/** Get all og:image values (some pages set more than one). */
function getAllOgImages(html: string): string[] {
  const images: string[] = [];
  const re =
    /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']og:image["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const url = m[1] || m[2];
    if (url) images.push(url.trim());
  }
  return images;
}

/** Extract the <title>…</title> content. */
function getTitleTag(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? decodeHtmlEntities(m[1].trim()) : null;
}

/** Decode common HTML entities. */
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

/** Strip HTML tags. */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Parse a number from a string, ignoring non-numeric chars except dots/commas. */
function parseNumber(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  // Remove everything except digits, dots, and commas
  const cleaned = raw.replace(/[^\d.,]/g, '');
  if (!cleaned) return undefined;
  // Normalize: treat comma as decimal only if it's followed by 1-2 digits at end
  // Otherwise treat commas as thousand-separators
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? undefined : Math.round(n);
}

// ---------------------------------------------------------------------------
// Fuel / Transmission / Body mapping helpers
// ---------------------------------------------------------------------------

const FUEL_MAP: Record<string, FuelType> = {
  benzin: 'benzin',
  petrol: 'benzin',
  gasoline: 'benzin',
  dizel: 'dizel',
  diesel: 'dizel',
  plin: 'plin',
  lpg: 'plin',
  'benzin+plin': 'benzin+plin',
  'benzin + plin': 'benzin+plin',
  hibrid: 'hibrid',
  hybrid: 'hibrid',
  elektricni: 'elektricni',
  električni: 'elektricni',
  electric: 'elektricni',
  elektro: 'elektricni',
  'plug-in hybrid': 'hibrid',
  'plug-in hibrid': 'hibrid',
  'tng / cng': 'plin',
  gas: 'plin',
};

const TRANSMISSION_MAP: Record<string, TransmissionType> = {
  manuelni: 'manuelni',
  manuelno: 'manuelni',
  manual: 'manuelni',
  'ručni': 'manuelni',
  automatski: 'automatski',
  automatik: 'automatski',
  automatic: 'automatski',
  poluautomatski: 'poluautomatski',
  poluautomatik: 'poluautomatski',
  tiptronic: 'automatski',
  dsg: 'automatski',
  cvt: 'automatski',
};

const BODY_MAP: Record<string, BodyType> = {
  limuzina: 'limuzina',
  sedan: 'limuzina',
  karavan: 'karavan',
  estate: 'karavan',
  wagon: 'karavan',
  kombi: 'kombi',
  hatchback: 'hatchback',
  hečbek: 'hatchback',
  suv: 'SUV',
  'suv / terensko vozilo': 'SUV',
  terenac: 'SUV',
  coupe: 'coupe',
  kupe: 'coupe',
  cabrio: 'cabrio',
  kabriolet: 'cabrio',
  pickup: 'pickup',
  monovolumen: 'monovolumen',
  minivan: 'monovolumen',
};

function matchFuel(raw: string): FuelType | undefined {
  const lower = raw.toLowerCase().trim();
  return FUEL_MAP[lower];
}

function matchTransmission(raw: string): TransmissionType | undefined {
  const lower = raw.toLowerCase().trim();
  return TRANSMISSION_MAP[lower];
}

function matchBody(raw: string): BodyType | undefined {
  const lower = raw.toLowerCase().trim();
  return BODY_MAP[lower];
}

// ---------------------------------------------------------------------------
// Commonly-known car makes for guessing make/model from title
// ---------------------------------------------------------------------------

const KNOWN_MAKES = [
  'Audi', 'BMW', 'Citroen', 'Citroën', 'Dacia', 'Fiat', 'Ford', 'Honda',
  'Hyundai', 'Jeep', 'Kia', 'Land Rover', 'Mazda', 'Mercedes-Benz', 'Mercedes',
  'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault', 'Seat', 'SEAT',
  'Škoda', 'Skoda', 'Toyota', 'Volkswagen', 'VW', 'Volvo', 'Chevrolet',
  'Chrysler', 'Dodge', 'Alfa Romeo', 'Mini', 'MINI', 'Mitsubishi', 'Subaru',
  'Suzuki', 'Tesla', 'Lexus', 'Infiniti', 'Jaguar', 'Maserati', 'Ferrari',
  'Lamborghini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'Lancia',
  'Saab', 'Smart', 'Ssangyong', 'Daewoo', 'Zastava', 'Yugo',
];

function guessMakeModelFromTitle(title: string): { make?: string; model?: string } {
  if (!title) return {};
  for (const make of KNOWN_MAKES) {
    const idx = title.toLowerCase().indexOf(make.toLowerCase());
    if (idx !== -1) {
      const normalizedMake = normalizeCarMake(make);
      // Take the word(s) right after the make as model
      const afterMake = title.substring(idx + make.length).trim();
      const modelParts = afterMake.split(/[\s,]+/);
      // Take up to 2 tokens as model (e.g. "Golf 7", "320d", "A3 Sportback")
      const modelTokens: string[] = [];
      for (const part of modelParts) {
        if (!part || part.length === 0) break;
        // Stop if we hit a year-like token or a price
        if (/^\d{4}$/.test(part) && Number(part) >= 1990) break;
        if (/^\d+[\.,]?\d*\s*(km|KM|EUR|€|BAM)/.test(part)) break;
        modelTokens.push(part);
        if (modelTokens.length >= 3) break;
      }
      return {
        make: normalizedMake,
        model: modelTokens.length > 0 ? modelTokens.join(' ') : undefined,
      };
    }
  }
  return {};
}

function normalizeCarMake(raw: string): string {
  const map: Record<string, string> = {
    vw: 'Volkswagen',
    mercedes: 'Mercedes-Benz',
    'citroën': 'Citroen',
    skoda: 'Škoda',
    mini: 'Mini',
    seat: 'Seat',
  };
  return map[raw.toLowerCase()] || raw;
}

/** Try to find a year (4-digit number between 1990 and current year + 1) in text. */
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
// Extract all gallery/slider image URLs from HTML
// ---------------------------------------------------------------------------

function extractImageUrls(html: string): string[] {
  const urls = new Set<string>();

  // og:image tags (already captured by getAllOgImages, but include here as well)
  const ogImages = getAllOgImages(html);
  ogImages.forEach((u) => urls.add(u));

  // Common gallery patterns - images inside data attributes or JSON
  const dataPatterns = [
    /data-src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
    /data-full=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
    /data-original=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
    /data-lazy=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
    /data-image=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi,
  ];
  for (const re of dataPatterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      if (m[1] && m[1].startsWith('http')) urls.add(m[1]);
    }
  }

  // Image tags inside gallery/slider containers
  const gallerySection =
    html.match(
      /class=["'][^"']*(?:gallery|slider|carousel|swiper|lightbox|photo)[^"']*["'][^>]*>[\s\S]*?(?:<\/div>|<\/section>|<\/ul>)/gi,
    ) || [];
  for (const section of gallerySection) {
    const imgRe = /src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)/gi;
    let m: RegExpExecArray | null;
    while ((m = imgRe.exec(section)) !== null) {
      if (m[1] && m[1].startsWith('http') && !m[1].includes('icon') && !m[1].includes('logo')) {
        urls.add(m[1]);
      }
    }
  }

  return Array.from(urls);
}

// ---------------------------------------------------------------------------
// Price extraction helpers
// ---------------------------------------------------------------------------

function extractPrice(html: string): { price?: number; currency?: string } {
  // Try various price patterns commonly found in car listing sites
  const pricePatterns = [
    // "12.500 KM" or "12500 KM"
    /(\d[\d.,]*)\s*(?:KM|BAM|konvertibiln)/i,
    // "€ 12.500" or "12.500 €" or "12500 EUR"
    /€\s*(\d[\d.,]*)|(\d[\d.,]*)\s*€|(\d[\d.,]*)\s*EUR/i,
    // "Cijena: 12.500" or "Price: 12500"
    /(?:cijena|cena|price)[:\s]*(\d[\d.,]*)/i,
  ];

  for (const re of pricePatterns) {
    const m = html.match(re);
    if (m) {
      const numStr = m[1] || m[2] || m[3] || m[4];
      const price = parseNumber(numStr);
      if (price && price > 0) {
        const isEur = re.source.includes('€') || re.source.includes('EUR');
        const currency = /€|EUR/i.test(m[0]) ? 'EUR' : 'KM';
        return { price, currency: isEur ? 'EUR' : currency };
      }
    }
  }

  return {};
}

// ---------------------------------------------------------------------------
// Generic fallback parser (works on any site via meta tags)
// ---------------------------------------------------------------------------

function parseGeneric(html: string, url: string): ParsedListing {
  const title = getMetaContent(html, 'og:title') || getTitleTag(html) || undefined;
  const description =
    getMetaContent(html, 'og:description') ||
    getMetaContent(html, 'description') ||
    undefined;
  const photos = extractImageUrls(html);
  const { price, currency } = extractPrice(html);
  const { make, model } = guessMakeModelFromTitle(title || '');
  const year = extractYear(title || '') || extractYear(description || '');

  return {
    title,
    make,
    model,
    year,
    price,
    currency,
    description,
    photos: photos.length > 0 ? photos : undefined,
    importedFrom: getDomainFromUrl(url) || undefined,
  };
}

// ---------------------------------------------------------------------------
// OLX.ba parser
// ---------------------------------------------------------------------------

function parseOlx(html: string, url: string): ParsedListing {
  const listing = parseGeneric(html, url);
  listing.importedFrom = 'olx.ba';

  // OLX.ba uses a detail/properties section with label-value pairs.
  // Common pattern: <div class="..attribute..">Label</div> <div>Value</div>
  // or table rows, or definition lists.

  // Extract key-value pairs from the properties/details section
  const kvPairs = extractKeyValuePairs(html);

  applyKvPairsToListing(listing, kvPairs);

  // OLX.ba price is often in a prominent element
  if (!listing.price) {
    const priceMatch = html.match(
      /class=["'][^"']*price[^"']*["'][^>]*>([^<]*)/i,
    );
    if (priceMatch) {
      const { price, currency } = extractPriceFromText(priceMatch[1]);
      listing.price = price;
      listing.currency = currency;
    }
  }

  // OLX.ba city is sometimes in a location span
  if (!listing.city) {
    const locMatch = html.match(
      /class=["'][^"']*(?:location|lokacija)[^"']*["'][^>]*>([^<]*)/i,
    );
    if (locMatch) {
      listing.city = stripTags(locMatch[1]).trim();
    }
  }

  return listing;
}

// ---------------------------------------------------------------------------
// AutoPlac.ba parser
// ---------------------------------------------------------------------------

function parseAutoPlac(html: string, url: string): ParsedListing {
  const listing = parseGeneric(html, url);
  listing.importedFrom = 'autoplac.ba';

  const kvPairs = extractKeyValuePairs(html);
  applyKvPairsToListing(listing, kvPairs);

  // AutoPlac often has structured spec tables
  // Try to get specs from a table or definition list
  const specTableMatch = html.match(
    /<table[^>]*class=["'][^"']*(?:spec|detail|info|osobine|karakteristike)[^"']*["'][^>]*>([\s\S]*?)<\/table>/i,
  );
  if (specTableMatch) {
    const rows = specTableMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    for (const row of rows) {
      const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi) || [];
      if (cells.length >= 2 && cells[0] && cells[1]) {
        const label = stripTags(cells[0]).toLowerCase();
        const value = stripTags(cells[1]);
        applyKvToListing(listing, label, value);
      }
    }
  }

  return listing;
}

// ---------------------------------------------------------------------------
// AutoBum.ba parser
// ---------------------------------------------------------------------------

function parseAutoBum(html: string, url: string): ParsedListing {
  const listing = parseGeneric(html, url);
  listing.importedFrom = 'autobum.ba';

  const kvPairs = extractKeyValuePairs(html);
  applyKvPairsToListing(listing, kvPairs);

  // AutoBum.ba may have a JSON-LD structured data block
  const jsonLdMatch = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (jsonLdMatch) {
    try {
      const ld = JSON.parse(jsonLdMatch[1]);
      if (ld) {
        if (ld.name && !listing.title) listing.title = ld.name;
        if (ld.description && !listing.description) listing.description = ld.description;
        if (ld.image) {
          const imgs = Array.isArray(ld.image) ? ld.image : [ld.image];
          const allImgs = listing.photos ? listing.photos.concat(imgs) : imgs;
          listing.photos = Array.from(new Set(allImgs));
        }
        if (ld.offers) {
          const offer = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
          if (offer?.price && !listing.price) listing.price = parseNumber(String(offer.price));
          if (offer?.priceCurrency && !listing.currency) listing.currency = offer.priceCurrency;
        }
        if (ld.brand?.name && !listing.make) listing.make = ld.brand.name;
        if (ld.model && !listing.model) listing.model = ld.model;
        if (ld.vehicleModelDate && !listing.year)
          listing.year = parseNumber(String(ld.vehicleModelDate));
        if (ld.mileageFromOdometer?.value && !listing.mileage)
          listing.mileage = parseNumber(String(ld.mileageFromOdometer.value));
        if (ld.fuelType && !listing.fuel) listing.fuel = matchFuel(ld.fuelType);
        if (ld.vehicleTransmission && !listing.transmission)
          listing.transmission = matchTransmission(ld.vehicleTransmission);
      }
    } catch {
      // JSON-LD parse failed, continue with regex parsing
    }
  }

  return listing;
}

// ---------------------------------------------------------------------------
// PoslovniAutomobili.com (polovniautomobili.com) parser
// ---------------------------------------------------------------------------

function parsePolovniAutomobili(html: string, url: string): ParsedListing {
  const listing = parseGeneric(html, url);
  listing.importedFrom = 'polovniautomobili.com';

  // This site uses structured detail tables extensively
  const kvPairs = extractKeyValuePairs(html);
  applyKvPairsToListing(listing, kvPairs);

  // PoslovniAutomobili uses a div-based details section
  // Pattern: <div class="divider">Label</div> <div class="value">Value</div>
  const detailSections =
    html.match(
      /class=["'][^"']*(?:divider|uk-width)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*>([\s\S]*?)<\/div>/gi,
    ) || [];
  for (const section of detailSections) {
    const parts = section.match(/>([^<]+)</g);
    if (parts && parts.length >= 2) {
      const label = parts[0].replace(/^>|<$/g, '').trim().toLowerCase();
      const value = parts[1].replace(/^>|<$/g, '').trim();
      applyKvToListing(listing, label, value);
    }
  }

  // Try JSON-LD as well (this site sometimes includes it)
  const jsonLdMatch = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (jsonLdMatch) {
    try {
      const ld = JSON.parse(jsonLdMatch[1]);
      if (ld?.['@type'] === 'Car' || ld?.['@type'] === 'Vehicle') {
        if (ld.brand?.name && !listing.make) listing.make = ld.brand.name;
        if (ld.model && !listing.model) listing.model = ld.model;
        if (ld.vehicleModelDate && !listing.year)
          listing.year = parseNumber(String(ld.vehicleModelDate));
        if (ld.offers?.price && !listing.price)
          listing.price = parseNumber(String(ld.offers.price));
        if (ld.offers?.priceCurrency && !listing.currency)
          listing.currency = ld.offers.priceCurrency;
      }
    } catch {
      // Ignore JSON-LD parse errors
    }
  }

  // City/location often in a specific element
  if (!listing.city) {
    const cityMatch = html.match(
      /class=["'][^"']*(?:city|location|mesto|lokacija)[^"']*["'][^>]*>([^<]+)/i,
    );
    if (cityMatch) {
      listing.city = cityMatch[1].trim();
    }
  }

  return listing;
}

// ---------------------------------------------------------------------------
// Shared KV extraction and mapping helpers
// ---------------------------------------------------------------------------

/** Extract label-value pairs from common HTML patterns. */
function extractKeyValuePairs(html: string): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];

  // Pattern 1: <dt>Label</dt><dd>Value</dd>
  const dlRe = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let m: RegExpExecArray | null;
  while ((m = dlRe.exec(html)) !== null) {
    pairs.push([stripTags(m[1]).trim(), stripTags(m[2]).trim()]);
  }

  // Pattern 2: <th>Label</th><td>Value</td>
  const thTdRe = /<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi;
  while ((m = thTdRe.exec(html)) !== null) {
    pairs.push([stripTags(m[1]).trim(), stripTags(m[2]).trim()]);
  }

  // Pattern 3: label-value div pairs (common in modern sites)
  // <div class="...label...">Label</div> ... <div class="...value...">Value</div>
  const divPairRe =
    /class=["'][^"']*(?:label|key|name|property|attribute)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>\s*(?:<[^>]*>)*\s*class=["'][^"']*(?:value|data|info|result)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|span|p)>/gi;
  while ((m = divPairRe.exec(html)) !== null) {
    pairs.push([stripTags(m[1]).trim(), stripTags(m[2]).trim()]);
  }

  // Pattern 4: <li> with strong/span label and value
  const liRe =
    /<li[^>]*>\s*<(?:strong|span|b)[^>]*>([\s\S]*?)<\/(?:strong|span|b)>\s*:?\s*([\s\S]*?)<\/li>/gi;
  while ((m = liRe.exec(html)) !== null) {
    pairs.push([stripTags(m[1]).trim(), stripTags(m[2]).trim()]);
  }

  return pairs;
}

/** Extract price from a text string. */
function extractPriceFromText(text: string): { price?: number; currency?: string } {
  const cleaned = stripTags(text);
  const price = parseNumber(cleaned);
  let currency: string | undefined;
  if (/€|EUR/i.test(cleaned)) currency = 'EUR';
  else if (/KM|BAM/i.test(cleaned)) currency = 'KM';
  return { price, currency };
}

/** Apply an array of key-value pairs to the listing. */
function applyKvPairsToListing(listing: ParsedListing, pairs: Array<[string, string]>): void {
  for (const [label, value] of pairs) {
    applyKvToListing(listing, label, value);
  }
}

/** Map a single label-value pair to the appropriate listing field. */
function applyKvToListing(listing: ParsedListing, rawLabel: string, rawValue: string): void {
  const label = rawLabel.toLowerCase().trim();
  const value = rawValue.trim();
  if (!value || value.length === 0) return;

  // Make / Brand
  if (/^(?:marka|brand|proizvod|proizvodjac|proizvođač|marka vozila)/.test(label)) {
    if (!listing.make) listing.make = normalizeCarMake(value);
  }

  // Model
  if (/^(?:model|model vozila)/.test(label)) {
    if (!listing.model) listing.model = value;
  }

  // Year
  if (/^(?:godišt|godist|godina|god\.|year|godina proizvodnje)/.test(label)) {
    if (!listing.year) listing.year = parseNumber(value);
  }

  // Mileage
  if (/^(?:kilomet|km|predjeno|pređeno|kilometr|mileage|stanje km)/.test(label)) {
    if (!listing.mileage) listing.mileage = parseNumber(value);
  }

  // Fuel
  if (/^(?:gorivo|fuel|vrsta goriva|motor|pogonsko)/.test(label)) {
    if (!listing.fuel) listing.fuel = matchFuel(value);
  }

  // Transmission
  if (/^(?:mjenjač|mjenjac|menjač|menjac|transmis|transmission|tip menjača)/.test(label)) {
    if (!listing.transmission) listing.transmission = matchTransmission(value);
  }

  // Body type
  if (/^(?:karoserija|body|tip|oblik|vrsta vozila|karoserija vozila)/.test(label)) {
    if (!listing.body) listing.body = matchBody(value);
  }

  // Power
  if (/^(?:snaga|power|kw|kilovat|konjsk|ks|hp)/.test(label)) {
    if (!listing.power) {
      // Try to extract kW first, then HP and convert
      const kwMatch = value.match(/(\d+)\s*kw/i);
      const hpMatch = value.match(/(\d+)\s*(?:ks|hp|ps|cp)/i);
      if (kwMatch) {
        listing.power = Number(kwMatch[1]);
      } else if (hpMatch) {
        listing.power = Math.round(Number(hpMatch[1]) * 0.7355);
      } else {
        listing.power = parseNumber(value);
      }
    }
  }

  // Engine size
  if (/^(?:kubikaž|kubikaz|ccm|zapremina|engine|obim motora|radna zapremina)/.test(label)) {
    if (!listing.engineSize) listing.engineSize = parseNumber(value);
  }

  // Color
  if (/^(?:boja|color|colour)/.test(label)) {
    if (!listing.color) listing.color = value;
  }

  // Doors
  if (/^(?:vrata|doors|broj vrata)/.test(label)) {
    if (!listing.doors) listing.doors = parseNumber(value);
  }

  // City / Location
  if (/^(?:grad|city|lokacija|location|mjesto|mesto)/.test(label)) {
    if (!listing.city) listing.city = value;
  }

  // Price
  if (/^(?:cijena|cena|price|iznos)/.test(label)) {
    if (!listing.price) {
      const { price, currency } = extractPriceFromText(value);
      listing.price = price;
      listing.currency = currency;
    }
  }
}

// ---------------------------------------------------------------------------
// Router - select parser by domain
// ---------------------------------------------------------------------------

function parseHtml(html: string, url: string): ParsedListing {
  const domain = getDomainFromUrl(url);

  let listing: ParsedListing;

  switch (domain) {
    case 'olx.ba':
      listing = parseOlx(html, url);
      break;
    case 'autoplac.ba':
      listing = parseAutoPlac(html, url);
      break;
    case 'autobum.ba':
      listing = parseAutoBum(html, url);
      break;
    case 'polovniautomobili.com':
      listing = parsePolovniAutomobili(html, url);
      break;
    default:
      listing = parseGeneric(html, url);
      break;
  }

  // Final pass: if make/model still missing, try to guess from title
  if (!listing.make || !listing.model) {
    const titleText = listing.title || '';
    const descText = listing.description || '';
    const combined = `${titleText} ${descText}`;
    const guess = guessMakeModelFromTitle(combined);
    if (!listing.make && guess.make) listing.make = guess.make;
    if (!listing.model && guess.model) listing.model = guess.model;
  }

  // If year still missing, try from title/description
  if (!listing.year) {
    listing.year =
      extractYear(listing.title || '') || extractYear(listing.description || '');
  }

  // Remove undefined fields to keep response clean
  return Object.fromEntries(
    Object.entries(listing).filter(([, v]) => v !== undefined && v !== null),
  ) as ParsedListing;
}

// ---------------------------------------------------------------------------
// API Route Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    // Validate URL presence
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL je obavezan.' },
        { status: 400 },
      );
    }

    // Validate URL format
    const domain = getDomainFromUrl(url);
    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Neispravan URL format.' },
        { status: 400 },
      );
    }

    // Validate supported domain
    if (!SUPPORTED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        {
          success: false,
          error: `Nepodržani sajt: ${domain}. Podržani sajtovi: ${SUPPORTED_DOMAINS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Fetch the page HTML
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'bs,hr,sr,en;q=0.5',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Greška prilikom dohvatanja stranice: HTTP ${response.status}`,
          },
          { status: 500 },
        );
      }

      html = await response.text();
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Nepoznata greška';
      return NextResponse.json(
        {
          success: false,
          error: `Greška prilikom dohvatanja stranice: ${message}`,
        },
        { status: 500 },
      );
    }

    // Parse the HTML into listing data
    const listing = parseHtml(html, url);

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error('Import listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Greška prilikom obrade zahtjeva.' },
      { status: 500 },
    );
  }
}
