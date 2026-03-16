import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import { carMakes, fuelTypes, transmissionTypes, bodyTypes, bihCities, colorOptions } from '../lib/car-data';
import { SearchFilters } from '../types';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

export default function FilterSheet({ visible, onClose, filters, onApply }: FilterSheetProps) {
  const [local, setLocal] = useState<SearchFilters>({ ...filters });

  const update = (key: keyof SearchFilters, value: unknown) => {
    setLocal(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleReset = () => {
    setLocal({});
  };

  const selectedMake = carMakes.find(m => m.label === local.make);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filteri</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Marka</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {carMakes.map(m => (
              <TouchableOpacity
                key={m.value}
                style={[styles.chip, local.make === m.label && styles.chipActive]}
                onPress={() => update('make', local.make === m.label ? undefined : m.label)}
              >
                <Text style={[styles.chipText, local.make === m.label && styles.chipTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedMake && (
            <>
              <Text style={styles.sectionTitle}>Model</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {selectedMake.models.map(model => (
                  <TouchableOpacity
                    key={model}
                    style={[styles.chip, local.model === model && styles.chipActive]}
                    onPress={() => update('model', local.model === model ? undefined : model)}
                  >
                    <Text style={[styles.chipText, local.model === model && styles.chipTextActive]}>
                      {model}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.sectionTitle}>Cijena (KM)</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={styles.rangeInput}
              placeholder="Od"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={local.priceFrom?.toString() || ''}
              onChangeText={t => update('priceFrom', t ? parseInt(t) : undefined)}
            />
            <Text style={styles.rangeDash}>-</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="Do"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={local.priceTo?.toString() || ''}
              onChangeText={t => update('priceTo', t ? parseInt(t) : undefined)}
            />
          </View>

          <Text style={styles.sectionTitle}>Godište</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={styles.rangeInput}
              placeholder="Od"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={local.yearFrom?.toString() || ''}
              onChangeText={t => update('yearFrom', t ? parseInt(t) : undefined)}
            />
            <Text style={styles.rangeDash}>-</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="Do"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={local.yearTo?.toString() || ''}
              onChangeText={t => update('yearTo', t ? parseInt(t) : undefined)}
            />
          </View>

          <Text style={styles.sectionTitle}>Kilometraža</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={styles.rangeInput}
              placeholder="Od"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={local.mileageFrom?.toString() || ''}
              onChangeText={t => update('mileageFrom', t ? parseInt(t) : undefined)}
            />
            <Text style={styles.rangeDash}>-</Text>
            <TextInput
              style={styles.rangeInput}
              placeholder="Do"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={local.mileageTo?.toString() || ''}
              onChangeText={t => update('mileageTo', t ? parseInt(t) : undefined)}
            />
          </View>

          <Text style={styles.sectionTitle}>Gorivo</Text>
          <View style={styles.chipWrap}>
            {fuelTypes.map(f => (
              <TouchableOpacity
                key={f.value}
                style={[styles.chip, local.fuel === f.value && styles.chipActive]}
                onPress={() => update('fuel', local.fuel === f.value ? undefined : f.value)}
              >
                <Text style={[styles.chipText, local.fuel === f.value && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Mjenjač</Text>
          <View style={styles.chipWrap}>
            {transmissionTypes.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, local.transmission === t.value && styles.chipActive]}
                onPress={() => update('transmission', local.transmission === t.value ? undefined : t.value)}
              >
                <Text style={[styles.chipText, local.transmission === t.value && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Tip karoserije</Text>
          <View style={styles.chipWrap}>
            {bodyTypes.map(b => (
              <TouchableOpacity
                key={b.value}
                style={[styles.chip, local.body === b.value && styles.chipActive]}
                onPress={() => update('body', local.body === b.value ? undefined : b.value)}
              >
                <Text style={[styles.chipText, local.body === b.value && styles.chipTextActive]}>
                  {b.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Grad</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {bihCities.slice(0, 20).map(city => (
              <TouchableOpacity
                key={city}
                style={[styles.chip, local.city === city && styles.chipActive]}
                onPress={() => update('city', local.city === city ? undefined : city)}
              >
                <Text style={[styles.chipText, local.city === city && styles.chipTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Boja</Text>
          <View style={styles.chipWrap}>
            {colorOptions.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, local.color === c && styles.chipActive]}
                onPress={() => update('color', local.color === c ? undefined : c)}
              >
                <Text style={[styles.chipText, local.color === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Primijeni filtere</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  resetText: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  chipScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  rangeDash: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  applyText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});
