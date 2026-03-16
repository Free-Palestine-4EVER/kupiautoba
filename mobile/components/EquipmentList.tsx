import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../lib/theme';
import { equipmentOptions } from '../lib/car-data';

interface EquipmentListProps {
  equipment: string[];
}

export default function EquipmentList({ equipment }: EquipmentListProps) {
  if (!equipment || equipment.length === 0) return null;

  const grouped = equipmentOptions
    .map(cat => ({
      category: cat.category,
      items: cat.items.filter(item => equipment.includes(item)),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <View style={styles.container}>
      {grouped.map((group) => (
        <View key={group.category} style={styles.group}>
          <Text style={styles.groupTitle}>{group.category}</Text>
          <View style={styles.itemsWrap}>
            {group.items.map((item) => (
              <View key={item} style={styles.item}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  itemText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
