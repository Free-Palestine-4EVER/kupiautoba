import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../lib/theme';
import { useAuth } from '../lib/auth-context';
import { uploadAvatar } from '../lib/storage';
import { bihCities } from '../lib/car-data';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [avatar, setAvatar] = useState(userProfile?.photoURL || '');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim()) {
      Alert.alert('Greška', 'Ime je obavezno');
      return;
    }
    setLoading(true);
    try {
      let photoURL = userProfile?.photoURL || null;
      if (avatar && avatar !== userProfile?.photoURL) {
        photoURL = await uploadAvatar(avatar, user.uid);
      }
      await updateUserProfile({
        displayName: name.trim(),
        phone: phone.trim(),
        city,
        photoURL,
      });
      Alert.alert('Uspjeh', 'Profil je ažuriran');
      router.back();
    } catch (err) {
      Alert.alert('Greška', 'Došlo je do greške');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Uredi profil</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Avatar */}
          <TouchableOpacity style={styles.avatarSection} onPress={pickAvatar}>
            <View style={styles.avatarWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={36} color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.changeAvatarText}>Promijeni sliku</Text>
          </TouchableOpacity>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Ime i prezime</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Vaše ime" placeholderTextColor={colors.textMuted} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+387 61 123 456" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Grad</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setShowCityPicker(!showCityPicker)}>
                <Text style={city ? styles.pickerText : styles.pickerPlaceholder}>{city || 'Odaberite grad'}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              {showCityPicker && (
                <View style={styles.pickerOptions}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {bihCities.slice(0, 20).map(c => (
                      <TouchableOpacity key={c} style={styles.pickerOption} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                        <Text style={styles.pickerOptionText}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Sačuvaj</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  avatarSection: { alignItems: 'center', marginVertical: spacing.xxl },
  avatarWrap: {
    width: 100, height: 100, borderRadius: borderRadius.full,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', marginBottom: spacing.sm,
  },
  avatarImage: { width: 100, height: 100 },
  changeAvatarText: { fontSize: fontSize.md, color: colors.accent, fontWeight: fontWeight.medium },
  form: { gap: spacing.xl },
  field: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary },
  input: {
    backgroundColor: colors.background, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.text,
  },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  pickerText: { fontSize: fontSize.md, color: colors.text },
  pickerPlaceholder: { fontSize: fontSize.md, color: colors.textMuted },
  pickerOptions: { backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xs },
  pickerOption: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  pickerOptionText: { fontSize: fontSize.md, color: colors.text },
  saveButton: {
    backgroundColor: colors.accent, borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xxl,
  },
  saveButtonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
});
