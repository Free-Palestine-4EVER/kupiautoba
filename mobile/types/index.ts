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
  power: number;
  engineSize: number;
  price: number;
  currency: Currency;
  negotiable?: boolean;
  priceIncludesVAT?: boolean;
  tradeAllowed?: boolean;
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
  allChecksAllowed?: boolean;
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

export interface ConversationData {
  id: string;
  participants: string[];
  listingId: string;
  listingTitle: string;
  listingPhoto: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Record<string, number>;
}

export interface MessageData {
  id: string;
  senderId: string;
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

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phone: string;
  city: string;
  isDealer: boolean;
  createdAt: Date;
}
