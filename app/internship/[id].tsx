import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Linking,
    Image,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton, StatusBadge } from '../../src/components';
import { useSavedInternships, useApplications } from '../../src/hooks';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { stripHtml, timeAgo } from '../../src/utils';
import type { Internship } from '../../src/types';

export default function InternshipDetailScreen() {
    const params = useLocalSearchParams<{ id: string; data: string }>();
    const router = useRouter();
    const { isSaved, toggleSave } = useSavedInternships();
    const { hasApplied, apply, applications } = useApplications();

    const internship: Internship | null = useMemo(() => {
        try {
            return params.data ? JSON.parse(params.data) : null;
        } catch {
            return null;
        }
    }, [params.data]);

    if (!internship) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <Text style={styles.errorText}>Internship not found.</Text>
                    <CustomButton title="Go Back" onPress={() => router.back()} variant="outline" />
                </View>
            </SafeAreaView>
        );
    }

    const saved = isSaved(internship.id);
    const applied = hasApplied(internship.id);
    const application = applications.find((a) => a.internshipId === internship.id);
    const description = stripHtml(internship.description);

    const handleApply = () => {
        if (applied) {
            Alert.alert('Already Applied', 'You have already applied to this internship.');
            return;
        }
        Alert.alert(
            'Apply',
            `Apply to ${internship.title} at ${internship.company}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply & Open Link',
                    onPress: async () => {
                        await apply(internship);
                        Linking.openURL(internship.url);
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <CustomButton
                    title=""
                    onPress={() => router.back()}
                    variant="ghost"
                    icon={<Ionicons name="arrow-back" size={24} color={Colors.text} />}
                />
                <CustomButton
                    title=""
                    onPress={() => toggleSave(internship)}
                    variant="ghost"
                    icon={
                        <Ionicons
                            name={saved ? 'heart' : 'heart-outline'}
                            size={24}
                            color={saved ? Colors.error : Colors.text}
                        />
                    }
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Company header */}
                <View style={styles.companyHeader}>
                    {internship.companyLogo ? (
                        <Image
                            source={{ uri: internship.companyLogo }}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.logoFallback}>
                            <Text style={styles.logoLetter}>
                                {internship.company.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.jobTitle}>{internship.title}</Text>
                    <Text style={styles.companyName}>{internship.company}</Text>
                </View>

                {/* Info chips */}
                <View style={styles.chipsRow}>
                    <InfoChip icon="location-outline" label={internship.location} />
                    <InfoChip icon="briefcase-outline" label={internship.jobType} />
                    <InfoChip icon="time-outline" label={timeAgo(internship.publishedAt)} />
                </View>

                {/* Salary */}
                {internship.salary !== 'Not specified' && (
                    <View style={[styles.salaryCard, Shadows.card]}>
                        <Ionicons name="cash-outline" size={20} color={Colors.success} />
                        <View>
                            <Text style={styles.salaryLabel}>Salary / Compensation</Text>
                            <Text style={styles.salaryValue}>{internship.salary}</Text>
                        </View>
                    </View>
                )}

                {/* Category & Tags */}
                <View style={styles.tagsSection}>
                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryText}>{internship.category}</Text>
                    </View>
                    {internship.tags.slice(0, 5).map((tag) => (
                        <View key={tag} style={styles.tagChip}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                {/* Application status */}
                {application && (
                    <View style={[styles.statusCard, Shadows.card]}>
                        <Text style={styles.statusLabel}>Your Application Status</Text>
                        <StatusBadge status={application.status} />
                    </View>
                )}

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Job Description</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </ScrollView>

            {/* Bottom action bar */}
            <View style={styles.actionBar}>
                <CustomButton
                    title={applied ? 'Applied ✓' : 'Apply Now'}
                    onPress={handleApply}
                    fullWidth
                    disabled={applied}
                    variant={applied ? 'secondary' : 'primary'}
                    icon={
                        applied ? undefined : (
                            <Ionicons name="send" size={18} color={Colors.white} />
                        )
                    }
                />
            </View>
        </SafeAreaView>
    );
}

function InfoChip({
    icon,
    label,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
}) {
    return (
        <View style={chipStyles.chip}>
            <Ionicons name={icon} size={14} color={Colors.textSecondary} />
            <Text style={chipStyles.label} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
}

const chipStyles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    label: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
});

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    errorText: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.sm,
    },
    scroll: {
        paddingHorizontal: Spacing.xxl,
        paddingBottom: 100,
    },
    companyHeader: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.surface,
        marginBottom: Spacing.md,
    },
    logoFallback: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primaryGhost,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    logoLetter: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.primary,
    },
    jobTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: Colors.text,
        textAlign: 'center',
        lineHeight: 28,
    },
    companyName: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
        fontWeight: '500',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    salaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: Colors.selectedBg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(0,184,148,0.2)',
    },
    salaryLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: '500',
    },
    salaryValue: {
        fontSize: FontSize.md,
        color: Colors.success,
        fontWeight: '700',
    },
    tagsSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    categoryChip: {
        backgroundColor: Colors.primaryGhost,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        borderRadius: BorderRadius.full,
    },
    categoryText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    tagChip: {
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    statusCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.card,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statusLabel: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    descriptionSection: {
        gap: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    description: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.background,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
});
