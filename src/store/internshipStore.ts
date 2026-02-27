import { create } from 'zustand';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    updateDoc,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { fetchRemotiveJobs } from '../api';
import type {
    Internship,
    SavedInternship,
    Application,
    ApplicationStatus,
} from '../types';

const PAGE_SIZE = 20;

interface InternshipState {
    // ─── Feed ───────────────────────────────────────────
    internships: Internship[];
    allFetched: Internship[];
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
    searchQuery: string;
    category: string;

    // ─── Saved ──────────────────────────────────────────
    savedInternships: SavedInternship[];
    savedLoading: boolean;

    // ─── Applications ───────────────────────────────────
    applications: Application[];
    applicationsLoading: boolean;

    // ─── Feed actions ───────────────────────────────────
    fetchInternships: (refresh?: boolean) => Promise<void>;
    loadMore: () => void;
    setSearchQuery: (q: string) => void;
    setCategory: (c: string) => void;

    // ─── Saved actions ─────────────────────────────────
    fetchSaved: (uid: string) => Promise<void>;
    saveInternship: (uid: string, internship: Internship) => Promise<void>;
    removeSavedInternship: (uid: string, internshipId: string) => Promise<void>;
    isSaved: (internshipId: number) => boolean;

    // ─── Application actions ───────────────────────────
    fetchApplications: (uid: string) => Promise<void>;
    applyToInternship: (uid: string, internship: Internship) => Promise<void>;
    updateApplicationStatus: (
        uid: string,
        applicationId: string,
        status: ApplicationStatus,
    ) => Promise<void>;
    hasApplied: (internshipId: number) => boolean;
}

export const useInternshipStore = create<InternshipState>((set, get) => ({
    // ─── Initial state ──────────────────────────────────
    internships: [],
    allFetched: [],
    loading: false,
    refreshing: false,
    error: null,
    page: 1,
    hasMore: true,
    searchQuery: '',
    category: '',

    savedInternships: [],
    savedLoading: false,

    applications: [],
    applicationsLoading: false,

    // ─── Feed ───────────────────────────────────────────
    fetchInternships: async (refresh = false) => {
        const { searchQuery, category } = get();
        set(refresh ? { refreshing: true, error: null } : { loading: true, error: null });

        try {
            const jobs = await fetchRemotiveJobs({
                search: searchQuery || undefined,
                category: category || undefined,
            });

            const paginated = jobs.slice(0, PAGE_SIZE);
            set({
                allFetched: jobs,
                internships: paginated,
                page: 1,
                hasMore: jobs.length > PAGE_SIZE,
                loading: false,
                refreshing: false,
                error: null,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load internships';
            set({ loading: false, refreshing: false, error: message });
        }
    },

    loadMore: () => {
        const { allFetched, page, hasMore } = get();
        if (!hasMore) return;
        const nextPage = page + 1;
        const end = nextPage * PAGE_SIZE;
        const paginated = allFetched.slice(0, end);
        set({
            internships: paginated,
            page: nextPage,
            hasMore: end < allFetched.length,
        });
    },

    setSearchQuery: (q) => set({ searchQuery: q }),
    setCategory: (c) => set({ category: c }),

    // ─── Saved ──────────────────────────────────────────
    fetchSaved: async (uid) => {
        set({ savedLoading: true });
        try {
            const snap = await getDocs(
                query(collection(db, 'users', uid, 'saved'), orderBy('savedAt', 'desc')),
            );
            const saved: SavedInternship[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<SavedInternship, 'id'>),
            }));
            set({ savedInternships: saved, savedLoading: false });
        } catch {
            set({ savedLoading: false });
        }
    },

    saveInternship: async (uid, internship) => {
        const docId = String(internship.id);
        const saved: Omit<SavedInternship, 'id'> = {
            internship,
            savedAt: new Date().toISOString(),
        };

        // Optimistic update
        set((s) => ({
            savedInternships: [{ id: docId, ...saved }, ...s.savedInternships],
        }));

        try {
            await setDoc(doc(db, 'users', uid, 'saved', docId), saved);
        } catch {
            // Rollback
            set((s) => ({
                savedInternships: s.savedInternships.filter((si) => si.id !== docId),
            }));
        }
    },

    removeSavedInternship: async (uid, internshipId) => {
        const prev = get().savedInternships;

        // Optimistic
        set((s) => ({
            savedInternships: s.savedInternships.filter((si) => si.id !== internshipId),
        }));

        try {
            await deleteDoc(doc(db, 'users', uid, 'saved', internshipId));
        } catch {
            set({ savedInternships: prev });
        }
    },

    isSaved: (internshipId) =>
        get().savedInternships.some((s) => s.id === String(internshipId)),

    // ─── Applications ───────────────────────────────────
    fetchApplications: async (uid) => {
        set({ applicationsLoading: true });
        try {
            const snap = await getDocs(
                query(
                    collection(db, 'users', uid, 'applications'),
                    orderBy('appliedAt', 'desc'),
                ),
            );
            const apps: Application[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Application, 'id'>),
            }));
            set({ applications: apps, applicationsLoading: false });
        } catch {
            set({ applicationsLoading: false });
        }
    },

    applyToInternship: async (uid, internship) => {
        const docId = String(internship.id);
        const application: Omit<Application, 'id'> = {
            internshipId: internship.id,
            internship,
            status: 'Applied',
            appliedAt: new Date().toISOString(),
        };

        // Optimistic
        set((s) => ({
            applications: [{ id: docId, ...application }, ...s.applications],
        }));

        try {
            await setDoc(doc(db, 'users', uid, 'applications', docId), application);
        } catch {
            set((s) => ({
                applications: s.applications.filter((a) => a.id !== docId),
            }));
        }
    },

    updateApplicationStatus: async (uid, applicationId, status) => {
        const prev = get().applications;

        // Optimistic
        set((s) => ({
            applications: s.applications.map((a) =>
                a.id === applicationId ? { ...a, status } : a,
            ),
        }));

        try {
            await updateDoc(doc(db, 'users', uid, 'applications', applicationId), { status });
        } catch {
            set({ applications: prev });
        }
    },

    hasApplied: (internshipId) =>
        get().applications.some((a) => a.internshipId === internshipId),
}));
