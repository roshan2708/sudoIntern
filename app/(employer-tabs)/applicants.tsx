import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEmployerStore } from '../../src/store/employerStore';
import { StatusBadge } from '../../src/components';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { timeAgo } from '../../src/utils';
import type { Application, ApplicationStatus } from '../../src/types';

const STATUS_OPTIONS: ApplicationStatus[] = ['Applied', 'Interview', 'Rejected', 'Selected'];

export default function ApplicantsScreen() {
    const { jobId, jobTitle } = useLocalSearchParams<{ jobId: string; jobTitle: string }>();
    const { applicants, applicantsLoading, fetchApplicantsForJob, updateApplicantStatus } = useEmployerStore();

    useEffect(() => {
        if (jobId) fetchApplicantsForJob(jobId);
    }, [jobId]);

    const handleStatusUpdate = useCallback(
        (applicant: Application) => {
            Alert.alert(
                'Update Applicant Status',
                `${applicant.applicantName} · Currently: ${applicant.status}`,
                STATUS_OPTIONS.map((status) => ({
                    text: status,
                    onPress: () => jobId && updateApplicantStatus(jobId, applicant.id, status),
                    style: status === 'Rejected' ? ('destructive' as const) : ('default' as const),
                })),
            );
        },
        [jobId, updateApplicantStatus],
    );

    const renderItem = ({ item }: { item: Application }) => (
        <View style={[styles.card, Shadows.card]}>
            <View style={styles.cardHeader}>
                <View style={styles.avatarSmall}>
                    <Text style={styles.avatarSmallText}>
                        {(item.applicantName || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.applicantName}>{item.applicantName || 'Unknown'}</Text>
                    <Text style={styles.applicantEmail}>{item.applicantEmail || ''}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>

            {/* Skills chips */}
            {item.parsedSkills && item.parsedSkills.length > 0 && (
                <View style={styles.skillsRow}>
                    {item.parsedSkills.slice(0, 5).map((skill, i) => (
                        <View key={i} style={styles.skillChip}>
                            <Text style={styles.skillChipText}>{skill}</Text>
                        </View>
                    ))}
                    {item.parsedSkills.length > 5 && (
                        <Text style={styles.skillMore}>+{item.parsedSkills.length - 5}</Text>
                    )}
                </View>
            )}

            {/* Cover note */}
            {!!item.coverNote && (
                <View style={styles.coverNote}>
                    <Ionicons name="chatbubble-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.coverNoteText} numberOfLines={2}>{item.coverNote}</Text>
                </View>
            )}

            {/* Resume */}
            {!!item.resumeName && (
                <View style={styles.resumeRow}>
                    <Ionicons name="document-attach-outline" size={14} color={Colors.accent} />
                    <Text style={styles.resumeName} numberOfLines={1}>{item.resumeName}</Text>
                </View>
            )}

            <View style={styles.cardFooter}>
                <View style={styles.appliedAt}>
                    <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.appliedAtText}>{timeAgo(item.appliedAt)}</Text>
                </View>
                <TouchableOpacity style={styles.updateBtn} onPress={() => handleStatusUpdate(item)}>
                    <Text style={styles.updateBtnText}>Update Status</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Applicants</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{jobTitle ?? ''}</Text>
            </View>

            {applicantsLoading ? (
                <ActivityIndicator style={{ marginTop: Spacing.xxxl }} color={Colors.primary} />
            ) : applicants.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>No applicants yet</Text>
                    <Text style={styles.emptySub}>
                        {jobId ? 'Applicants will appear here once interns apply.' : 'Select a posting from your dashboard.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={applicants}
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
    safe: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
    title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
    subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.huge },
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.md,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    avatarSmall: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.primaryGhost,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarSmallText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
    cardInfo: { flex: 1, gap: 2 },
    applicantName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
    applicantEmail: { fontSize: FontSize.sm, color: Colors.textSecondary },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    skillChip: {
        backgroundColor: Colors.primaryGhost,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
    },
    skillChipText: { fontSize: FontSize.xs, color: Colors.primaryLight, fontWeight: '600' },
    skillMore: { fontSize: FontSize.xs, color: Colors.textMuted, alignSelf: 'center' },
    coverNote: {
        flexDirection: 'row',
        gap: Spacing.sm,
        alignItems: 'flex-start',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
    },
    coverNoteText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
    resumeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    resumeName: { fontSize: FontSize.sm, color: Colors.accent, flex: 1 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    appliedAt: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    appliedAtText: { fontSize: FontSize.xs, color: Colors.textMuted },
    updateBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    updateBtnText: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.huge },
    emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
    emptySub: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
});
