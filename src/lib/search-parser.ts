import { carMakes } from './car-data';
import { SearchFilters } from '@/types';

const MAKE_ALIASES: Record<string, string> = {
  vw: 'Volkswagen', volkswagen: 'Volkswagen',
  bmw: 'BMW', bembara: 'BMW',
  mercedes: 'Mercedes-Benz', merc: 'Mercedes-Benz', benz: 'Mercedes-Benz',
  audi: 'Audi',
  opel: 'Opel',
  peugeot: 'Peugeot', pežo: 'Peugeot',
  renault: 'Renault', reno: 'Renault',
  škoda: 'Škoda', skoda: 'Škoda',
  toyota: 'Toyota',
  hyundai: 'Hyundai', hjundai: 'Hyundai',
  ford: 'Ford',
  kia: 'Kia',
  fiat: 'Fiat',
  citroen: 'Citroën', citroën: 'Citroën',
  seat: 'Seat',
  volvo: 'Volvo',
  mazda: 'Mazda',
  nissan: 'Nissan',
  honda: 'Honda',
  dacia: 'Dacia',
  'alfa romeo': 'Alfa Romeo', alfa: 'Alfa Romeo',
  suzuki: 'Suzuki',
  'land rover': 'Land Rover',
  jeep: 'Jeep',
  porsche: 'Porsche',
  mini: 'Mini',
  mitsubishi: 'Mitsubishi',
  chevrolet: 'Chevrolet', chevy: 'Chevrolet',
  cupra: 'Cupra',
  tesla: 'Tesla',
  lexus: 'Lexus',
  jaguar: 'Jaguar',
};

// Common model names that imply a specific make
const MODEL_TO_MAKE: Record<string, { make: string; model: string }> = {
  golf: { make: 'Volkswagen', model: 'Golf' },
  passat: { make: 'Volkswagen', model: 'Passat' },
  polo: { make: 'Volkswagen', model: 'Polo' },
  tiguan: { make: 'Volkswagen', model: 'Tiguan' },
  touareg: { make: 'Volkswagen', model: 'Touareg' },
  caddy: { make: 'Volkswagen', model: 'Caddy' },
  octavia: { make: 'Škoda', model: 'Octavia' },
  fabia: { make: 'Škoda', model: 'Fabia' },
  superb: { make: 'Škoda', model: 'Superb' },
  clio: { make: 'Renault', model: 'Clio' },
  megane: { make: 'Renault', model: 'Megane' },
  corsa: { make: 'Opel', model: 'Corsa' },
  astra: { make: 'Opel', model: 'Astra' },
  insignia: { make: 'Opel', model: 'Insignia' },
  punto: { make: 'Fiat', model: 'Punto' },
  panda: { make: 'Fiat', model: 'Panda' },
  fiesta: { make: 'Ford', model: 'Fiesta' },
  focus: { make: 'Ford', model: 'Focus' },
  mondeo: { make: 'Ford', model: 'Mondeo' },
  civic: { make: 'Honda', model: 'Civic' },
  yaris: { make: 'Toyota', model: 'Yaris' },
  corolla: { make: 'Toyota', model: 'Corolla' },
  tucson: { make: 'Hyundai', model: 'Tucson' },
  sportage: { make: 'Kia', model: 'Sportage' },
  qashqai: { make: 'Nissan', model: 'Qashqai' },
  swift: { make: 'Suzuki', model: 'Swift' },
  leon: { make: 'Seat', model: 'Leon' },
  ibiza: { make: 'Seat', model: 'Ibiza' },
  sandero: { make: 'Dacia', model: 'Sandero' },
  duster: { make: 'Dacia', model: 'Duster' },
};

const FUEL_ALIASES: Record<string, string> = {
  benzin: 'benzin', benzinac: 'benzin',
  dizel: 'dizel', diesel: 'dizel', dizelaš: 'dizel',
  plin: 'plin', lpg: 'plin',
  hibrid: 'hibrid', hybrid: 'hibrid',
  elektricni: 'elektricni', električni: 'elektricni', struja: 'elektricni', ev: 'elektricni',
};

const BODY_ALIASES: Record<string, string> = {
  limuzina: 'limuzina', sedan: 'limuzina',
  karavan: 'karavan', kombi: 'kombi', wagon: 'karavan',
  hatchback: 'hatchback', hečbek: 'hatchback',
  suv: 'SUV', džip: 'SUV', jeep: 'SUV',
  coupe: 'coupe', kupe: 'coupe',
  cabrio: 'cabrio', kabriolet: 'cabrio',
  pickup: 'pickup',
  monovolumen: 'monovolumen', van: 'monovolumen',
};

const CITY_ALIASES: Record<string, string> = {
  sarajevo: 'Sarajevo', sa: 'Sarajevo',
  'banja luka': 'Banja Luka', bl: 'Banja Luka', banjaluka: 'Banja Luka',
  tuzla: 'Tuzla', tz: 'Tuzla',
  zenica: 'Zenica', ze: 'Zenica',
  mostar: 'Mostar', mo: 'Mostar',
  bijeljina: 'Bijeljina', bihać: 'Bihać', brčko: 'Brčko',
  prijedor: 'Prijedor', doboj: 'Doboj', trebinje: 'Trebinje',
  livno: 'Livno', travnik: 'Travnik',
};

