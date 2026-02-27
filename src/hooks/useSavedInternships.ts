import { useCallback, useEffect } from 'react';
import { useInternshipStore, useAuthStore } from '../store';
import type { Internship } from '../types';

/**
 * Hook for saved internships – auto-fetches on mount if user is logged in.
 */
export function useSavedInternships() {
    const uid = useAuthStore((s) => s.user?.uid);
    const {
        savedInternships,
        savedLoading,
        fetchSaved,
        saveInternship,
        removeSavedInternship,
        isSaved,
    } = useInternshipStore();

    useEffect(() => {
        if (uid) fetchSaved(uid);
    }, [uid]);

    const toggleSave = useCallback(
        async (internship: Internship) => {
            if (!uid) return;
            const saved = isSaved(internship.id);
            if (saved) {
                await removeSavedInternship(uid, String(internship.id));
            } else {
                await saveInternship(uid, internship);
            }
        },
        [uid, isSaved, saveInternship, removeSavedInternship],
    );

    return {
        savedInternships,
        savedLoading,
        isSaved,
        toggleSave,
    };
}
