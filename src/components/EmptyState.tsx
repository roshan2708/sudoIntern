import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface Props {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
}

export default function EmptyState({
    icon = 'folder-open-outline',
    title,
    subtitle,
}: Props) {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={Colors.textMuted} />
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.huge,
        gap: Spacing.md,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
});
