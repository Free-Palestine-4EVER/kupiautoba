export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  city?: string;
  createdAt: Date;
  isDealer: boolean;
  dealerPackage?: DealerPackage;
}

export type FuelType = 'benzin' | 'dizel' | 'plin' | 'hibrid' | 'elektricni' | 'benzin+plin';
export type TransmissionType = 'manuelni' | 'automatski' | 'poluautomatski';
export type BodyType = 'limuzina' | 'karavan' | 'hatchback' | 'SUV' | 'coupe' | 'cabrio' | 'kombi' | 'pickup' | 'monovolumen';
export type DriveType = 'prednji' | 'zadnji' | 'sva-cetiri';
export type ListingStatus = 'active' | 'expired' | 'draft' | 'sold';
export type DealerPackage = 'start' | 'standard' | 'premium' | 'vip';
export type Currency = 'KM' | 'EUR';

export type DamageStatus = 'bez-ostecenja' | 'ostecen' | 'havarisan';
export type RegistrationStatus = 'registrovan' | 'neregistrovan' | 'strane-tablice';

export interface Listing {
  id: string;
  userId: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel: FuelType;
  transmission: TransmissionType;
  body: BodyType;
  color: string;
  power: number; // kW
  engineSize: number; // ccm
  price: number;
  currency: Currency;
  negotiable?: boolean; // "Po dogovoru"
  priceIncludesVAT?: boolean; // "Cijena sa PDV-om"
  tradeAllowed?: boolean; // "Zamjena moguća"
  description: string;
  equipment: string[];
  photos: string[];
  city: string;
  region: string;
  status: ListingStatus;
  views: number;
  favorites: number;
  createdAt: Date;
  updatedAt: Date;
  importedFrom?: string;
  registrationUntil?: string;
  doors?: number;
  seats?: number;
  driveType?: DriveType;
  vin?: string;
  countryOfOrigin?: string;
  previousOwners?: number;
  damageStatus?: DamageStatus;
  registrationStatus?: RegistrationStatus;
  firstOwner?: boolean;
  garageKept?: boolean;
  serviceBook?: boolean;
  allChecksAllowed?: boolean; // "Sve provjere dozvoljene"
  sellerName?: string;
  sellerPhone?: string;
  autoRenewal?: 'off' | 'daily' | 'every3days' | 'weekly';
}

export interface Dealer {
  userId: string;
  businessName: string;
  logo?: string;
  coverPhoto?: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  workingHours: string;
  package: DealerPackage;
  packageExpiry: Date;
  verified: boolean;
  rating: number;
  reviewCount: number;
}

export interface Message {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

export interface SavedSearch {
  id: string;
  userId: string;
  filters: SearchFilters;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface CreditAccount {
  userId: string;
  balance: number;
  transactions: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'spend';
  description: string;
  createdAt: Date;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  body?: BodyType;
  city?: string;
  region?: string;
  color?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'mileage-asc';
  query?: string;
  powerFrom?: number;
  powerTo?: number;
  engineSizeFrom?: number;
  engineSizeTo?: number;
  doors?: number;
  seats?: number;
  driveType?: DriveType;
  registrationStatus?: RegistrationStatus;
  damageStatus?: DamageStatus;
  firstOwner?: boolean;
  garageKept?: boolean;
  serviceBook?: boolean;
}

export const CAR_MAKES = [
  'Audi', 'BMW', 'Citroen', 'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai',
  'Jeep', 'Kia', 'Land Rover', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Opel',
  'Peugeot', 'Porsche', 'Renault', 'Seat', 'Škoda', 'Toyota', 'Volkswagen', 'Volvo'
] as const;

export const BOSNIAN_CITIES = [
  'Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica', 'Mostar', 'Bijeljina',
  'Brčko', 'Prijedor', 'Doboj', 'Cazin', 'Bihać', 'Trebinje',
  'Livno', 'Gradačac', 'Visoko', 'Goražde', 'Široki Brijeg', 'Konjic',
  'Travnik', 'Živinice', 'Vogošća', 'Lukavac', 'Gračanica', 'Kakanj',
  'Bugojno', 'Sanski Most', 'Velika Kladuša', 'Orašje', 'Stolac', 'Neum'
] as const;

export const REGIONS = [
  'Sarajevski kanton', 'Tuzlanski kanton', 'Zeničko-dobojski kanton',
  'Hercegovačko-neretvanski kanton', 'Unsko-sanski kanton',
  'Srednjobosanski kanton', 'Zapadnohercegovački kanton',
  'Bosanskopodrinjski kanton', 'Posavski kanton', 'Kanton 10',
  'Republika Srpska', 'Brčko distrikt'
] as const;

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'benzin', label: 'Benzin' },
  { value: 'dizel', label: 'Dizel' },
  { value: 'plin', label: 'Plin (LPG)' },
  { value: 'hibrid', label: 'Hibrid' },
  { value: 'elektricni', label: 'Električni' },
  { value: 'benzin+plin', label: 'Benzin + Plin' },
];

