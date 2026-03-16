import { NextRequest, NextResponse } from 'next/server';
import type { FuelType, TransmissionType, BodyType, DriveType } from '@/types';
import { bihCities } from '@/lib/car-data';

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
  power?: number;
  powerHP?: number;
  engineSize?: number;
  price?: number;
  currency?: string;
  description?: string;
  city?: string;
  driveType?: DriveType;
  registrationUntil?: string;
  importedFrom?: string;
  sourceUrl?: string;
}

// ---------------------------------------------------------------------------
// Mapping tables (same as import-listing)
// ---------------------------------------------------------------------------

const FUEL_MAP: Record<string, FuelType> = {
  benzin: 'benzin', petrol: 'benzin', gasoline: 'benzin',
  dizel: 'dizel', diesel: 'dizel',
  plin: 'plin', lpg: 'plin', 'tng / cng': 'plin', gas: 'plin', tng: 'plin', cng: 'plin',
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
  const key = raw.toLowerCase().trim();
  // Direct match
  if (FUEL_MAP[key]) return FUEL_MAP[key];
  // Partial match: "Dizel (Euro5)" → "dizel"
  for (const [k, v] of Object.entries(FUEL_MAP)) {
    if (key.startsWith(k) || key.includes(k)) return v;
  }
  return undefined;
}

function matchTransmission(raw: string): TransmissionType | undefined {
  const key = raw.toLowerCase().trim();
  if (TRANSMISSION_MAP[key]) return TRANSMISSION_MAP[key];
  for (const [k, v] of Object.entries(TRANSMISSION_MAP)) {
    if (key.startsWith(k) || key.includes(k)) return v;
  }
  return undefined;
}

function matchBody(raw: string): BodyType | undefined {
  const key = raw.toLowerCase().trim();
  if (BODY_MAP[key]) return BODY_MAP[key];
  for (const [k, v] of Object.entries(BODY_MAP)) {
    if (key.startsWith(k) || key.includes(k)) return v;
  }
  return undefined;
}

