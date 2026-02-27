import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';
import { timeAgo, truncate } from '../utils';
import type { Internship } from '../types';

interface Props {
    internship: Internship;
    onPress: () => void;
    onSave?: () => void;
    isSaved?: boolean;
    compact?: boolean;
}

export default function InternshipCard({
    internship,
    onPress,
    onSave,
    isSaved = false,
    compact = false,
}: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            style={[styles.card, Shadows.card]}
        >
            {/* Header */}
            <View style={styles.header}>
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

                <View style={styles.headerText}>
                    <Text style={styles.title} numberOfLines={2}>
                        {internship.title}
                    </Text>
                    <Text style={styles.company}>{internship.company}</Text>
                </View>

                {onSave && (
                    <TouchableOpacity onPress={onSave} hitSlop={12} style={styles.saveBtn}>
                        <Ionicons
                            name={isSaved ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isSaved ? Colors.error : Colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Meta */}
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText} numberOfLines={1}>
                        {truncate(internship.location, 24)}
                    </Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{timeAgo(internship.publishedAt)}</Text>
                </View>
            </View>

            {/* Tags */}
            {!compact && (
                <View style={styles.tagsRow}>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{internship.category}</Text>
                    </View>
                    {internship.salary !== 'Not specified' && (
                        <View style={styles.salaryTag}>
                            <Ionicons name="cash-outline" size={12} color={Colors.success} />
                            <Text style={styles.salaryText}>
                                {truncate(internship.salary, 20)}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
    },
    logo: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface,
    },
    logoFallback: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primaryGhost,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoLetter: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.primary,
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: Colors.text,
        lineHeight: 22,
    },
    company: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    saveBtn: {
        padding: Spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginTop: Spacing.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    metaText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        flexWrap: 'wrap',
    },
    categoryTag: {
        backgroundColor: Colors.primaryGhost,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    categoryText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    salaryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.selectedBg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    salaryText: {
        fontSize: FontSize.xs,
        color: Colors.success,
        fontWeight: '600',
    },
});
