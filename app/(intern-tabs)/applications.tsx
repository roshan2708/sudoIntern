import React, { useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApplications } from '../../src/hooks';
import { StatusBadge, EmptyState } from '../../src/components';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { timeAgo } from '../../src/utils';
import type { Application, ApplicationStatus } from '../../src/types';

const STATUS_OPTIONS: ApplicationStatus[] = ['Applied', 'Interview', 'Rejected', 'Selected'];

export default function ApplicationsScreen() {
    const router = useRouter();
    const { applications, updateStatus, stats } = useApplications();

    const handleStatusUpdate = useCallback(
        (app: Application) => {
            Alert.alert(
                'Update Status',
                `Current: ${app.status}`,
                STATUS_OPTIONS.map((status) => ({
                    text: status,
                    onPress: () => updateStatus(app.id, status),
                    style: status === 'Rejected' ? ('destructive' as const) : ('default' as const),
                })),
            );
        },
        [updateStatus],
    );

    const navigateToDetail = useCallback(
        (app: Application) => {
            router.push({
                pathname: '/internship/[id]',
                params: {
                    id: String(app.internship.id),
                    data: JSON.stringify(app.internship),
                },
            });
        },
        [router],
    );

    const renderItem = useCallback(
        ({ item }: { item: Application }) => (
            <TouchableOpacity
                style={[styles.card, Shadows.card]}
                onPress={() => navigateToDetail(item)}
                activeOpacity={0.85}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleArea}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.internship.title}
                        </Text>
                        <Text style={styles.cardCompany}>{item.internship.company}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                </View>

                {/* Resume attached badge */}
                {item.resumeName && (
                    <View style={styles.resumeBadge}>
                        <Ionicons name="document-attach-outline" size={12} color={Colors.accent} />
                        <Text style={styles.resumeBadgeText} numberOfLines={1}>{item.resumeName}</Text>
                    </View>
                )}

                <View style={styles.cardFooter}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.metaText}>{timeAgo(item.appliedAt)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleStatusUpdate(item)}
                        style={styles.updateBtn}
                    >
                        <Text style={styles.updateText}>Update</Text>
                        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        ),
        [handleStatusUpdate, navigateToDetail],
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Application Tracker</Text>
            </View>

            {applications.length > 0 && (
                <View style={styles.statsRow}>
                    <StatCard label="Total" value={stats.total} color={Colors.text} />
                    <StatCard label="Applied" value={stats.applied} color={Colors.info} />
                    <StatCard label="Interview" value={stats.interview} color={Colors.warning} />
                    <StatCard label="Selected" value={stats.selected} color={Colors.success} />
                </View>
            )}

            {applications.length === 0 ? (
                <EmptyState
                    icon="document-text-outline"
                    title="No applications yet"
                    subtitle="Apply to internships and track your progress here."
                />
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
    statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statValue: { fontSize: FontSize.xl, fontWeight: '800' },
    statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.huge },
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md },
    cardTitleArea: { flex: 1, gap: 4 },
    cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    cardCompany: { fontSize: FontSize.sm, color: Colors.textSecondary },
    resumeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,206,201,0.1)',
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        marginTop: Spacing.sm,
        alignSelf: 'flex-start',
    },
    resumeBadgeText: { fontSize: FontSize.xs, color: Colors.accent, maxWidth: 200 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
    updateBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    updateText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
});