function matchDrive(raw: string): DriveType | undefined {
  const key = raw.toLowerCase().trim();
  if (DRIVE_MAP[key]) return DRIVE_MAP[key];
  for (const [k, v] of Object.entries(DRIVE_MAP)) {
    if (key.startsWith(k) || key.includes(k)) return v;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Number parsing
// ---------------------------------------------------------------------------

function parseNum(raw: string): number | undefined {
  const cleaned = raw.replace(/[^\d.,]/g, '');
  if (!cleaned) return undefined;
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const n = parseFloat(normalized);
  return isNaN(n) ? undefined : Math.round(n);
}

function parseEngineSize(raw: string): number | undefined {
  const s = raw.trim();
  const n = parseFloat(s.replace(',', '.'));
  if (isNaN(n)) return undefined;
  if (n < 100) return Math.round(n * 1000);
  return Math.round(n);
}

// ---------------------------------------------------------------------------
// Make/model detection
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

// ---------------------------------------------------------------------------
// Label patterns for matching (aggressive, multiple variations)
// ---------------------------------------------------------------------------

interface LabelMatcher {
  patterns: RegExp[];
  apply: (listing: ParsedListing, value: string) => void;
}

const LABEL_MATCHERS: LabelMatcher[] = [
  {
    patterns: [/^marka$/i, /^proizvod/i, /^proizvodjac/i, /^proizvođač/i, /^brand/i, /^marka\s+vozila/i],
    apply: (l, v) => { if (!l.make) l.make = normalizeMake(v); },
  },
  {
    patterns: [/^model$/i, /^model\s+vozila/i],
    apply: (l, v) => { if (!l.model) l.model = v; },
  },
  {
    patterns: [/^godišt/i, /^godist/i, /^godina$/i, /^god\.?$/i, /^year$/i, /^godina\s+proizvodnje/i],
    apply: (l, v) => { if (!l.year) l.year = parseNum(v); },
  },
  {
    patterns: [/^kilomet/i, /^km$/i, /^predjeno/i, /^pređeno/i, /^mileage$/i, /^stanje\s+km/i],
    apply: (l, v) => { if (!l.mileage) l.mileage = parseNum(v); },
  },
  {
    patterns: [/^gorivo$/i, /^fuel$/i, /^vrsta\s+goriva/i, /^pogonsko/i],
    apply: (l, v) => { if (!l.fuel) l.fuel = matchFuel(v); },
  },
  {
    patterns: [/^mjenjač/i, /^mjenjac$/i, /^menjač/i, /^menjac$/i, /^transmis/i, /^tip\s+menjač/i],
    apply: (l, v) => { if (!l.transmission) l.transmission = matchTransmission(v); },
  },
  {
    patterns: [/^pogon$/i, /^drive$/i, /^privod$/i],
    apply: (l, v) => { if (!l.driveType) l.driveType = matchDrive(v); },
  },
  {
    patterns: [/^boja$/i, /^color$/i, /^colour$/i, /^boja\s+vozila/i],
    apply: (l, v) => { if (!l.color) l.color = v; },
  },
  {
    patterns: [/^kubikaž/i, /^kubikaz/i, /^ccm$/i, /^zapremina/i, /^obim\s+motora/i, /^radna\s+zapremina/i],
    apply: (l, v) => { if (!l.engineSize) l.engineSize = parseEngineSize(v); },
  },
  {
    patterns: [/^kilovat/i, /^kw$/i, /^snaga.*kw/i],
    apply: (l, v) => { if (!l.power) l.power = parseNum(v); },
  },
  {
    patterns: [/^konjsk/i, /^ks$/i, /^hp$/i, /^ps$/i, /^snaga.*ks/i, /^snaga.*hp/i],
    apply: (l, v) => { if (!l.powerHP) l.powerHP = parseNum(v); },
  },
  {
    patterns: [/^tip\s+vozila/i, /^karoserija/i, /^body/i, /^tip\s+karoserije/i, /^oblik/i, /^vrsta\s+vozila/i],
    apply: (l, v) => { if (!l.body) l.body = matchBody(v); },
  },
  {
    patterns: [/^registrovan\s+do/i, /^reg\.?\s+do/i, /^registracija/i],
    apply: (l, v) => { if (!l.registrationUntil) l.registrationUntil = v; },
  },
  {
    patterns: [/^stanje$/i, /^condition$/i],
    apply: () => { /* skip — not mapped */ },
  },
  {
    patterns: [/^cijena$/i, /^cena$/i, /^price$/i, /^iznos$/i],
    apply: (l, v) => {
      if (!l.price) {
        l.price = parseNum(v);
        if (/€|EUR/i.test(v)) l.currency = 'EUR';
        else if (/KM|BAM/i.test(v)) l.currency = 'KM';
      }
    },
  },
  {
    patterns: [/^grad$/i, /^lokacija$/i, /^city$/i, /^location$/i, /^mjesto$/i, /^mesto$/i],
    apply: (l, v) => { if (!l.city) l.city = v; },
  },
];

// Labels to skip (not useful data)
const SKIP_LABELS = [
  /^stanje$/i, /^condition$/i, /^objavljeno/i, /^datum/i, /^id\s+oglasa/i,
  /^broj\s+oglasa/i, /^pregled/i, /^views$/i, /^kategorija/i, /^category/i,
  /^podkategorija/i, /^vrsta\s+oglasa/i, /^tip\s+oglasa/i,
];

function matchLabel(label: string): LabelMatcher | undefined {
  const trimmed = label.trim();
  for (const matcher of LABEL_MATCHERS) {
    for (const pattern of matcher.patterns) {
      if (pattern.test(trimmed)) return matcher;
    }
  }
  return undefined;
}

function isSkipLabel(label: string): boolean {
  return SKIP_LABELS.some(p => p.test(label.trim()));
}

// ---------------------------------------------------------------------------
// Main text parser
// ---------------------------------------------------------------------------

function parseListingText(text: string, sourceUrl?: string): ParsedListing {
  const listing: ParsedListing = {
    sourceUrl,
    importedFrom: sourceUrl ? detectSource(sourceUrl) : 'manual-paste',
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const descriptionParts: string[] = [];
  let titleCandidates: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try "Label: Value" pattern
    const colonMatch = line.match(/^([^:]{2,40}):\s+(.+)$/);
    if (colonMatch) {
      const [, rawLabel, rawValue] = colonMatch;
      const matcher = matchLabel(rawLabel);
      if (matcher) {
        matcher.apply(listing, rawValue.trim());
        continue;
      }
      if (isSkipLabel(rawLabel)) continue;
    }

    // Try "Label\tValue" pattern (tab-separated)
    const tabMatch = line.match(/^([^\t]{2,40})\t+(.+)$/);
    if (tabMatch) {
      const [, rawLabel, rawValue] = tabMatch;
      const matcher = matchLabel(rawLabel);
      if (matcher) {
        matcher.apply(listing, rawValue.trim());
        continue;
      }
      if (isSkipLabel(rawLabel)) continue;
    }

    // Try "Label  Value" pattern (multiple spaces)
    const spaceMatch = line.match(/^([A-Za-zčćžšđČĆŽŠĐ\s()]{2,40})\s{2,}(.+)$/);
    if (spaceMatch) {
      const [, rawLabel, rawValue] = spaceMatch;
      const matcher = matchLabel(rawLabel.trim());
      if (matcher) {
        matcher.apply(listing, rawValue.trim());
        continue;
      }
    }

    // Detect "Kilovati (kW): 110" or "Kilovati (kW) 110" specifically
    const kwLine = line.match(/kilovat[ie]?\s*\(?\s*kw\s*\)?\s*[:\s]\s*(\d+)/i);
    if (kwLine && !listing.power) {
      listing.power = parseInt(kwLine[1]);
      continue;
    }

    // Detect "Konjskih snaga (KS): 150" or "KS 150"
    const hpLine = line.match(/(?:konjsk\w+\s+snag\w+|ks)\s*\(?\s*(?:ks|hp)?\s*\)?\s*[:\s]\s*(\d+)/i);
    if (hpLine && !listing.powerHP) {
      listing.powerHP = parseInt(hpLine[1]);
      continue;
    }

    // Detect standalone price: "25.000 KM" or "25,000 KM" or "Po dogovoru"
    const priceMatch = line.match(/^(\d[\d.,]*)\s*(KM|EUR|€|BAM)\s*$/i);
    if (priceMatch && !listing.price) {
      listing.price = parseNum(priceMatch[1]);
      if (/€|EUR/i.test(priceMatch[2])) listing.currency = 'EUR';
      else listing.currency = 'KM';
      continue;
    }

    // Detect price embedded in longer line
    if (!listing.price) {
      const embeddedPrice = line.match(/(\d{1,3}(?:[.,]\d{3})*)\s*(KM|EUR|€|BAM)/i);
      if (embeddedPrice) {
        listing.price = parseNum(embeddedPrice[1]);
        if (/€|EUR/i.test(embeddedPrice[2])) listing.currency = 'EUR';
        else listing.currency = 'KM';
        continue;
      }
    }

    // Detect "Po dogovoru" (price by agreement)
    if (/^po\s+dogovoru$/i.test(line)) {
      continue; // Skip, no numeric price
    }

    // Detect standalone mileage: "150.000 km"
    const kmMatch = line.match(/^(\d[\d.,]*)\s*km\s*$/i);
    if (kmMatch && !listing.mileage) {
      listing.mileage = parseNum(kmMatch[1]);
      continue;
    }

    // Detect city from bihCities
    if (!listing.city) {
      const cityLower = line.toLowerCase();
      for (const city of bihCities) {
        if (cityLower === city.toLowerCase() || cityLower.includes(city.toLowerCase())) {
          listing.city = city;
          break;
        }
      }
      if (listing.city) continue;
    }

    // Lines at the start that don't match any pattern → title candidates
    if (i < 5 && !colonMatch && !tabMatch && line.length > 3 && line.length < 200) {
      titleCandidates.push(line);
    } else if (line.length > 10) {
      descriptionParts.push(line);
    }
  }

  // Set title from first candidate
  if (!listing.title && titleCandidates.length > 0) {
    listing.title = titleCandidates[0];
    // Try to guess make/model from title
    if (!listing.make) {
      const guess = guessMakeModel(listing.title);
      if (guess.make) listing.make = guess.make;
      if (guess.model) listing.model = guess.model;
    }
    // Try to extract year from title
    if (!listing.year) {
      const yearMatch = listing.title.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        const y = Number(yearMatch[1]);
        if (y >= 1990 && y <= new Date().getFullYear() + 1) listing.year = y;
      }
    }
    // Remaining title candidates become description
    titleCandidates = titleCandidates.slice(1);
  }

  // Build description from remaining text
  const allDesc = [...titleCandidates, ...descriptionParts].join('\n').trim();
  if (allDesc && !listing.description) {
    listing.description = allDesc;
  }

  // Default currency for Bosnian sites
  if (listing.price && !listing.currency) {
    listing.currency = 'KM';
  }

  return listing;
}

function detectSource(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('olx.ba')) return 'olx.ba';
  if (lower.includes('autoplac.ba')) return 'autoplac.ba';
  if (lower.includes('autobum.ba')) return 'autobum.ba';
  if (lower.includes('polovniautomobili.com')) return 'polovniautomobili.com';
  return 'manual-paste';
}

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
    const { text, sourceUrl } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Tekst je prekratak ili prazan.' },
        { status: 400 },
      );
    }

    const listing = cleanListing(parseListingText(text.trim(), sourceUrl));

    // Check if we extracted anything useful
    const hasData = listing.make || listing.model || listing.year || listing.price || listing.mileage;
    if (!hasData) {
      return NextResponse.json(
        { success: false, error: 'Nije moguće prepoznati podatke iz teksta. Pokušajte kopirati cijelu stranicu oglasa.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, listing });
  } catch (error) {
    console.error('Parse listing text error:', error);
    return NextResponse.json(
      { success: false, error: 'Greška prilikom obrade teksta.' },
      { status: 500 },
    );
  }
}
