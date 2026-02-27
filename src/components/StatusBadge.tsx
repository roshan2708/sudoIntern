import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import type { ApplicationStatus } from '../types';

interface Props {
    status: ApplicationStatus;
}

const CONFIG: Record<ApplicationStatus, { bg: string; color: string; label: string }> = {
    Applied: { bg: Colors.appliedBg, color: Colors.info, label: 'Applied' },
    Interview: { bg: Colors.interviewBg, color: Colors.warning, label: 'Interview' },
    Rejected: { bg: Colors.rejectedBg, color: Colors.error, label: 'Rejected' },
    Selected: { bg: Colors.selectedBg, color: Colors.success, label: 'Selected' },
};

export default function StatusBadge({ status }: Props) {
    const { bg, color, label } = CONFIG[status];

    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.text, { color }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs + 2,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs + 2,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    text: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
