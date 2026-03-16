import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { getListings, getDealers } from '../../lib/firestore';
import { Listing, Dealer } from '../../types';
import ListingCard from '../../components/ListingCard';
import DealerCard from '../../components/DealerCard';
import SearchBar from '../../components/SearchBar';
import { SkeletonList } from '../../components/SkeletonCard';
import { useAuth } from '../../lib/auth-context';
import { toggleFavorite, getFavorites } from '../../lib/firestore';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const POPULAR_BRANDS = [
  { label: 'BMW', icon: 'car-sport' },
  { label: 'Mercedes-Benz', icon: 'car-sport' },
  { label: 'Audi', icon: 'car-sport' },
  { label: 'Volkswagen', icon: 'car-sport' },
  { label: 'Toyota', icon: 'car-sport' },
  { label: 'Ford', icon: 'car-sport' },
  { label: 'Opel', icon: 'car-sport' },
  { label: 'Škoda', icon: 'car-sport' },
  { label: 'Renault', icon: 'car-sport' },
  { label: 'Peugeot', icon: 'car-sport' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [featured, recent, dealersList] = await Promise.all([
        getListings({}, 'newest', 6),
        getListings({}, 'newest', 8),
        getDealers(),
      ]);
      setFeaturedListings(featured.listings);
      setRecentListings(recent.listings.slice(0, 8));
      setDealers(dealersList.slice(0, 5));
      if (user) {
        const favs = await getFavorites(user.uid);
        setFavoritesState(favs);
      }
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleFavorite = async (listingId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isFav = await toggleFavorite(user.uid, listingId);
    setFavoritesState(prev =>
      isFav ? [...prev, listingId] : prev.filter(id => id !== listingId)
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.logo}>KupiAuto</Text>
                <Text style={styles.logoSub}>.ba</Text>
              </View>
              <TouchableOpacity style={styles.bellButton}>
                <Ionicons name="notifications-outline" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroSubtitle}>Pronađite savršeno vozilo</Text>
            <View style={styles.searchWrap}>
              <SearchBar
                value=""
                onChangeText={() => {}}
                editable={false}
                onPress={() => router.push('/(tabs)/search')}
              />
            </View>
          </View>
        </View>

        {/* Dealers Section */}
        {dealers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Istaknuti saloni</Text>
            <FlatList
              data={dealers}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
              renderItem={({ item }) => <DealerCard dealer={item} />}
              keyExtractor={item => item.userId}
            />
          </View>
        )}

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Istaknuti oglasi</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>Vidi sve</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <SkeletonList count={4} />
          ) : (
            <View style={styles.grid}>
              {featuredListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(listing.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Popular Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popularne marke</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          >
            {POPULAR_BRANDS.map(brand => (
              <TouchableOpacity
                key={brand.label}
                style={styles.brandCircle}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { make: brand.label } })}
              >
                <View style={styles.brandIcon}>
                  <Ionicons name="car-sport-outline" size={24} color={colors.accent} />
                </View>
                <Text style={styles.brandLabel} numberOfLines={1}>{brand.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upravo objavljeno</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAll}>Vidi sve</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <SkeletonList count={4} />
          ) : (
            <View style={styles.grid}>
              {recentListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(listing.id)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  logoSub: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: fontWeight.bold,
    marginTop: -4,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  brandCircle: {
    alignItems: 'center',
    width: 72,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  brandLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
