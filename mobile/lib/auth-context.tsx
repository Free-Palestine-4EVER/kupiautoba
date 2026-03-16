import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, city?: string, isDealer?: boolean, dealerInfo?: Record<string, string>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
      // Profile not found
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

  const signUp = async (email: string, password: string, name: string, phone?: string, city?: string, isDealer?: boolean, dealerInfo?: Record<string, string>) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(credential.user, { displayName: name });
    const profileData = {
      uid: credential.user.uid,
      email,
      displayName: name,
      photoURL: null,
      phone: phone || '',
      city: city || '',
      isDealer: isDealer || false,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), profileData);
    if (isDealer && dealerInfo) {
      await setDoc(doc(db, 'dealers', credential.user.uid), {
        ...dealerInfo,
        uid: credential.user.uid,
        email,
        displayName: name,
        createdAt: serverTimestamp(),
      });
    }
    setUserProfile({
      ...profileData,
      createdAt: new Date(),
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const firebaseUser = result.user;

    // Check if user profile already exists; create one if not
    const docRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const profileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || null,
        phone: '',
        city: '',
        isDealer: false,
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, profileData);
    }
    await fetchProfile(firebaseUser.uid);
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signInWithGoogle, signOutUser, updateUserProfile, refreshProfile, resetPassword }}>
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
