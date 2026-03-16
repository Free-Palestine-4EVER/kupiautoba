import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, shadows } from '../lib/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  placeholder = 'Pretraži (npr. "golf 7 dizel do 15000")',
  autoFocus = false,
  editable = true,
  onPress,
}: SearchBarProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[styles.container, shadows.md]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    padding: 0,
  },
});
