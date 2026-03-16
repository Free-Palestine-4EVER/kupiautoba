import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Pressable, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/theme';
import { getFuelColor } from '../lib/theme';
import { formatPrice, formatMileage, timeAgo, getFuelLabel } from '../lib/utils';
import { Listing } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

interface ListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export default function ListingCard({ listing, onFavorite, isFavorited = false }: ListingCardProps) {
  const router = useRouter();
  const fuelColor = getFuelColor(listing.fuel);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[styles.card, shadows.md]}
        onPress={() => router.push(`/listing/${listing.id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.imageWrap}>
          {listing.photos && listing.photos.length > 0 ? (
            <Image source={{ uri: listing.photos[0] }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Ionicons name="car-outline" size={32} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>
              {listing.negotiable ? 'Po dogovoru' : formatPrice(listing.price, listing.currency)}
            </Text>
          </View>
          {listing.priceIncludesVAT && (
            <View style={styles.vatBadge}>
              <Text style={styles.vatText}>PDV</Text>
            </View>
          )}
          {onFavorite && (
            <TouchableOpacity
              style={styles.favButton}
              onPress={(e) => {
                e.stopPropagation?.();
                onFavorite(listing.id);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorited ? colors.error : colors.white}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.make} {listing.model}
          </Text>
          <View style={styles.detailsRow}>
            <Text style={styles.details} numberOfLines={1}>
              {listing.year} &bull; {formatMileage(listing.mileage)}
            </Text>
            <View style={[styles.fuelPill, { backgroundColor: fuelColor + '20' }]}>
              <View style={[styles.fuelDot, { backgroundColor: fuelColor }]} />
              <Text style={[styles.fuelText, { color: fuelColor }]}>{getFuelLabel(listing.fuel)}</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.cityRow}>
              <Ionicons name="location-outline" size={12} color={colors.textMuted} />
              <Text style={styles.city}>{listing.city}</Text>
            </View>
            <Text style={styles.time}>{timeAgo(listing.createdAt)}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
  },
  placeholder: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  priceText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  vatBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  vatText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: fontWeight.bold,
  },
  favButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  details: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  fuelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  fuelDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  fuelText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  city: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
