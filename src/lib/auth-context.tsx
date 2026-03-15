'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

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

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, city?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile({
          uid,
          email: data.email || '',
          displayName: data.displayName || '',
          photoURL: data.photoURL || null,
          phone: data.phone || '',
          city: data.city || '',
          isDealer: data.isDealer || false,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        });
      }
    } catch {
      // Profile not found yet
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string, city?: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(credential.user, { displayName: name });
    const profileData = {
      uid: credential.user.uid,
      email,
      displayName: name,
      photoURL: null,
      phone: phone || '',
      city: city || '',
      isDealer: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), profileData);
    setUserProfile({
      ...profileData,
      createdAt: new Date(),
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const userDoc = doc(db, 'users', credential.user.uid);
    const snap = await getDoc(userDoc);
    if (!snap.exists()) {
      const profileData = {
        uid: credential.user.uid,
        email: credential.user.email || '',
        displayName: credential.user.displayName || '',
        photoURL: credential.user.photoURL || null,
        phone: '',
        city: '',
        isDealer: false,
        createdAt: serverTimestamp(),
      };
      await setDoc(userDoc, profileData);
    }
    await fetchProfile(credential.user.uid);
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, data, { merge: true });
    if (data.displayName) {
      await firebaseUpdateProfile(user, { displayName: data.displayName });
    }
    if (data.photoURL !== undefined) {
      await firebaseUpdateProfile(user, { photoURL: data.photoURL });
    }
    await fetchProfile(user.uid);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signInWithGoogle, signOutUser, updateUserProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
