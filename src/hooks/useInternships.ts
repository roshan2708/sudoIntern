import { useCallback, useEffect } from 'react';
import { useInternshipStore } from '../store';

/**
 * Hook for the internship feed with search & category support.
 */
export function useInternships() {
    const {
        internships,
        loading,
        refreshing,
        error,
        hasMore,
        searchQuery,
        category,
        fetchInternships,
        loadMore,
        setSearchQuery,
        setCategory,
    } = useInternshipStore();

    useEffect(() => {
        fetchInternships();
    }, []);

    const refresh = useCallback(() => fetchInternships(true), [fetchInternships]);

    const search = useCallback(
        (q: string) => {
            setSearchQuery(q);
            // Debounced call happens in the component
        },
        [setSearchQuery],
    );

    const filterByCategory = useCallback(
        (c: string) => {
            setCategory(c);
            fetchInternships(true);
        },
        [setCategory, fetchInternships],
    );

    const searchAndFetch = useCallback(() => {
        fetchInternships(true);
    }, [fetchInternships]);

    return {
        internships,
        loading,
        refreshing,
        error,
        hasMore,
        searchQuery,
        category,
        refresh,
        loadMore,
        search,
        filterByCategory,
        searchAndFetch,
    };
}
