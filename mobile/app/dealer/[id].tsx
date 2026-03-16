import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { getDealer, getListingsByUser } from '../../lib/firestore';
import { Dealer, Listing } from '../../types';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';

export default function DealerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [dealerData, dealerListings] = await Promise.all([
        getDealer(id),
        getListingsByUser(id),
      ]);
      setDealer(dealerData);
      setListings(dealerListings.filter(l => l.status === 'active'));
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!dealer) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.notFound}>Salon nije pronađen</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Nazad</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Cover & Logo */}
        <View style={styles.coverSection}>
          {dealer.coverPhoto ? (
            <Image source={{ uri: dealer.coverPhoto }} style={styles.cover} />
          ) : (
            <View style={[styles.cover, { backgroundColor: colors.primaryLight }]} />
          )}
          <View style={styles.logoWrap}>
            {dealer.logo ? (
              <Image source={{ uri: dealer.logo }} style={styles.logo} resizeMode="contain" />
            ) : (
              <Ionicons name="business" size={36} color={colors.accent} />
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{dealer.businessName}</Text>
          {dealer.verified && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={styles.verifiedText}>Verificiran salon</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{dealer.address}, {dealer.city}</Text>
          </View>
          {dealer.phone && (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${dealer.phone}`)}>
              <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoTextLink}>{dealer.phone}</Text>
            </TouchableOpacity>
          )}
          {dealer.website && (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(dealer.website!)}>
              <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoTextLink}>{dealer.website}</Text>
            </TouchableOpacity>
          )}
          {dealer.workingHours && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{dealer.workingHours}</Text>
            </View>
          )}

          {dealer.rating > 0 && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color={colors.warning} />
              <Text style={styles.ratingValue}>{dealer.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({dealer.reviewCount} recenzija)</Text>
            </View>
          )}

          {dealer.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>O salonu</Text>
              <Text style={styles.description}>{dealer.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oglasi ({listings.length})</Text>
            {listings.length > 0 ? (
              <View style={styles.grid}>
                {listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </View>
            ) : (
              <EmptyState icon="car-outline" title="Nema oglasa" subtitle="Ovaj salon trenutno nema aktivnih oglasa" />
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  notFound: { fontSize: fontSize.lg, color: colors.textSecondary },
  backLink: { fontSize: fontSize.md, color: colors.accent, marginTop: spacing.md },
  backButton: {
    position: 'absolute', top: spacing.md, left: spacing.lg, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    ...shadows.md,
  },
  coverSection: { position: 'relative', marginBottom: 40 },
  cover: { width: '100%', height: 180 },
  logoWrap: {
    position: 'absolute', bottom: -30, left: spacing.lg,
    width: 70, height: 70, borderRadius: borderRadius.lg,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    ...shadows.md, overflow: 'hidden',
  },
  logo: { width: 70, height: 70 },
  content: { paddingHorizontal: spacing.lg },
  name: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.sm },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  verifiedText: { fontSize: fontSize.sm, color: colors.accent, fontWeight: fontWeight.medium },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  infoText: { fontSize: fontSize.md, color: colors.textSecondary },
  infoTextLink: { fontSize: fontSize.md, color: colors.accent },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  ratingValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  ratingCount: { fontSize: fontSize.sm, color: colors.textSecondary },
  section: { marginTop: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  description: { fontSize: fontSize.md, color: colors.text, lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
