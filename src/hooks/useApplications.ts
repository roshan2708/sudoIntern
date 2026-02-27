import { useCallback, useEffect } from 'react';
import { useInternshipStore, useAuthStore } from '../store';
import type { Internship, ApplicationStatus } from '../types';

/**
 * Hook for application tracker – auto-fetches on mount if user is logged in.
 */
export function useApplications() {
    const uid = useAuthStore((s) => s.user?.uid);
    const {
        applications,
        applicationsLoading,
        fetchApplications,
        applyToInternship,
        updateApplicationStatus,
        hasApplied,
    } = useInternshipStore();

    useEffect(() => {
        if (uid) fetchApplications(uid);
    }, [uid]);

    const apply = useCallback(
        async (internship: Internship) => {
            if (!uid) return;
            await applyToInternship(uid, internship);
        },
        [uid, applyToInternship],
    );

    const updateStatus = useCallback(
        async (applicationId: string, status: ApplicationStatus) => {
            if (!uid) return;
            await updateApplicationStatus(uid, applicationId, status);
        },
        [uid, updateApplicationStatus],
    );

    // ─── Analytics ──────────────────────────────────────
    const stats = {
        total: applications.length,
        applied: applications.filter((a) => a.status === 'Applied').length,
        interview: applications.filter((a) => a.status === 'Interview').length,
        rejected: applications.filter((a) => a.status === 'Rejected').length,
        selected: applications.filter((a) => a.status === 'Selected').length,
    };

    return {
        applications,
        applicationsLoading,
        apply,
        updateStatus,
        hasApplied,
        stats,
    };
}
