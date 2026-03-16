import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/theme';
import { Dealer } from '../types';

interface DealerCardProps {
  dealer: Dealer;
}

export default function DealerCard({ dealer }: DealerCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, shadows.md]}
      activeOpacity={0.85}
      onPress={() => router.push(`/dealer/${dealer.userId}`)}
    >
      <View style={styles.gradient}>
        <View style={styles.logoWrap}>
          {dealer.logo ? (
            <Image source={{ uri: dealer.logo }} style={styles.logo} resizeMode="contain" />
          ) : (
            <Ionicons name="business" size={28} color={colors.accent} />
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>{dealer.businessName}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.city}>{dealer.city}</Text>
        </View>
        <View style={styles.row}>
          {dealer.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={colors.accent} />
              <Text style={styles.verifiedText}>Verificiran</Text>
            </View>
          )}
          {dealer.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{dealer.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
    marginRight: spacing.md,
  },
  gradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  logo: {
    width: 56,
    height: 56,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  city: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: colors.accent,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: spacing.sm,
  },
  ratingText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
