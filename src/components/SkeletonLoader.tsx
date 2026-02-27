import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface Props {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export default function SkeletonLoader({
    width = '100%',
    height = 16,
    borderRadius = BorderRadius.sm,
    style,
}: Props) {
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ]),
        );
        animation.start();
        return () => animation.stop();
    }, [shimmer]);

    const backgroundColor = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.skeleton, Colors.skeletonShimmer],
    });

    return (
        <Animated.View
            style={[
                {
                    width: width as number,
                    height,
                    borderRadius,
                    backgroundColor,
                },
                style,
            ]}
        />
    );
}

/**
 * Pre-built skeleton card for the internship feed.
 */
export function InternshipCardSkeleton() {
    return (
        <View style={skeletonStyles.card}>
            <View style={skeletonStyles.header}>
                <SkeletonLoader width={44} height={44} borderRadius={BorderRadius.md} />
                <View style={skeletonStyles.headerText}>
                    <SkeletonLoader width="75%" height={14} />
                    <SkeletonLoader width="50%" height={12} style={{ marginTop: 8 }} />
                </View>
            </View>
            <SkeletonLoader width="90%" height={12} style={{ marginTop: 14 }} />
            <SkeletonLoader width="60%" height={12} style={{ marginTop: 8 }} />
            <View style={skeletonStyles.tags}>
                <SkeletonLoader width={64} height={24} borderRadius={BorderRadius.full} />
                <SkeletonLoader width={80} height={24} borderRadius={BorderRadius.full} />
                <SkeletonLoader width={56} height={24} borderRadius={BorderRadius.full} />
            </View>
        </View>
    );
}

const skeletonStyles = StyleSheet.create({
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
        alignItems: 'center',
        gap: Spacing.md,
    },
    headerText: {
        flex: 1,
    },
    tags: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.lg,
    },
});
