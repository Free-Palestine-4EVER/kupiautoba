import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import { useAuth } from '../lib/auth-context';
import { bihCities } from '../lib/car-data';

type RegistrationType = 'korisnik' | 'salon';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [registrationType, setRegistrationType] = useState<RegistrationType>('korisnik');

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Dealer-specific fields
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDealer = registrationType === 'salon';

  const filteredCities = citySearch
    ? bihCities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()))
    : bihCities;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Ime je obavezno';
    if (!email.trim()) errs.email = 'Email je obavezan';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Unesite validan email';
    if (!password) errs.password = 'Lozinka je obavezna';
    else if (password.length < 6) errs.password = 'Lozinka mora imati najmanje 6 karaktera';

    if (isDealer) {
      if (!businessName.trim()) errs.businessName = 'Naziv firme je obavezan';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isDealer) {
        const dealerInfo: Record<string, string> = {
          businessName: businessName.trim(),
        };
        if (address.trim()) dealerInfo.address = address.trim();
        if (workingHours.trim()) dealerInfo.workingHours = workingHours.trim();

        await signUp(
          email.trim(),
          password,
          name.trim(),
          phone.trim() || undefined,
          city || undefined,
          true,
          dealerInfo,
        );
      } else {
        await signUp(
          email.trim(),
          password,
          name.trim(),
          phone.trim() || undefined,
          city || undefined,
          false,
        );
      }
      router.back();
    } catch (err: any) {
      let msg = 'Greška pri registraciji. Pokušajte ponovo.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Ovaj email je već u upotrebi.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Lozinka je preslaba. Koristite najmanje 6 karaktera.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Email adresa nije validna.';
      }
      Alert.alert('Greška', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSwitch = (type: RegistrationType) => {
    setRegistrationType(type);
    setErrors({});
  };

  const subtitleText = isDealer
    ? 'Registrujte svoj auto salon na KupiAuto.ba'
    : 'Napravite račun na KupiAuto.ba';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Registracija</Text>
            <Text style={styles.subtitle}>{subtitleText}</Text>
          </View>

          {/* Registration type toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.togglePill,
                registrationType === 'korisnik' && styles.togglePillActive,
              ]}
              onPress={() => handleTypeSwitch('korisnik')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={registrationType === 'korisnik' ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  registrationType === 'korisnik' && styles.toggleTextActive,
                ]}
              >
                Korisnik
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.togglePill,
                registrationType === 'salon' && styles.togglePillActive,
              ]}
              onPress={() => handleTypeSwitch('salon')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="business-outline"
                size={18}
                color={registrationType === 'salon' ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleText,
                  registrationType === 'salon' && styles.toggleTextActive,
                ]}
              >
                Auto Salon
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {isDealer ? 'Ime i prezime (vlasnik) *' : 'Ime i prezime *'}
              </Text>
              <View style={[styles.inputWrap, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Vaše ime"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="vase@email.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Lozinka *</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 6 karaktera"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>Telefon</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+387 61 123 456"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* City picker */}
            <View style={styles.field}>
              <Text style={styles.label}>Grad</Text>
              <TouchableOpacity
                style={styles.inputWrap}
                onPress={() => setShowCityPicker(!showCityPicker)}
                activeOpacity={0.7}
              >
                <Ionicons name="location-outline" size={20} color={colors.textMuted} />
                <Text style={city ? styles.pickerText : styles.pickerPlaceholder}>
                  {city || 'Odaberite grad'}
                </Text>
                <Ionicons
                  name={showCityPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
              {showCityPicker && (
                <View style={styles.pickerDropdown}>
                  <View style={styles.pickerSearchWrap}>
                    <Ionicons name="search-outline" size={16} color={colors.textMuted} />
                    <TextInput
                      style={styles.pickerSearchInput}
                      value={citySearch}
                      onChangeText={setCitySearch}
                      placeholder="Pretraži grad..."
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="none"
                    />
                    {citySearch.length > 0 && (
                      <TouchableOpacity onPress={() => setCitySearch('')}>
                        <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView style={styles.pickerList} nestedScrollEnabled>
                    {filteredCities.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.pickerOption,
                          city === c && styles.pickerOptionSelected,
                        ]}
                        onPress={() => {
                          setCity(c);
                          setShowCityPicker(false);
                          setCitySearch('');
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerOptionText,
                            city === c && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {c}
                        </Text>
                        {city === c && (
                          <Ionicons name="checkmark" size={18} color={colors.accent} />
                        )}
                      </TouchableOpacity>
                    ))}
                    {filteredCities.length === 0 && (
                      <View style={styles.pickerEmpty}>
                        <Text style={styles.pickerEmptyText}>Nema rezultata</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Dealer-specific fields */}
            {isDealer && (
              <View style={styles.dealerSection}>
                <View style={styles.dealerSectionHeader}>
                  <Ionicons name="storefront-outline" size={20} color={colors.accent} />
                  <Text style={styles.dealerSectionTitle}>Podaci o salonu</Text>
                </View>

                {/* Business name */}
                <View style={styles.field}>
                  <Text style={styles.label}>Naziv firme *</Text>
                  <View style={[styles.inputWrap, errors.businessName && styles.inputError]}>
                    <Ionicons name="business-outline" size={20} color={colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={businessName}
                      onChangeText={setBusinessName}
                      placeholder="Npr. Auto Salon Premium"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                  {errors.businessName && (
                    <Text style={styles.errorText}>{errors.businessName}</Text>
                  )}
                </View>

                {/* Address */}
                <View style={styles.field}>
                  <Text style={styles.label}>Adresa</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="map-outline" size={20} color={colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Ulica i broj"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                {/* Working hours */}
                <View style={styles.field}>
                  <Text style={styles.label}>Radno vrijeme</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="time-outline" size={20} color={colors.textMuted} />
                    <TextInput
                      style={styles.input}
                      value={workingHours}
                      onChangeText={setWorkingHours}
                      placeholder="Npr. Pon-Pet 09-17, Sub 09-13"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Register button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isDealer ? 'Registruj salon' : 'Registruj se'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Već imate račun? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Prijavi se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    marginTop: spacing.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  // Toggle pills
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.xxl,
    gap: spacing.xs,
  },
  togglePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  togglePillActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },

  // Form
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: 2,
  },

  // City picker
  pickerText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  pickerDropdown: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  pickerSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    paddingVertical: 2,
  },
  pickerList: {
    maxHeight: 200,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerOptionSelected: {
    backgroundColor: colors.background,
  },
  pickerOptionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  pickerOptionTextSelected: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  pickerEmpty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  pickerEmptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Dealer section
  dealerSection: {
    gap: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dealerSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dealerSectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  // Button
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  loginText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
});
