import { NextRequest, NextResponse } from 'next/server';
import {
  Listing,
  SearchFilters,
  FuelType,
  TransmissionType,
  BodyType,
} from '@/types';
import { mockListings } from '@/lib/mock-data';

// Brand aliases mapping common shorthand/Bosnian names to canonical make names
const MAKE_ALIASES: Record<string, string> = {
  // Standard names
  audi: 'Audi',
  bmw: 'BMW',
  citroen: 'Citroen',
  dacia: 'Dacia',
  fiat: 'Fiat',
  ford: 'Ford',
  honda: 'Honda',
  hyundai: 'Hyundai',
  jeep: 'Jeep',
  kia: 'Kia',
  mazda: 'Mazda',
  nissan: 'Nissan',
  opel: 'Opel',
  peugeot: 'Peugeot',
  porsche: 'Porsche',
  renault: 'Renault',
  seat: 'Seat',
  toyota: 'Toyota',
  volvo: 'Volvo',
  // Aliases and common shorthand
  vw: 'Volkswagen',
  volkswagen: 'Volkswagen',
  'land rover': 'Land Rover',
  landrover: 'Land Rover',
  mercedes: 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  'mercedes benz': 'Mercedes-Benz',
  merc: 'Mercedes-Benz',
  skoda: 'Skoda',
  škoda: 'Škoda',
};

// Fuel type aliases (Bosnian language variants)
const FUEL_ALIASES: Record<string, FuelType> = {
  dizel: 'dizel',
  diesel: 'dizel',
  dizela: 'dizel',
  dizelski: 'dizel',
  benzin: 'benzin',
  benzinac: 'benzin',
  benzinski: 'benzin',
  plin: 'plin',
  lpg: 'plin',
  'benzin+plin': 'benzin+plin',
  'benzin i plin': 'benzin+plin',
  hibrid: 'hibrid',
  hybrid: 'hibrid',
  hibridni: 'hibrid',
  elektricni: 'elektricni',
  električni: 'elektricni',
  elektricno: 'elektricni',
  struja: 'elektricni',
  ev: 'elektricni',
};

// Transmission aliases
const TRANSMISSION_ALIASES: Record<string, TransmissionType> = {
  automatik: 'automatski',
  automatski: 'automatski',
  automatic: 'automatski',
  automat: 'automatski',
  dsg: 'automatski',
  's-tronic': 'automatski',
  stronic: 'automatski',
  tiptronic: 'automatski',
  manuelni: 'manuelni',
  manual: 'manuelni',
  manuelno: 'manuelni',
  rucni: 'manuelni',
  ručni: 'manuelni',
  poluautomatski: 'poluautomatski',
  poluautomat: 'poluautomatski',
  poluautomatik: 'poluautomatski',
};

// Body type aliases
const BODY_ALIASES: Record<string, BodyType> = {
  suv: 'SUV',
  dzip: 'SUV',
  'džip': 'SUV',
  terenac: 'SUV',
  karavan: 'karavan',
  kombi: 'kombi',
  avant: 'karavan',
  touring: 'karavan',
  estate: 'karavan',
  limuzina: 'limuzina',
  sedan: 'limuzina',
  hatchback: 'hatchback',
  hatch: 'hatchback',
  coupe: 'coupe',
  kupe: 'coupe',
  cabrio: 'cabrio',
  kabriolet: 'cabrio',
  pickup: 'pickup',
  monovolumen: 'monovolumen',
  minivan: 'monovolumen',
};

