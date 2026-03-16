import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { getListing, incrementViews, toggleFavorite, isFavorite, getUserProfile, sendMessage } from '../../lib/firestore';
import { formatPrice, formatMileage, timeAgo } from '../../lib/utils';
import { Listing } from '../../types';
import { useAuth } from '../../lib/auth-context';
import ImageGallery from '../../components/ImageGallery';
import SpecsGrid from '../../components/SpecsGrid';
import EquipmentList from '../../components/EquipmentList';
import * as Haptics from 'expo-haptics';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerName, setSellerName] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getListing(id);
      setListing(data);
      if (data) {
        incrementViews(id);
        const profile = await getUserProfile(data.userId);
        if (profile) setSellerName((profile.displayName as string) || 'Korisnik');
        if (user) {
          const fav = await isFavorite(user.uid, id);
          setFavorited(fav);
        }
      }
      setLoading(false);
    })();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user || !id) {
      router.push('/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await toggleFavorite(user.uid, id);
    setFavorited(result);
  };

  const handleShare = async () => {
    if (!listing) return;
    await Share.share({
      message: `${listing.make} ${listing.model} - ${formatPrice(listing.price, listing.currency)} | KupiAuto.ba`,
    });
  };

  const handleCall = () => {
    if (!listing?.sellerPhone) return;
    Linking.openURL(`tel:${listing.sellerPhone}`);
  };

  const handleWhatsApp = () => {
    if (!listing?.sellerPhone) return;
    const msg = encodeURIComponent(`Zdravo, zanima me vaš oglas: ${listing.make} ${listing.model}`);
    const phone = listing.sellerPhone.replace(/[^0-9+]/g, '');
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`);
  };

  const handleMessage = async () => {
    if (!user || !listing) {
      router.push('/login');
      return;
    }
    const convId = await sendMessage(
      user.uid,
      listing.userId,
      listing.id,
      `${listing.make} ${listing.model}`,
      listing.photos?.[0] || '',
      `Zdravo, zanima me vaš oglas: ${listing.make} ${listing.model}`
    );
    router.push(`/chat/${convId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.notFoundText}>Oglas nije pronađen</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Nazad</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ImageGallery photos={listing.photos} height={320} />

        {/* Back button overlay */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Action buttons overlay */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={22} color={favorited ? colors.error : colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {listing.negotiable ? 'Po dogovoru' : formatPrice(listing.price, listing.currency)}
            </Text>
            <View style={styles.badges}>
              {listing.priceIncludesVAT && (
                <View style={[styles.badge, { backgroundColor: colors.success }]}>
                  <Text style={styles.badgeText}>PDV</Text>
                </View>
              )}
              {listing.tradeAllowed && (
                <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.badgeText}>Zamjena</Text>
                </View>
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{listing.make} {listing.model}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{listing.city}</Text>
            <Text style={styles.metaDot}>&bull;</Text>
            <Text style={styles.metaText}>{timeAgo(listing.createdAt)}</Text>
            <Text style={styles.metaDot}>&bull;</Text>
            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{listing.views}</Text>
          </View>

          {/* Specs Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifikacije</Text>
            <View style={[styles.card, shadows.sm]}>
              <SpecsGrid listing={listing} />
            </View>
          </View>

          {/* Description */}
          {listing.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opis</Text>
              <View style={[styles.card, shadows.sm]}>
                <Text style={styles.descriptionText}>{listing.description}</Text>
              </View>
            </View>
          )}

          {/* Equipment */}
          {listing.equipment && listing.equipment.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Oprema</Text>
              <EquipmentList equipment={listing.equipment} />
            </View>
          )}

          {/* Seller Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prodavač</Text>
            <View style={[styles.sellerCard, shadows.md]}>
              <View style={styles.sellerAvatar}>
                <Ionicons name="person" size={24} color={colors.textMuted} />
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{listing.sellerName || sellerName}</Text>
                <Text style={styles.sellerCity}>{listing.city}</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, shadows.lg]}>
        {listing.sellerPhone && (
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color={colors.white} />
            <Text style={styles.callText}>Pozovi</Text>
          </TouchableOpacity>
        )}
        {listing.sellerPhone && (
          <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble" size={20} color={colors.accent} />
          <Text style={styles.messageText}>Poruka</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  notFoundText: { fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing.md },
  backLink: { fontSize: fontSize.md, color: colors.accent, marginTop: spacing.md },
  backButton: {
    position: 'absolute', top: 50, left: spacing.lg,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  topActions: {
    position: 'absolute', top: 50, right: spacing.lg,
    flexDirection: 'row', gap: spacing.sm,
  },
  actionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.accent },
  badges: { flexDirection: 'row', gap: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  badgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  metaText: { fontSize: fontSize.sm, color: colors.textSecondary },
  metaDot: { color: colors.textMuted },
  section: { marginTop: spacing.xxl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  descriptionText: { fontSize: fontSize.md, color: colors.text, lineHeight: 24 },
  sellerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight,
  },
  sellerAvatar: {
    width: 48, height: 48, borderRadius: borderRadius.full,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  sellerCity: { fontSize: fontSize.sm, color: colors.textSecondary },
  bottomBar: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
  callButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.success, borderRadius: borderRadius.lg, paddingVertical: spacing.md,
  },
  callText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  whatsappButton: {
    width: 48, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#25D366', borderRadius: borderRadius.lg,
  },
  messageButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.accent + '15', borderRadius: borderRadius.lg, paddingVertical: spacing.md,
    borderWidth: 1, borderColor: colors.accent,
  },
  messageText: { color: colors.accent, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
