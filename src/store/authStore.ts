import { create } from 'zustand';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile, UserRole } from '../types';

interface AuthState {
    user: UserProfile | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    initialising: boolean;
    error: string | null;

    // Actions
    register: (email: string, password: string, name: string, role: UserRole, companyName?: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    setUser: (user: UserProfile | null) => void;
    setFirebaseUser: (user: FirebaseUser | null) => void;
    setInitialising: (v: boolean) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    firebaseUser: null,
    loading: false,
    initialising: true,
    error: null,

    register: async (email, password, name, role, companyName) => {
        set({ loading: true, error: null });
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const profile: UserProfile = {
                uid: credential.user.uid,
                name,
                email,
                role,
                skills: [],
                github: '',
                linkedin: '',
                bio: '',
                createdAt: new Date().toISOString(),
                ...(role === 'employer' && companyName ? { companyName } : {}),
            };
            await setDoc(doc(db, 'users', credential.user.uid), profile);
            set({ user: profile, firebaseUser: credential.user, loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            set({ loading: false, error: message });
            throw err;
        }
    },

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const snap = await getDoc(doc(db, 'users', credential.user.uid));
            const profile = snap.exists() ? (snap.data() as UserProfile) : null;
            set({ user: profile, firebaseUser: credential.user, loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            set({ loading: false, error: message });
            throw err;
        }
    },

    logout: async () => {
        set({ loading: true, error: null });
        try {
            await signOut(auth);
            set({ user: null, firebaseUser: null, loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Logout failed';
            set({ loading: false, error: message });
        }
    },

    updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;
        set({ loading: true, error: null });
        try {
            await updateDoc(doc(db, 'users', user.uid), { ...data });
            set({ user: { ...user, ...data }, loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Update failed';
            set({ loading: false, error: message });
        }
    },

    setUser: (user) => set({ user }),
    setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
    setInitialising: (initialising) => set({ initialising }),
    clearError: () => set({ error: null }),
}));

/**
 * Listen for Firebase auth state changes and sync with Zustand.
 * Call once in root layout.
 */
export function subscribeAuthState(): () => void {
    const { setUser, setFirebaseUser, setInitialising } = useAuthStore.getState();

    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            setFirebaseUser(firebaseUser);
            try {
                const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (snap.exists()) {
                    setUser(snap.data() as UserProfile);
                }
            } catch {
                // Silently fail – profile will be null until next attempt
            }
        } else {
            setUser(null);
            setFirebaseUser(null);
        }
        setInitialising(false);
    });
}
