import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore – expo ships this but declaration is sometimes missing
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * ⚠️  Replace these values with your own Firebase project config.
 *     You can find them in Firebase Console → Project Settings → General.
 */
const firebaseConfig = {
    apiKey: "AIzaSyAZigR3RLs7rEbuxZAr7QNNUcX4_6WH2cE",
    authDomain: "sudointern.firebaseapp.com",
    projectId: "sudointern",
    storageBucket: "sudointern.firebasestorage.app",
    messagingSenderId: "617692141785",
    appId: "1:617692141785:web:92f2a768870ce0727d86c8",
    measurementId: "G-0VNW8P9YLB"
};

// Ensure only one app instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth - use platform-specific persistence
let auth: ReturnType<typeof getAuth>;
try {
    auth = getAuth(app);
} catch {
    auth = initializeAuth(app);
}

// Firestore
const db = getFirestore(app);

export { app, auth, db };
