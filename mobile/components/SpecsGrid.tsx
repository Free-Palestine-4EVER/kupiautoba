import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import { formatMileage, formatPower, getFuelLabel, getTransmissionLabel, getBodyLabel } from '../lib/utils';
import { Listing } from '../types';

interface SpecsGridProps {
  listing: Listing;
}

export default function SpecsGrid({ listing }: SpecsGridProps) {
  const specs = [
    { icon: 'calendar-outline' as const, label: 'Godište', value: listing.year.toString() },
    { icon: 'speedometer-outline' as const, label: 'Kilometraža', value: formatMileage(listing.mileage) },
    { icon: 'flame-outline' as const, label: 'Gorivo', value: getFuelLabel(listing.fuel) },
    { icon: 'cog-outline' as const, label: 'Mjenjač', value: getTransmissionLabel(listing.transmission) },
    { icon: 'car-outline' as const, label: 'Karoserija', value: getBodyLabel(listing.body) },
    { icon: 'flash-outline' as const, label: 'Snaga', value: formatPower(listing.power) },
    ...(listing.engineSize ? [{ icon: 'hardware-chip-outline' as const, label: 'Zapremina', value: `${listing.engineSize} ccm` }] : []),
    ...(listing.color ? [{ icon: 'color-palette-outline' as const, label: 'Boja', value: listing.color }] : []),
    ...(listing.doors ? [{ icon: 'tablet-landscape-outline' as const, label: 'Vrata', value: listing.doors.toString() }] : []),
    ...(listing.driveType ? [{ icon: 'git-branch-outline' as const, label: 'Pogon', value: listing.driveType === 'prednji' ? 'FWD' : listing.driveType === 'zadnji' ? 'RWD' : '4x4' }] : []),
  ];

  return (
    <View style={styles.grid}>
      {specs.map((spec, i) => (
        <View key={i} style={styles.specItem}>
          <Ionicons name={spec.icon} size={20} color={colors.accent} />
          <Text style={styles.specLabel}>{spec.label}</Text>
          <Text style={styles.specValue} numberOfLines={1}>{spec.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    width: '50%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  specLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  specValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