export const TRANSMISSION_TYPES: { value: TransmissionType; label: string }[] = [
  { value: 'manuelni', label: 'Manuelni' },
  { value: 'automatski', label: 'Automatski' },
  { value: 'poluautomatski', label: 'Poluautomatski' },
];

export const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'limuzina', label: 'Limuzina' },
  { value: 'karavan', label: 'Karavan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'SUV', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'cabrio', label: 'Cabrio' },
  { value: 'kombi', label: 'Kombi' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'monovolumen', label: 'Monovolumen' },
];

export const EQUIPMENT_CATEGORIES: { category: string; items: string[] }[] = [
  {
    category: 'Sigurnost',
    items: ['ABS', 'ESP', 'Airbag vozača', 'Airbag suvozača', 'Bočni airbagovi', 'Alarm', 'Centralno zaključavanje', 'Isofix', 'Tempomat', 'Senzori za parkiranje', 'Kamera za vožnju unazad', 'Blind spot monitor'],
  },
  {
    category: 'Komfor',
    items: ['Klima', 'Automatska klima', 'Grijanje sjedišta', 'Električni prozori', 'Električna sjedišta', 'Kožna sjedišta', 'Panorama krov', 'Šiber', 'Grijanje volana', 'Keyless entry', 'Start/Stop sistem', 'Multifunkcionalni volan'],
  },
  {
    category: 'Zabava',
    items: ['Navigacija', 'Bluetooth', 'USB', 'Apple CarPlay', 'Android Auto', 'Premium zvučnici', 'Touchscreen', 'CD player', 'AUX'],
  },
  {
    category: 'Eksterijer',
    items: ['LED svjetla', 'Xenon svjetla', 'Maglenke', 'Alu felge', 'Krovni nosači', 'Tonirani stakla', 'Metalik boja', 'M paket', 'S-Line', 'AMG paket'],
  },
];

export const COLORS = [
  'Crna', 'Bijela', 'Siva', 'Srebrna', 'Plava', 'Crvena',
  'Zelena', 'Smeđa', 'Bež', 'Narandžasta', 'Žuta', 'Ljubičasta'
] as const;

export const DAMAGE_STATUSES: { value: DamageStatus; label: string }[] = [
  { value: 'bez-ostecenja', label: 'Bez oštećenja' },
  { value: 'ostecen', label: 'Oštećen' },
  { value: 'havarisan', label: 'Havarisan' },
];

export const REGISTRATION_STATUSES: { value: RegistrationStatus; label: string }[] = [
  { value: 'registrovan', label: 'Registrovan' },
  { value: 'neregistrovan', label: 'Neregistrovan' },
  { value: 'strane-tablice', label: 'Strane tablice' },
];

export const DRIVE_TYPES: { value: DriveType; label: string }[] = [
  { value: 'prednji', label: 'Prednji (FWD)' },
  { value: 'zadnji', label: 'Zadnji (RWD)' },
  { value: 'sva-cetiri', label: '4x4 / AWD' },
];

export const COUNTRIES_OF_ORIGIN = [
  'Bosna i Hercegovina', 'Njemačka', 'Austrija', 'Švicarska', 'Hrvatska',
  'Slovenija', 'Srbija', 'Italija', 'Francuska', 'Belgija', 'Holandija',
  'SAD', 'Japan', 'Južna Koreja', 'Ostalo'
] as const;
