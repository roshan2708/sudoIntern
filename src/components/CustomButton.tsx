import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    type ViewStyle,
    type TextStyle,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';

interface Props {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export default function CustomButton({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
    fullWidth = false,
}: Props) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.75}
            style={[
                styles.base,
                styles[variant],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                variant === 'primary' && Shadows.button,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.text,
                            styles[`${variant}Text` as keyof typeof styles] as TextStyle,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        minHeight: 48,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },

    // ─── Variants ─────────────────────────────────────
    primary: {
        backgroundColor: Colors.primary,
    },
    primaryText: {
        color: Colors.white,
    },
    secondary: {
        backgroundColor: Colors.primaryGhost,
    },
    secondaryText: {
        color: Colors.primary,
    },
    outline: {
        backgroundColor: Colors.transparent,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    outlineText: {
        color: Colors.primary,
    },
    ghost: {
        backgroundColor: Colors.transparent,
    },
    ghostText: {
        color: Colors.primary,
    },
    danger: {
        backgroundColor: Colors.error,
    },
    dangerText: {
        color: Colors.white,
    },
});
