import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/theme';

interface ImportSectionProps {
  onImport: (url: string) => Promise<void>;
}

export default function ImportSection({ onImport }: ImportSectionProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await onImport(url.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, shadows.md]}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="download-outline" size={24} color={colors.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Uvezi oglas</Text>
          <Text style={styles.subtitle}>Zalijepi link sa OLX, AutoPlac ili AutoBum</Text>
        </View>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://olx.ba/artikal/..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TouchableOpacity
          style={[styles.importButton, !url.trim() && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={!url.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary + '08',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.accent + '25',
    borderStyle: 'dashed',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accent + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  importButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonDisabled: {
    opacity: 0.5,
  },
});
