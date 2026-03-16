import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { carMakes, fuelTypes, transmissionTypes, bodyTypes, bihCities, colorOptions, equipmentOptions } from '../../lib/car-data';
import { createListing } from '../../lib/firestore';
import { uploadListingImages } from '../../lib/storage';
import { useAuth } from '../../lib/auth-context';
import ImportSection from '../../components/ImportSection';
import { Listing } from '../../types';

export default function PostScreen() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState('');
  const [power, setPower] = useState('');
  const [engineSize, setEngineSize] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [includesVAT, setIncludesVAT] = useState(false);
  const [tradeAllowed, setTradeAllowed] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [showMakePicker, setShowMakePicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.authPrompt}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
          <Text style={styles.authTitle}>Prijavite se za objavu</Text>
          <Text style={styles.authSubtitle}>Morate biti prijavljeni da biste objavili oglas</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Prijavi se</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - photos.length,
    });
    if (!result.canceled) {
      setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 10));
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Dozvola', 'Potrebna je dozvola za kameru');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 10));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const selectedMake = carMakes.find(m => m.label === make);
  const models = selectedMake?.models || [];

  const handleSubmit = async () => {
    if (!make || !model || !year || !mileage || !price || !fuel || !transmission || !body || !city) {
      Alert.alert('Greška', 'Molimo popunite sva obavezna polja');
      return;
    }

    setLoading(true);
    try {
      const listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'> = {
        userId: user.uid,
        title: `${make} ${model}`,
        make,
        model,
        year: parseInt(year),
        mileage: parseInt(mileage),
        fuel: fuel as Listing['fuel'],
        transmission: transmission as Listing['transmission'],
        body: body as Listing['body'],
        color,
        power: parseInt(power) || 0,
        engineSize: parseInt(engineSize) || 0,
        price: parseInt(price),
        currency: 'KM',
        negotiable,
        priceIncludesVAT: includesVAT,
        tradeAllowed,
        description,
        equipment: selectedEquipment,
        photos: [],
        city,
        region: '',
        status: 'active',
        sellerName: userProfile?.displayName || '',
        sellerPhone: phone || userProfile?.phone || '',
      };

      const listingId = await createListing(listingData, user.uid);

      if (photos.length > 0) {
        const photoUrls = await uploadListingImages(photos, listingId);
        const { updateListing } = await import('../../lib/firestore');
        await updateListing(listingId, { photos: photoUrls });
      }

      Alert.alert('Uspjeh', 'Oglas je uspješno objavljen!', [
        { text: 'OK', onPress: () => router.push(`/listing/${listingId}`) },
      ]);
    } catch (err) {
      Alert.alert('Greška', 'Došlo je do greške prilikom objave oglasa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (url: string) => {
    try {
      const response = await fetch('http://localhost:3002/api/import-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const data = await response.json();

      // Auto-fill form fields from imported data
      if (data.make) setMake(data.make);
      if (data.model) setModel(data.model);
      if (data.year) setYear(data.year.toString());
      if (data.mileage) setMileage(data.mileage.toString());
      if (data.fuel) setFuel(data.fuel);
      if (data.transmission) setTransmission(data.transmission);
      if (data.body) setBody(data.body);
      if (data.color) setColor(data.color);
      if (data.power) setPower(data.power.toString());
      if (data.engineSize) setEngineSize(data.engineSize.toString());
      if (data.price) setPrice(data.price.toString());
      if (data.description) setDescription(data.description);
      if (data.equipment) setSelectedEquipment(data.equipment);
      if (data.city) setCity(data.city);
      if (data.photos && data.photos.length > 0) setPhotos(data.photos);
      if (data.negotiable !== undefined) setNegotiable(data.negotiable);

      Alert.alert('Uspjeh', 'Oglas je uspješno uvezen! Provjerite podatke i objavite.');
    } catch (err) {
      Alert.alert('Greška', 'Nije moguće uvesti oglas. Provjerite link i pokušajte ponovo.');
      console.error('Import error:', err);
    }
  };

  const getProgress = () => {
    let filled = 0;
    const required = 9; // make, model, year, mileage, fuel, transmission, body, city, price
    if (make) filled++;
    if (model) filled++;
    if (year) filled++;
    if (mileage) filled++;
    if (fuel) filled++;
    if (transmission) filled++;
    if (body) filled++;
    if (city) filled++;
    if (price) filled++;
    return (filled / required) * 100;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Objavi oglas</Text>

          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(getProgress())}%</Text>
          </View>

          {/* Import Section */}
          <View style={styles.importSection}>
            <ImportSection onImport={handleImport} />
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotografije</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoWrap}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(i)}>
                    <Ionicons name="close-circle" size={22} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 10 && (
                <View style={styles.addPhotoButtons}>
                  <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                    <Ionicons name="images-outline" size={24} color={colors.accent} />
                    <Text style={styles.addPhotoText}>Galerija</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addPhotoBtn} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={24} color={colors.accent} />
                    <Text style={styles.addPhotoText}>Kamera</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Vehicle Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informacije o vozilu</Text>

            <Text style={styles.fieldLabel}>Marka *</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setShowMakePicker(!showMakePicker)}>
              <Text style={make ? styles.pickerText : styles.pickerPlaceholder}>
                {make || 'Odaberite marku'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            {showMakePicker && (
              <View style={styles.pickerOptions}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {carMakes.map(m => (
                    <TouchableOpacity
                      key={m.value}
                      style={styles.pickerOption}
                      onPress={() => { setMake(m.label); setModel(''); setShowMakePicker(false); }}
                    >
                      <Text style={[styles.pickerOptionText, m.label === make && { color: colors.accent }]}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {make && (
              <>
                <Text style={styles.fieldLabel}>Model *</Text>
                <TouchableOpacity style={styles.picker} onPress={() => setShowModelPicker(!showModelPicker)}>
                  <Text style={model ? styles.pickerText : styles.pickerPlaceholder}>
                    {model || 'Odaberite model'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                </TouchableOpacity>
                {showModelPicker && (
                  <View style={styles.pickerOptions}>
                    <ScrollView style={{ maxHeight: 200 }}>
                      {models.map(m => (
                        <TouchableOpacity
                          key={m}
                          style={styles.pickerOption}
                          onPress={() => { setModel(m); setShowModelPicker(false); }}
                        >
                          <Text style={[styles.pickerOptionText, m === model && { color: colors.accent }]}>{m}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            )}

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Godište *</Text>
                <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" placeholder="2020" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Kilometraža *</Text>
                <TextInput style={styles.input} value={mileage} onChangeText={setMileage} keyboardType="numeric" placeholder="100000" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Gorivo *</Text>
            <View style={styles.chipWrap}>
              {fuelTypes.map(f => (
                <TouchableOpacity key={f.value} style={[styles.chip, fuel === f.value && styles.chipActive]} onPress={() => setFuel(f.value)}>
                  <Text style={[styles.chipText, fuel === f.value && styles.chipTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Mjenjač *</Text>
            <View style={styles.chipWrap}>
              {transmissionTypes.map(t => (
                <TouchableOpacity key={t.value} style={[styles.chip, transmission === t.value && styles.chipActive]} onPress={() => setTransmission(t.value)}>
                  <Text style={[styles.chipText, transmission === t.value && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Karoserija *</Text>
            <View style={styles.chipWrap}>
              {bodyTypes.map(b => (
                <TouchableOpacity key={b.value} style={[styles.chip, body === b.value && styles.chipActive]} onPress={() => setBody(b.value)}>
                  <Text style={[styles.chipText, body === b.value && styles.chipTextActive]}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Snaga (kW)</Text>
                <TextInput style={styles.input} value={power} onChangeText={setPower} keyboardType="numeric" placeholder="110" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Zapremina (ccm)</Text>
                <TextInput style={styles.input} value={engineSize} onChangeText={setEngineSize} keyboardType="numeric" placeholder="2000" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Boja</Text>
            <View style={styles.chipWrap}>
              {colorOptions.map(c => (
                <TouchableOpacity key={c} style={[styles.chip, color === c && styles.chipActive]} onPress={() => setColor(c)}>
                  <Text style={[styles.chipText, color === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cijena</Text>
            <Text style={styles.fieldLabel}>Cijena (KM) *</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="25000" placeholderTextColor={colors.textMuted} />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Po dogovoru</Text>
              <Switch value={negotiable} onValueChange={setNegotiable} trackColor={{ true: colors.accent }} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Cijena sa PDV-om</Text>
              <Switch value={includesVAT} onValueChange={setIncludesVAT} trackColor={{ true: colors.accent }} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Zamjena moguća</Text>
              <Switch value={tradeAllowed} onValueChange={setTradeAllowed} trackColor={{ true: colors.accent }} />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              placeholder="Opišite vaše vozilo..."
              placeholderTextColor={colors.textMuted}
              textAlignVertical="top"
            />
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oprema</Text>
            {equipmentOptions.map(cat => (
              <View key={cat.category}>
                <Text style={styles.equipCategory}>{cat.category}</Text>
                <View style={styles.chipWrap}>
                  {cat.items.map(item => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.chip, selectedEquipment.includes(item) && styles.chipActive]}
                      onPress={() => toggleEquipment(item)}
                    >
                      <Text style={[styles.chipText, selectedEquipment.includes(item) && styles.chipTextActive]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Contact & Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kontakt i lokacija</Text>
            <Text style={styles.fieldLabel}>Grad *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipWrap}>
                {bihCities.slice(0, 20).map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, city === c && styles.chipActive]} onPress={() => setCity(c)}>
                    <Text style={[styles.chipText, city === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Telefon</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+387 61 123 456" placeholderTextColor={colors.textMuted} />
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitText}>Objavi oglas</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1, paddingHorizontal: spacing.lg },
  pageTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xxl },
  importSection: {
    marginBottom: spacing.xxl,
    backgroundColor: colors.primary + '08',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent + '20',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  progressBar: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  progressText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.accent },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.md, color: colors.text, borderWidth: 1, borderColor: colors.border },
  textArea: { minHeight: 120, paddingTop: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: fontWeight.medium },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  switchLabel: { fontSize: fontSize.md, color: colors.text },
  equipCategory: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoWrap: { width: 100, height: 100, borderRadius: borderRadius.md, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 2, right: 2 },
  addPhotoButtons: { flexDirection: 'row', gap: spacing.sm },
  addPhotoBtn: { width: 100, height: 100, borderRadius: borderRadius.md, borderWidth: 2, borderColor: colors.accent + '40', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  addPhotoText: { fontSize: fontSize.xs, color: colors.accent },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  pickerText: { fontSize: fontSize.md, color: colors.text },
  pickerPlaceholder: { fontSize: fontSize.md, color: colors.textMuted },
  pickerOptions: { backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xs },
  pickerOption: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  pickerOptionText: { fontSize: fontSize.md, color: colors.text },
  submitButton: { backgroundColor: colors.accent, borderRadius: borderRadius.lg, paddingVertical: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  submitText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md },
  authTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  authSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
  loginButton: { backgroundColor: colors.accent, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xxxl, paddingVertical: spacing.md, marginTop: spacing.md },
  loginButtonText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
