import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSavedInternships } from '../../src/hooks';
import { InternshipCard, EmptyState } from '../../src/components';
import { Colors, Spacing, FontSize } from '../../src/constants/theme';
import type { SavedInternship } from '../../src/types';

export default function SavedScreen() {
    const router = useRouter();
    const { savedInternships, toggleSave, isSaved } = useSavedInternships();

    const navigateToDetail = useCallback(
        (item: SavedInternship) => {
            router.push({
                pathname: '/internship/[id]',
                params: {
                    id: String(item.internship.id),
                    data: JSON.stringify(item.internship),
                },
            });
        },
        [router],
    );

    const renderItem = useCallback(
        ({ item }: { item: SavedInternship }) => (
            <InternshipCard
                internship={item.internship}
                onPress={() => navigateToDetail(item)}
                onSave={() => toggleSave(item.internship)}
                isSaved={isSaved(item.internship.id)}
            />
        ),
        [isSaved, toggleSave, navigateToDetail],
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Saved Internships</Text>
                <Text style={styles.count}>{savedInternships.length} saved</Text>
            </View>

            {savedInternships.length === 0 ? (
                <EmptyState
                    icon="heart-outline"
                    title="No saved internships"
                    subtitle="Tap the heart icon on any internship to save it here."
                />
            ) : (
                <FlatList
                    data={savedInternships}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: Colors.text,
    },
    count: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.huge,
    },
});
