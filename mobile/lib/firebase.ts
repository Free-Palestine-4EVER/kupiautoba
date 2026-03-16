import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence may not be in type declarations
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDmiUPV6YJ8lthvEtkK62i_F2rqtQ80xd0',
  authDomain: 'kupiautoba-e7eb5.firebaseapp.com',
  projectId: 'kupiautoba-e7eb5',
  storageBucket: 'kupiautoba-e7eb5.firebasestorage.app',
  messagingSenderId: '593469587914',
  appId: '1:593469587914:web:3354347e989f5c22560f33',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
