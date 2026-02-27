import React from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface CategoryItem {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_DATA: CategoryItem[] = [
    { label: 'All', value: '', icon: 'apps' },
    { label: 'Software Dev', value: 'Software Development', icon: 'code-slash' },
    { label: 'Design', value: 'Design', icon: 'color-palette' },
    { label: 'Marketing', value: 'Marketing', icon: 'megaphone' },
    { label: 'Data', value: 'Data', icon: 'bar-chart' },
    { label: 'Product', value: 'Product', icon: 'cube' },
    { label: 'DevOps', value: 'DevOps / Sysadmin', icon: 'server' },
    { label: 'Support', value: 'Customer Support', icon: 'headset' },
    { label: 'Sales', value: 'Sales', icon: 'trending-up' },
    { label: 'Finance', value: 'Finance / Legal', icon: 'cash' },
    { label: 'HR', value: 'Human Resources', icon: 'people' },
    { label: 'QA', value: 'QA', icon: 'bug' },
    { label: 'Writing', value: 'Writing', icon: 'create' },
    { label: 'Other', value: 'All others', icon: 'ellipsis-horizontal' },
];

interface Props {
    selected: string;
    onSelect: (category: string) => void;
}

export default function CategoryFilter({ selected, onSelect }: Props) {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
                decelerationRate="fast"
            >
                {CATEGORY_DATA.map((cat) => {
                    const isActive =
                        selected === cat.value ||
                        (selected === '' && cat.value === '');
                    return (
                        <TouchableOpacity
                            key={cat.value + cat.label}
                            onPress={() => onSelect(cat.value)}
                            style={[styles.chip, isActive && styles.chipActive]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={cat.icon}
                                size={15}
                                color={isActive ? Colors.white : Colors.textMuted}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    isActive && styles.chipTextActive,
                                ]}
                                numberOfLines={1}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: Spacing.sm,
    },
    container: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 38,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    chipText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: Colors.white,
        fontWeight: '700',
    },
});
