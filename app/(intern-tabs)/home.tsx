import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInternships, useSavedInternships } from '../../src/hooks';
import {
    InternshipCard,
    InternshipCardSkeleton,
    SearchBar,
    CategoryFilter,
    EmptyState,
} from '../../src/components';
import { Colors, Spacing, FontSize } from '../../src/constants/theme';
import { ApplyModal } from '../../src/components/ApplyModal';
import type { Internship } from '../../src/types';
import { useAuthStore } from '../../src/store';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const {
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
    } = useInternships();
    const { isSaved, toggleSave } = useSavedInternships();

    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [applyTarget, setApplyTarget] = useState<Internship | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearch = useCallback(
        (text: string) => {
            setLocalSearch(text);
            search(text);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => searchAndFetch(), 500);
        },
        [search, searchAndFetch],
    );

    const navigateToDetail = useCallback(
        (internship: Internship) => {
            router.push({
                pathname: '/internship/[id]',
                params: { id: String(internship.id), data: JSON.stringify(internship) },
            });
        },
        [router],
    );

    const renderItem = useCallback(
        ({ item }: { item: Internship }) => (
            <InternshipCard
                internship={item}
                onPress={() => navigateToDetail(item)}
                onSave={() => toggleSave(item)}
                isSaved={isSaved(item.id)}
                onApply={() => setApplyTarget(item)}
            />
        ),
        [isSaved, toggleSave, navigateToDetail],
    );

    const renderFooter = useCallback(() => {
        if (!hasMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={Colors.primary} />
            </View>
        );
    }, [hasMore]);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>sudoIntern</Text>
                <Text style={styles.subtitle}>
                    Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋
                </Text>
            </View>

            {/* Search */}
            <View style={styles.searchSection}>
                <SearchBar
                    value={localSearch}
                    onChangeText={handleSearch}
                    onSubmit={searchAndFetch}
                />
            </View>

            {/* Category filter */}
            <CategoryFilter selected={category} onSelect={filterByCategory} />

            {/* Content */}
            {loading && !refreshing ? (
                <View style={styles.list}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <InternshipCardSkeleton key={i} />
                    ))}
                </View>
            ) : error ? (
                <EmptyState
                    icon="cloud-offline-outline"
                    title="Oops! Something went wrong"
                    subtitle={error}
                />
            ) : internships.length === 0 ? (
                <EmptyState
                    icon="search-outline"
                    title="No internships found"
                    subtitle="Try adjusting your search or filters."
                />
            ) : (
                <FlatList
                    data={internships}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Apply Modal */}
            {applyTarget && (
                <ApplyModal
                    internship={applyTarget}
                    onClose={() => setApplyTarget(null)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    greeting: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    searchSection: {
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.sm,
    },
    list: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.huge,
    },
    footer: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
    },
});
