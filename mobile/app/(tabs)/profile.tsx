import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { useAuth } from '../../lib/auth-context';
import { getListingsByUser, getFavorites, getListing } from '../../lib/firestore';
import { Listing } from '../../types';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';
import { timeAgo } from '../../lib/utils';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, userProfile, signOutUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites'>('listings');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const listings = await getListingsByUser(user.uid);
      setMyListings(listings);

      const favIds = await getFavorites(user.uid);
      const favListings = await Promise.all(
        favIds.slice(0, 20).map(id => getListing(id))
      );
      setFavoriteListings(favListings.filter(Boolean) as Listing[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert('Odjava', 'Da li ste sigurni da se želite odjaviti?', [
      { text: 'Otkaži', style: 'cancel' },
      { text: 'Odjavi se', style: 'destructive', onPress: signOutUser },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.authContainer}>
          <View style={styles.authIllustration}>
            <Ionicons name="car-sport" size={64} color={colors.accent} />
          </View>
          <Text style={styles.authTitle}>Dobrodošli na KupiAuto</Text>
          <Text style={styles.authSubtitle}>Prijavite se za upravljanje oglasima, porukama i favoritima</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/login')}>
            <Ionicons name="log-in-outline" size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>Prijavi se</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/register')}>
            <Text style={styles.secondaryButtonText}>Nemate račun? Registrujte se</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarLarge} onPress={() => router.push('/edit-profile')}>
            {userProfile?.photoURL ? (
              <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={36} color={colors.textMuted} />
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{userProfile?.displayName || 'Korisnik'}</Text>
          {userProfile?.city && (
            <View style={styles.cityRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.profileCity}>{userProfile.city}</Text>
            </View>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myListings.length}</Text>
              <Text style={styles.statLabel}>Oglasi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{favoriteListings.length}</Text>
              <Text style={styles.statLabel}>Sačuvano</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile?.createdAt ? timeAgo(userProfile.createdAt) : '-'}</Text>
              <Text style={styles.statLabel}>Član od</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem icon="create-outline" label="Uredi profil" onPress={() => router.push('/edit-profile')} />
          <MenuItem icon="bookmark-outline" label="Sačuvane pretrage" onPress={() => {}} />
          <MenuItem icon="diamond-outline" label="Krediti" value="0 KM" onPress={() => {}} />
          <MenuItem icon="business-outline" label="Postani salon" onPress={() => {}} accent />
        </View>

        {/* Tabs: My Listings / Favorites */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
            onPress={() => setActiveTab('listings')}
          >
            <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>
              Moji oglasi ({myListings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              Sačuvano ({favoriteListings.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {activeTab === 'listings' ? (
            myListings.length > 0 ? (
              myListings.map(l => <ListingCard key={l.id} listing={l} />)
            ) : (
              <EmptyState icon="car-outline" title="Nemate oglasa" subtitle="Objavite vaš prvi oglas" />
            )
          ) : (
            favoriteListings.length > 0 ? (
              favoriteListings.map(l => <ListingCard key={l.id} listing={l} />)
            ) : (
              <EmptyState icon="heart-outline" title="Nema sačuvanih" subtitle="Sačuvajte oglase koji vam se sviđaju" />
            )
          )}
        </View>

        {/* Settings */}
        <View style={styles.menuSection}>
          <MenuItem icon="settings-outline" label="Postavke" onPress={() => {}} />
          <MenuItem icon="log-out-outline" label="Odjavi se" onPress={handleSignOut} destructive />
        </View>

        <Text style={styles.version}>KupiAuto v{Constants.expoConfig?.version || '1.0.0'}</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, value, onPress, accent, destructive }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  accent?: boolean;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity style={styles2.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles2.menuIcon, accent && styles2.menuIconAccent]}>
        <Ionicons name={icon} size={20} color={destructive ? colors.error : accent ? colors.accent : colors.text} />
      </View>
      <Text style={[styles2.menuLabel, destructive && styles2.menuLabelDestructive]}>{label}</Text>
      {value && <Text style={styles2.menuValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles2 = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconAccent: {
    backgroundColor: colors.accent + '15',
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  menuLabelDestructive: {
    color: colors.error,
  },
  menuValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: { width: 80, height: 80 },
  editAvatarBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  profileName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  profileCity: { fontSize: fontSize.sm, color: colors.textSecondary },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.xl, paddingTop: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
    width: '100%', paddingHorizontal: spacing.xxl,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.borderLight },
  menuSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xxl,
  },
  authContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  authIllustration: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  authTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.sm },
  authSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 22 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    width: '100%',
    justifyContent: 'center',
  },
  primaryButtonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  secondaryButton: { paddingVertical: spacing.lg },
  secondaryButtonText: { color: colors.accent, fontSize: fontSize.md, fontWeight: fontWeight.medium },
});