function parseNaturalLanguageQuery(query: string): SearchFilters {
  const filters: SearchFilters = {};
  const lowerQuery = query.toLowerCase().trim();

  // --- Extract make ---
  // Sort aliases by length descending so longer matches are tried first
  // (e.g., "mercedes-benz" before "merc")
  const sortedMakeAliases = Object.keys(MAKE_ALIASES).sort(
    (a, b) => b.length - a.length
  );
  for (const alias of sortedMakeAliases) {
    const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      filters.make = MAKE_ALIASES[alias];
      break;
    }
  }

  // --- Extract price ---
  // Patterns: "do 30000", "do 30000 km" should NOT match (km = mileage),
  // "30000 KM" (currency), "cijena do 30000", "do 30.000 KM", "jeftinije od 50000"
  // "od 10000 do 30000"

  // Price with currency KM (Konvertibilna Marka)
  const priceCurrencyMatch = lowerQuery.match(
    /(\d[\d.]*)\s*(?:konvertibiln\w+\s+mar\w+|km(?!\s*\/?\s*h))\b/i
  );
  if (priceCurrencyMatch) {
    const priceVal = parseInt(priceCurrencyMatch[1].replace(/\./g, ''), 10);
    if (!isNaN(priceVal) && priceVal > 0) {
      filters.priceTo = priceVal;
    }
  }

  // "cijena do X" or "do X KM" or "jeftinije od X" or "budget X"
  const priceToMatch = lowerQuery.match(
    /(?:cijena\s+do|do\s+(\d[\d.]*)\s*(?:km|konvertibiln|eur)|jeftinije?\s+od\s+(\d[\d.]*))/i
  );
  if (priceToMatch && !filters.priceTo) {
    const priceStr = priceToMatch[1] || priceToMatch[2];
    if (priceStr) {
      const priceVal = parseInt(priceStr.replace(/\./g, ''), 10);
      if (!isNaN(priceVal) && priceVal > 0) {
        filters.priceTo = priceVal;
      }
    }
  }

  // "cijena od X" or "od X KM" (minimum price)
  const priceFromMatch = lowerQuery.match(
    /(?:cijena\s+od|od\s+(\d[\d.]*)\s*(?:km|konvertibiln|eur))/i
  );
  if (priceFromMatch) {
    const priceStr = priceFromMatch[1];
    if (priceStr) {
      const priceVal = parseInt(priceStr.replace(/\./g, ''), 10);
      if (!isNaN(priceVal) && priceVal > 0) {
        filters.priceFrom = priceVal;
      }
    }
  }

  // General "do XXXXX" pattern where the number looks like a price (> 1000)
  // and is NOT followed by km/kilometar
  if (!filters.priceTo) {
    const generalPriceToMatch = lowerQuery.match(
      /do\s+(\d[\d.]*)\b(?!\s*(?:km\b|kilometar|kilom))/i
    );
    if (generalPriceToMatch) {
      const val = parseInt(generalPriceToMatch[1].replace(/\./g, ''), 10);
      // Heuristic: if > 1000 and not already captured as mileage, treat as price
      if (!isNaN(val) && val >= 1000) {
        filters.priceTo = val;
      }
    }
  }

  // --- Extract mileage ---
  // Patterns: "do 100000km", "100000 km", "do 100.000 km", "kilometraza do 150000"
  const mileageToPatterns = [
    /do\s+(\d[\d.]*)\s*km\b/i,
    /(?:kilometraz\w*|km)\s+do\s+(\d[\d.]*)/i,
    /manje\s+od\s+(\d[\d.]*)\s*(?:km|kilometar\w*)/i,
    /(\d[\d.]*)\s*(?:km|kilometar\w*)\s+max/i,
  ];

  for (const pattern of mileageToPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const val = parseInt(match[1].replace(/\./g, ''), 10);
      if (!isNaN(val) && val > 0) {
        filters.mileageTo = val;
        break;
      }
    }
  }

  const mileageFromPatterns = [
    /od\s+(\d[\d.]*)\s*km\b/i,
    /(?:kilometraz\w*|km)\s+od\s+(\d[\d.]*)/i,
    /vise\s+od\s+(\d[\d.]*)\s*(?:km|kilometar\w*)/i,
    /više\s+od\s+(\d[\d.]*)\s*(?:km|kilometar\w*)/i,
  ];

  for (const pattern of mileageFromPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const val = parseInt(match[1].replace(/\./g, ''), 10);
      if (!isNaN(val) && val > 0) {
        filters.mileageFrom = val;
        break;
      }
    }
  }

  // --- Extract year ---
  // Patterns: "2019", "noviji od 2019", "godiste 2019", "od 2018 do 2022"
  const yearFromPatterns = [
    /novij\w*\s+od\s+(\d{4})/i,
    /godist\w*\s+od\s+(\d{4})/i,
    /godina\s+od\s+(\d{4})/i,
    /od\s+(\d{4})\s*(?:godist|godin|do\s+\d{4})/i,
  ];

  for (const pattern of yearFromPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1900 && year <= new Date().getFullYear() + 1) {
        filters.yearFrom = year;
        break;
      }
    }
  }

  const yearToPatterns = [
    /starij\w*\s+od\s+(\d{4})/i,
    /godist\w*\s+do\s+(\d{4})/i,
    /godina\s+do\s+(\d{4})/i,
    /do\s+(\d{4})\s*(?:godist|godin)/i,
  ];

  for (const pattern of yearToPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1900 && year <= new Date().getFullYear() + 1) {
        filters.yearTo = year;
        break;
      }
    }
  }

  // Year range: "od 2018 do 2022" or "2018-2022"
  const yearRangeMatch = lowerQuery.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (yearRangeMatch) {
    const from = parseInt(yearRangeMatch[1], 10);
    const to = parseInt(yearRangeMatch[2], 10);
    if (from >= 1900 && to >= from) {
      if (!filters.yearFrom) filters.yearFrom = from;
      if (!filters.yearTo) filters.yearTo = to;
    }
  }

  // Standalone 4-digit year (only if no year filters found yet)
  if (!filters.yearFrom && !filters.yearTo) {
    const standaloneYearMatch = lowerQuery.match(/\b(20[0-2]\d|19\d{2})\b/);
    if (standaloneYearMatch) {
      const year = parseInt(standaloneYearMatch[1], 10);
      if (year >= 1900 && year <= new Date().getFullYear() + 1) {
        filters.yearFrom = year;
      }
    }
  }

  // --- Extract fuel type ---
  const sortedFuelAliases = Object.keys(FUEL_ALIASES).sort(
    (a, b) => b.length - a.length
  );
  for (const alias of sortedFuelAliases) {
    const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      filters.fuel = FUEL_ALIASES[alias];
      break;
    }
  }

  // --- Extract transmission ---
  const sortedTransAliases = Object.keys(TRANSMISSION_ALIASES).sort(
    (a, b) => b.length - a.length
  );
  for (const alias of sortedTransAliases) {
    const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      filters.transmission = TRANSMISSION_ALIASES[alias];
      break;
    }
  }

  // --- Extract body type ---
  const sortedBodyAliases = Object.keys(BODY_ALIASES).sort(
    (a, b) => b.length - a.length
  );
  for (const alias of sortedBodyAliases) {
    const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      filters.body = BODY_ALIASES[alias];
      break;
    }
  }

  // --- Extract city ---
  const cities = [
    'sarajevo',
    'banja luka',
    'tuzla',
    'zenica',
    'mostar',
    'bijeljina',
    'brcko',
    'brčko',
    'prijedor',
    'doboj',
    'cazin',
    'bihac',
    'bihać',
    'trebinje',
    'livno',
    'gradacac',
    'gradačac',
    'visoko',
    'gorazde',
    'goražde',
    'siroki brijeg',
    'široki brijeg',
    'konjic',
  ];

  const cityNameMap: Record<string, string> = {
    sarajevo: 'Sarajevo',
    'banja luka': 'Banja Luka',
    tuzla: 'Tuzla',
    zenica: 'Zenica',
    mostar: 'Mostar',
    bijeljina: 'Bijeljina',
    brcko: 'Brčko',
    'brčko': 'Brčko',
    prijedor: 'Prijedor',
    doboj: 'Doboj',
    cazin: 'Cazin',
    bihac: 'Bihać',
    'bihać': 'Bihać',
    trebinje: 'Trebinje',
    livno: 'Livno',
    gradacac: 'Gradačac',
    'gradačac': 'Gradačac',
    visoko: 'Visoko',
    gorazde: 'Goražde',
    'goražde': 'Goražde',
    'siroki brijeg': 'Široki Brijeg',
    'široki brijeg': 'Široki Brijeg',
    konjic: 'Konjic',
  };

  // Sort cities by length descending for proper matching (e.g., "Banja Luka" before "Luka")
  const sortedCities = cities.sort((a, b) => b.length - a.length);
  for (const city of sortedCities) {
    if (lowerQuery.includes(city)) {
      filters.city = cityNameMap[city] || city;
      break;
    }
  }

  return filters;
}

