import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/hooks';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
    const { user, isAuthenticated, initialising } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (initialising) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inInternTabs = segments[0] === '(intern-tabs)';
        const inEmployerTabs = segments[0] === '(employer-tabs)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            // Route to correct tabs based on role
            if (user?.role === 'employer') {
                router.replace('/(employer-tabs)/dashboard');
            } else {
                router.replace('/(intern-tabs)/home');
            }
        } else if (isAuthenticated && !inAuthGroup) {
            // Ensure correct tab group for role
            if (user?.role === 'employer' && inInternTabs) {
                router.replace('/(employer-tabs)/dashboard');
            } else if (user?.role !== 'employer' && inEmployerTabs) {
                router.replace('/(intern-tabs)/home');
            }
        }
    }, [isAuthenticated, initialising, segments, user?.role]);

    if (initialising) {
        return (
            <View style={styles.loader}>
                <StatusBar style="light" />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'fade',
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
