import { useEffect } from 'react';
import { useAuthStore, subscribeAuthState } from '../store';

/**
 * Hook to manage auth state subscription.
 * Call once in the root layout.
 */
export function useAuth() {
    const {
        user,
        firebaseUser,
        loading,
        initialising,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
    } = useAuthStore();

    useEffect(() => {
        const unsubscribe = subscribeAuthState();
        return unsubscribe;
    }, []);

    return {
        user,
        firebaseUser,
        isAuthenticated: !!firebaseUser,
        loading,
        initialising,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
    };
}