export function parseSearchQuery(queryStr: string): SearchFilters {
  const filters: SearchFilters = {};
  const tokens = queryStr.toLowerCase().trim().split(/\s+/);
  const used = new Set<number>();

  // Match make
  for (let i = 0; i < tokens.length; i++) {
    // Two-word makes
    if (i + 1 < tokens.length) {
      const twoWord = `${tokens[i]} ${tokens[i + 1]}`;
      if (MAKE_ALIASES[twoWord]) {
        filters.make = MAKE_ALIASES[twoWord];
        used.add(i); used.add(i + 1);
        break;
      }
    }
    if (MAKE_ALIASES[tokens[i]]) {
      filters.make = MAKE_ALIASES[tokens[i]];
      used.add(i);
      break;
    }
  }

  // If no make found, try matching by common model names (e.g. "Golf" → VW)
  if (!filters.make) {
    for (let i = 0; i < tokens.length; i++) {
      if (used.has(i)) continue;
      if (MODEL_TO_MAKE[tokens[i]]) {
        filters.make = MODEL_TO_MAKE[tokens[i]].make;
        filters.model = MODEL_TO_MAKE[tokens[i]].model;
        used.add(i);
        break;
      }
    }
  }

  // Match model from car-data
  if (filters.make) {
    const makeData = carMakes.find(m => m.label === filters.make);
    if (makeData) {
      for (let i = 0; i < tokens.length; i++) {
        if (used.has(i)) continue;
        for (const model of makeData.models) {
          const modelLower = model.toLowerCase();
          // Check multi-token model matches
          const modelTokens = modelLower.split(/\s+/);
          if (modelTokens.length > 1 && i + modelTokens.length - 1 < tokens.length) {
            const candidate = tokens.slice(i, i + modelTokens.length).join(' ');
            if (candidate === modelLower) {
              filters.model = model;
              for (let j = i; j < i + modelTokens.length; j++) used.add(j);
              break;
            }
          }
          if (tokens[i] === modelLower || tokens[i] === modelLower.replace('-', '')) {
            filters.model = model;
            used.add(i);
            break;
          }
        }
        if (filters.model) break;
      }
    }
  }

  // Match fuel
  for (let i = 0; i < tokens.length; i++) {
    if (used.has(i)) continue;
    if (FUEL_ALIASES[tokens[i]]) {
      filters.fuel = FUEL_ALIASES[tokens[i]] as SearchFilters['fuel'];
      used.add(i);
      break;
    }
  }

  // Match body type
  for (let i = 0; i < tokens.length; i++) {
    if (used.has(i)) continue;
    if (BODY_ALIASES[tokens[i]]) {
      filters.body = BODY_ALIASES[tokens[i]] as SearchFilters['body'];
      used.add(i);
      break;
    }
  }

  // Match city
  for (let i = 0; i < tokens.length; i++) {
    if (used.has(i)) continue;
    if (i + 1 < tokens.length) {
      const twoWord = `${tokens[i]} ${tokens[i + 1]}`;
      if (CITY_ALIASES[twoWord]) {
        filters.city = CITY_ALIASES[twoWord];
        used.add(i); used.add(i + 1);
        break;
      }
    }
    if (CITY_ALIASES[tokens[i]]) {
      filters.city = CITY_ALIASES[tokens[i]];
      used.add(i);
      break;
    }
  }

  // Extract numbers for year, price, mileage
  for (let i = 0; i < tokens.length; i++) {
    if (used.has(i)) continue;
    const num = parseInt(tokens[i].replace(/[^0-9]/g, ''));
    if (isNaN(num)) continue;

    const prevToken = i > 0 ? tokens[i - 1] : '';
    const nextToken = i + 1 < tokens.length ? tokens[i + 1] : '';
    const hasKm = tokens[i].includes('km') || nextToken === 'km' || nextToken === 'kilometara';

    if (num >= 1980 && num <= 2030 && !hasKm) {
      // It's a year
      if (prevToken === 'od') {
        filters.yearFrom = num;
      } else {
        if (!filters.yearFrom) filters.yearFrom = num;
        else filters.yearTo = num;
      }
      used.add(i);
    } else if (hasKm || num >= 10000 && num <= 999999) {
      // It's mileage
      if (prevToken === 'do' || prevToken === 'max') {
        filters.mileageTo = num;
      } else if (prevToken === 'od' || prevToken === 'min') {
        filters.mileageFrom = num;
      } else {
        filters.mileageTo = num;
      }
      used.add(i);
    } else if (num >= 500 && num <= 999999 && !hasKm) {
      // It's a price
      if (prevToken === 'do' || prevToken === 'max') {
        filters.priceTo = num;
      } else if (prevToken === 'od' || prevToken === 'min') {
        filters.priceFrom = num;
      } else {
        filters.priceTo = num;
      }
      used.add(i);
    }
  }

  return filters;
}
