import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, borderRadius, spacing } from '../lib/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export default function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.priceLine, { opacity }]} />
        <Animated.View style={[styles.titleLine, { opacity }]} />
        <Animated.View style={[styles.detailLine, { opacity }]} />
        <Animated.View style={[styles.cityLine, { opacity }]} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    backgroundColor: colors.skeleton,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  priceLine: {
    width: '60%',
    height: 16,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton,
  },
  titleLine: {
    width: '80%',
    height: 14,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton,
  },
  detailLine: {
    width: '90%',
    height: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton,
  },
  cityLine: {
    width: '40%',
    height: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.skeleton,
  },
});
