import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../lib/theme';
import { getListings, toggleFavorite, getFavorites } from '../../lib/firestore';
import { parseSearchQuery } from '../../lib/search-parser';
import { Listing, SearchFilters } from '../../types';
import ListingCard from '../../components/ListingCard';
import SearchBar from '../../components/SearchBar';
import FilterSheet from '../../components/FilterSheet';
import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/SkeletonCard';
import { useAuth } from '../../lib/auth-context';
import * as Haptics from 'expo-haptics';
import { DocumentSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Najnoviji' },
  { value: 'price-asc', label: 'Cijena \u2191' },
  { value: 'price-desc', label: 'Cijena \u2193' },
  { value: 'mileage-asc', label: 'Kilometra\u017ea \u2191' },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ make?: string }>();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(params.make ? { make: params.make } : {});
  const [sort, setSort] = useState('newest');
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadListings = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getListings(
        filters,
        sort,
        12,
        reset ? undefined : (lastDoc || undefined)
      );
      if (reset) {
        setListings(result.listings);
      } else {
        setListings(prev => [...prev, ...result.listings]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length === 12);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, sort, lastDoc]);

  useEffect(() => {
    loadListings(true);
  }, [filters, sort]);

  useEffect(() => {
    if (user) {
      getFavorites(user.uid).then(setFavoritesState);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    await loadListings(true);
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (query.trim()) {
      const parsed = parseSearchQuery(query);
      setFilters(parsed);
    } else {
      setFilters({});
    }
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

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const renderItem = ({ item, index }: { item: Listing; index: number }) => (
    <View style={{ marginLeft: index % 2 === 1 ? spacing.md : 0 }}>
      <ListingCard
        listing={item}
        onFavorite={handleFavorite}
        isFavorited={favorites.includes(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.searchHeader}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSearch}
          autoFocus={false}
        />
      </View>

      {/* Filter chips + results count */}
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.filterChip, activeFilterCount > 0 && styles.filterChipActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={16} color={activeFilterCount > 0 ? colors.white : colors.text} />
          <Text style={[styles.filterChipText, activeFilterCount > 0 && styles.filterChipTextActive]}>
            Filteri {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>

        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, sort === opt.value && styles.filterChipActive]}
            onPress={() => setSort(opt.value)}
          >
            <Text style={[styles.filterChipText, sort === opt.value && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!loading && listings.length > 0 && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsCount}>{listings.length}{hasMore ? '+' : ''} rezultata</Text>
        </View>
      )}

      {loading ? (
        <SkeletonList count={6} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Nema rezultata"
          subtitle="Pokušajte promijeniti filtere ili pretražiti nešto drugo"
        />
      ) : (
        <FlatList
          data={listings}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          onEndReached={() => {
            if (hasMore && !loadingMore) loadListings(false);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? (
            <ActivityIndicator style={{ padding: spacing.lg }} color={colors.accent} />
          ) : null}
        />
      )}

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setLastDoc(null);
          setHasMore(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: fontWeight.medium,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  columnWrapper: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  resultsRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  resultsCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});