function applySearchFilters(
  listings: Listing[],
  filters: SearchFilters
): Listing[] {
  let results = [...listings];

  if (filters.make) {
    results = results.filter(
      (l) => l.make.toLowerCase() === filters.make!.toLowerCase()
    );
  }

  if (filters.model) {
    results = results.filter((l) =>
      l.model.toLowerCase().includes(filters.model!.toLowerCase())
    );
  }

  if (filters.yearFrom) {
    results = results.filter((l) => l.year >= filters.yearFrom!);
  }

  if (filters.yearTo) {
    results = results.filter((l) => l.year <= filters.yearTo!);
  }

  if (filters.priceFrom) {
    results = results.filter((l) => l.price >= filters.priceFrom!);
  }

  if (filters.priceTo) {
    results = results.filter((l) => l.price <= filters.priceTo!);
  }

  if (filters.mileageFrom) {
    results = results.filter((l) => l.mileage >= filters.mileageFrom!);
  }

  if (filters.mileageTo) {
    results = results.filter((l) => l.mileage <= filters.mileageTo!);
  }

  if (filters.fuel) {
    results = results.filter((l) => l.fuel === filters.fuel);
  }

  if (filters.transmission) {
    results = results.filter((l) => l.transmission === filters.transmission);
  }

  if (filters.body) {
    results = results.filter((l) => l.body === filters.body);
  }

  if (filters.city) {
    results = results.filter(
      (l) => l.city.toLowerCase() === filters.city!.toLowerCase()
    );
  }

  return results;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Upit za pretragu je obavezan.' },
        { status: 400 }
      );
    }

    const filters = parseNaturalLanguageQuery(query);
    const listings = applySearchFilters(mockListings, filters);

    return NextResponse.json({
      filters,
      listings,
      total: listings.length,
    });
  } catch (error) {
    console.error('POST /api/search error:', error);
    return NextResponse.json(
      { error: 'Greska prilikom pretrage.' },
      { status: 500 }
    );
  }
}
