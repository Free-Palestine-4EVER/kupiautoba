import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  increment,
  serverTimestamp,
  onSnapshot,
  DocumentSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Listing, SearchFilters, Dealer, ConversationData, MessageData } from '../types';

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

function listingFromDoc(docSnap: DocumentSnapshot): Listing | null {
  if (!docSnap.exists()) return null;
  const d = docSnap.data()!;
  return {
    ...d,
    id: docSnap.id,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  } as Listing;
}

// ==================== LISTINGS ====================

export async function createListing(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'>, userId: string): Promise<string> {
  const docData = {
    ...data,
    userId,
    status: 'active',
    views: 0,
    favorites: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'listings'), docData);
  return docRef.id;
}

export async function updateListing(id: string, data: Partial<Listing>): Promise<void> {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteListing(id: string): Promise<void> {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, { status: 'deleted', updatedAt: serverTimestamp() });
}

export async function getListing(id: string): Promise<Listing | null> {
  const docRef = doc(db, 'listings', id);
  const snap = await getDoc(docRef);
  return listingFromDoc(snap);
}

export async function getListings(
  filters: SearchFilters,
  sortOption: string = 'newest',
  limitCount: number = 12,
  lastDocument?: DocumentSnapshot
): Promise<{ listings: Listing[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [];
  constraints.push(where('status', '==', 'active'));

  if (filters.make) constraints.push(where('make', '==', filters.make));
  if (filters.fuel) constraints.push(where('fuel', '==', filters.fuel));
  if (filters.transmission) constraints.push(where('transmission', '==', filters.transmission));
  if (filters.body) constraints.push(where('body', '==', filters.body));
  if (filters.city) constraints.push(where('city', '==', filters.city));

  switch (sortOption) {
    case 'price-asc':
      constraints.push(orderBy('price', 'asc'));
      break;
    case 'price-desc':
      constraints.push(orderBy('price', 'desc'));
      break;
    case 'mileage-asc':
      constraints.push(orderBy('mileage', 'asc'));
      break;
    default:
      constraints.push(orderBy('createdAt', 'desc'));
  }

  constraints.push(firestoreLimit(limitCount));

  if (lastDocument) {
    constraints.push(startAfter(lastDocument));
  }

  const q = query(collection(db, 'listings'), ...constraints);
  const snap = await getDocs(q);
  const listings = snap.docs.map(d => listingFromDoc(d)!).filter(Boolean);

  const filtered = listings.filter(l => {
    if (filters.model && !l.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (filters.yearFrom && l.year < filters.yearFrom) return false;
    if (filters.yearTo && l.year > filters.yearTo) return false;
    if (filters.priceFrom && l.price < filters.priceFrom) return false;
    if (filters.priceTo && l.price > filters.priceTo) return false;
    if (filters.mileageFrom && l.mileage < filters.mileageFrom) return false;
    if (filters.mileageTo && l.mileage > filters.mileageTo) return false;
    if (filters.color && l.color !== filters.color) return false;
    if (filters.driveType && l.driveType !== filters.driveType) return false;
    if (filters.damageStatus && l.damageStatus !== filters.damageStatus) return false;
    if (filters.registrationStatus && l.registrationStatus !== filters.registrationStatus) return false;
    if (filters.firstOwner && !l.firstOwner) return false;
    if (filters.garageKept && !l.garageKept) return false;
    if (filters.serviceBook && !l.serviceBook) return false;
    if (filters.powerFrom && (l.power || 0) < filters.powerFrom) return false;
    if (filters.powerTo && (l.power || 0) > filters.powerTo) return false;
    if (filters.engineSizeFrom && (l.engineSize || 0) < filters.engineSizeFrom) return false;
    if (filters.engineSizeTo && (l.engineSize || 0) > filters.engineSizeTo) return false;
    if (filters.doors && l.doors !== filters.doors) return false;
    if (filters.seats && l.seats !== filters.seats) return false;
    return true;
  });

  const lastDoc = snap.docs[snap.docs.length - 1] || null;
  return { listings: filtered, lastDoc };
}

export async function getListingsByUser(userId: string): Promise<Listing[]> {
  const q = query(
    collection(db, 'listings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => listingFromDoc(d)!).filter(Boolean);
}

export async function incrementViews(id: string): Promise<void> {
  const docRef = doc(db, 'listings', id);
  await updateDoc(docRef, { views: increment(1) });
}

// ==================== USERS ====================

export async function createUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  await setDoc(doc(db, 'users', uid), { ...data, createdAt: serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

export async function updateUserProfileDoc(uid: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

// ==================== FAVORITES ====================

export async function toggleFavorite(userId: string, listingId: string): Promise<boolean> {
  const favRef = doc(db, 'users', userId, 'favorites', listingId);
  const snap = await getDoc(favRef);
  if (snap.exists()) {
    await deleteDoc(favRef);
    return false;
  } else {
    await setDoc(favRef, { listingId, createdAt: serverTimestamp() });
    return true;
  }
}

export async function getFavorites(userId: string): Promise<string[]> {
  const q = query(collection(db, 'users', userId, 'favorites'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.id);
}

export async function isFavorite(userId: string, listingId: string): Promise<boolean> {
  const favRef = doc(db, 'users', userId, 'favorites', listingId);
  const snap = await getDoc(favRef);
  return snap.exists();
}

// ==================== MESSAGES ====================

export async function sendMessage(
  senderId: string,
  receiverId: string,
  listingId: string,
  listingTitle: string,
  listingPhoto: string,
  text: string
): Promise<string> {
  const convQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', senderId)
  );
  const convSnap = await getDocs(convQuery);
  let conversationId: string | null = null;

  for (const convDoc of convSnap.docs) {
    const data = convDoc.data();
    if (data.participants.includes(receiverId) && data.listingId === listingId) {
      conversationId = convDoc.id;
      break;
    }
  }

  if (!conversationId) {
    const convRef = await addDoc(collection(db, 'conversations'), {
      participants: [senderId, receiverId],
      listingId,
      listingTitle,
      listingPhoto: listingPhoto || '',
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      unreadCount: { [receiverId]: 1 },
      createdAt: serverTimestamp(),
    });
    conversationId = convRef.id;
  } else {
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${receiverId}`]: increment(1),
    });
  }

  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
    read: false,
  });

  return conversationId;
}

export function subscribeToConversations(userId: string, callback: (convs: ConversationData[]) => void) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const convs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        participants: data.participants,
        listingId: data.listingId,
        listingTitle: data.listingTitle || '',
        listingPhoto: data.listingPhoto || '',
        lastMessage: data.lastMessage || '',
        lastMessageAt: toDate(data.lastMessageAt),
        unreadCount: data.unreadCount || {},
      };
    });
    callback(convs);
  });
}

export function subscribeToMessages(conversationId: string, callback: (msgs: MessageData[]) => void) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        senderId: data.senderId,
        text: data.text,
        createdAt: toDate(data.createdAt),
        read: data.read || false,
      };
    });
    callback(msgs);
  });
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', conversationId), {
    [`unreadCount.${userId}`]: 0,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.reduce((sum, d) => {
    const data = d.data();
    return sum + (data.unreadCount?.[userId] || 0);
  }, 0);
}

// ==================== SAVED SEARCHES ====================

export async function saveSearch(userId: string, filters: SearchFilters, name: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'users', userId, 'savedSearches'), {
    filters,
    name,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSavedSearches(userId: string): Promise<Array<{ id: string; name: string; filters: SearchFilters; createdAt: Date }>> {
  const q = query(collection(db, 'users', userId, 'savedSearches'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      filters: data.filters,
      createdAt: toDate(data.createdAt),
    };
  });
}

export async function deleteSavedSearch(userId: string, searchId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'savedSearches', searchId));
}

// ==================== DEALERS ====================

export async function getDealers(filters?: { city?: string; search?: string }): Promise<Dealer[]> {
  let q;
  if (filters?.city) {
    q = query(collection(db, 'dealers'), where('city', '==', filters.city));
  } else {
    q = query(collection(db, 'dealers'));
  }
  const snap = await getDocs(q);
  let dealers = snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      userId: d.id,
      packageExpiry: toDate(data.packageExpiry),
    } as Dealer;
  });
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    dealers = dealers.filter(d => d.businessName.toLowerCase().includes(search));
  }
  return dealers;
}

export async function getDealer(userId: string): Promise<Dealer | null> {
  const snap = await getDoc(doc(db, 'dealers', userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    userId: snap.id,
    packageExpiry: toDate(data.packageExpiry),
  } as Dealer;
}
