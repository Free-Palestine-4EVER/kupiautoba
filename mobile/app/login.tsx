import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/theme';
import { useAuth } from '../lib/auth-context';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      Alert.alert('Greška', 'Google prijava nije uspjela. Pokušajte ponovo.');
      setGoogleLoading(false);
    }
  }, [response]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email je obavezan';
    else if (!email.includes('@')) errs.email = 'Unesite validan email';
    if (!password) errs.password = 'Lozinka je obavezna';
    else if (password.length < 6) errs.password = 'Lozinka mora imati najmanje 6 karaktera';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.back();
    } catch (err: any) {
      const msg =
        err.code === 'auth/user-not-found'
          ? 'Korisnik nije pronađen'
          : err.code === 'auth/wrong-password'
            ? 'Pogrešna lozinka'
            : err.code === 'auth/invalid-credential'
              ? 'Pogrešan email ili lozinka'
              : err.code === 'auth/too-many-requests'
                ? 'Previše neuspjelih pokušaja. Pokušajte ponovo kasnije.'
                : err.code === 'auth/user-disabled'
                  ? 'Ovaj nalog je deaktiviran.'
                  : 'Greška pri prijavi. Pokušajte ponovo.';
      Alert.alert('Greška', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken: string) => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(idToken);
      router.back();
    } catch (err: any) {
      const msg =
        err.code === 'auth/account-exists-with-different-credential'
          ? 'Nalog sa ovim emailom već postoji sa drugom metodom prijave.'
          : err.code === 'auth/user-disabled'
            ? 'Ovaj nalog je deaktiviran.'
            : 'Google prijava nije uspjela. Pokušajte ponovo.';
      Alert.alert('Greška', msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'Zaboravili ste lozinku?',
      'Unesite email adresu i poslaćemo vam link za resetovanje lozinke.',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Pošalji',
          onPress: async (inputEmail?: string) => {
            const trimmed = inputEmail?.trim();
            if (!trimmed || !trimmed.includes('@')) {
              Alert.alert('Greška', 'Unesite validnu email adresu.');
              return;
            }
            try {
              await resetPassword(trimmed);
              Alert.alert(
                'Email poslan',
                'Provjerite vaš inbox za link za resetovanje lozinke.',
              );
            } catch (err: any) {
              const msg =
                err.code === 'auth/user-not-found'
                  ? 'Ne postoji nalog sa ovom email adresom.'
                  : err.code === 'auth/too-many-requests'
                    ? 'Previše zahtjeva. Pokušajte ponovo kasnije.'
                    : 'Greška pri slanju emaila. Pokušajte ponovo.';
              Alert.alert('Greška', msg);
            }
          },
        },
      ],
      'plain-text',
      email.trim(),
      'email-address',
    );
  };

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

          {/* Branding */}
          <View style={styles.brandingContainer}>
            <View style={styles.brandingIconWrap}>
              <Ionicons name="car-sport" size={36} color={colors.white} />
            </View>
            <Text style={styles.brandingTitle}>KupiAuto.ba</Text>
            <Text style={styles.brandingSubtitle}>Vaša pouzdana auto platforma</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Prijava</Text>
            <Text style={styles.subtitle}>Dobrodošli nazad! Prijavite se na vaš nalog.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="vase@email.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Lozinka</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Vaša lozinka"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot password link */}
            <TouchableOpacity style={styles.forgotPasswordWrap} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Zaboravili ste lozinku?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleLogin}
              disabled={loading || googleLoading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Prijavi se</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ili</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google sign-in button */}
            <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
              onPress={() => {
                setGoogleLoading(true);
                promptAsync();
              }}
              disabled={!request || loading || googleLoading}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <Image
                    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>Nastavi sa Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Nemate račun? </Text>
            <TouchableOpacity onPress={() => router.replace('/register')}>
              <Text style={styles.registerLink}>Registrujte se</Text>
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

  // Branding
  brandingContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  brandingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  brandingTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Header
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
    lineHeight: 22,
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
    borderWidth: 1.5,
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

  // Forgot password
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },

  // Primary button
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...shadows.md,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },

  // Google button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.sm,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  googleButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  registerText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: fontWeight.bold,
  },
});
