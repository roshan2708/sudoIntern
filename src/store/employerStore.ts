import { create } from 'zustand';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    getDoc,
    increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { InternshipPost, Application, ApplicationStatus, Internship } from '../types';

interface EmployerState {
    postings: InternshipPost[];
    postingsLoading: boolean;
    applicants: Application[];
    applicantsLoading: boolean;
    postingError: string | null;

    fetchMyPostings: (uid: string) => Promise<void>;
    postInternship: (uid: string, companyName: string, data: Omit<InternshipPost, 'id' | 'postedBy' | 'postedAt' | 'applicantCount'>) => Promise<void>;
    fetchApplicantsForJob: (jobId: string) => Promise<void>;
    updateApplicantStatus: (jobId: string, applicantId: string, status: ApplicationStatus) => Promise<void>;
}

export const useEmployerStore = create<EmployerState>((set, get) => ({
    postings: [],
    postingsLoading: false,
    applicants: [],
    applicantsLoading: false,
    postingError: null,

    fetchMyPostings: async (uid) => {
        set({ postingsLoading: true, postingError: null });
        try {
            const snap = await getDocs(
                query(
                    collection(db, 'internships'),
                    where('postedBy', '==', uid),
                    orderBy('postedAt', 'desc'),
                ),
            );
            const postings: InternshipPost[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<InternshipPost, 'id'>),
            }));
            set({ postings, postingsLoading: false });
        } catch {
            set({ postingsLoading: false, postingError: 'Failed to load your postings' });
        }
    },

    postInternship: async (uid, companyName, data) => {
        set({ postingError: null });
        const id = `${uid}_${Date.now()}`;
        const posting: InternshipPost = {
            id,
            ...data,
            company: companyName,
            postedBy: uid,
            postedAt: new Date().toISOString(),
            applicantCount: 0,
        };
        try {
            await setDoc(doc(db, 'internships', id), posting);
            set((s) => ({ postings: [posting, ...s.postings] }));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to post internship';
            set({ postingError: message });
            throw err;
        }
    },

    fetchApplicantsForJob: async (jobId) => {
        set({ applicantsLoading: true });
        try {
            const snap = await getDocs(
                query(
                    collection(db, 'internships', jobId, 'applicants'),
                    orderBy('appliedAt', 'desc'),
                ),
            );
            const applicants: Application[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Application, 'id'>),
            }));
            set({ applicants, applicantsLoading: false });
        } catch {
            set({ applicantsLoading: false });
        }
    },

    updateApplicantStatus: async (jobId, applicantId, status) => {
        const prev = get().applicants;
        set((s) => ({
            applicants: s.applicants.map((a) =>
                a.id === applicantId ? { ...a, status } : a,
            ),
        }));
        try {
            await updateDoc(doc(db, 'internships', jobId, 'applicants', applicantId), { status });
        } catch {
            set({ applicants: prev });
        }
    },
}));
