import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';
import { useEmployerStore } from '../../src/store/employerStore';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { timeAgo } from '../../src/utils';
import type { InternshipPost } from '../../src/types';

export default function EmployerDashboard() {
    const { user } = useAuthStore();
    const { postings, postingsLoading, fetchMyPostings } = useEmployerStore();
    const router = useRouter();

    useEffect(() => {
        if (user?.uid) fetchMyPostings(user.uid);
    }, [user?.uid]);

    const renderItem = ({ item }: { item: InternshipPost }) => (
        <TouchableOpacity
            style={[styles.card, Shadows.card]}
            activeOpacity={0.85}
            onPress={() =>
                router.push({
                    pathname: '/(employer-tabs)/applicants',
                    params: { jobId: item.id, jobTitle: item.title },
                })
            }
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cardMeta}>{item.jobType} · {item.location}</Text>
                    <Text style={styles.cardMeta}>{timeAgo(item.postedAt)}</Text>
                </View>
                <View style={styles.applicantBadge}>
                    <Text style={styles.applicantCount}>{item.applicantCount}</Text>
                    <Text style={styles.applicantLabel}>Applicants</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.categoryChip}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={styles.viewRow}>
                    <Text style={styles.viewText}>View Applicants</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const activeJobs = postings.length;
    const totalApplicants = postings.reduce((sum, p) => sum + (p.applicantCount ?? 0), 0);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>
                        Hello, {user?.companyName ?? user?.name?.split(' ')[0] ?? 'there'} 👋
                    </Text>
                    <Text style={styles.subTitle}>Employer Dashboard</Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { borderColor: Colors.accent }]}>
                    <Text style={[styles.statValue, { color: Colors.accent }]}>{activeJobs}</Text>
                    <Text style={styles.statLabel}>Active Postings</Text>
                </View>
                <View style={[styles.statCard, { borderColor: Colors.primary }]}>
                    <Text style={[styles.statValue, { color: Colors.primary }]}>{totalApplicants}</Text>
                    <Text style={styles.statLabel}>Total Applicants</Text>
                </View>
            </View>

            {/* Posted Jobs */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Postings</Text>
            </View>

            {postingsLoading ? (
                <ActivityIndicator style={{ marginTop: Spacing.xxxl }} color={Colors.primary} />
            ) : postings.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="briefcase-outline" size={48} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>No postings yet</Text>
                    <Text style={styles.emptySub}>Go to "Post Job" to publish your first internship.</Text>
                </View>
            ) : (
                <FlatList
                    data={postings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={postingsLoading}
                            onRefresh={() => user?.uid && fetchMyPostings(user.uid)}
                            tintColor={Colors.accent}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
    greeting: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
    subTitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg },
    statCard: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        ...Shadows.card,
    },
    statValue: { fontSize: FontSize.xxxl, fontWeight: '800' },
    statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4, fontWeight: '500', textAlign: 'center' },
    sectionHeader: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.huge },
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardLeft: { flex: 1, gap: 4, marginRight: Spacing.md },
    cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    cardMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
    applicantBadge: { alignItems: 'center', backgroundColor: 'rgba(0,206,201,0.12)', borderRadius: BorderRadius.md, padding: Spacing.sm, minWidth: 56 },
    applicantCount: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.accent },
    applicantLabel: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: '500' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
    categoryChip: { backgroundColor: Colors.primaryGhost, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: 3 },
    categoryText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '600' },
    viewRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    viewText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.huge },
    emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    emptySub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
});
