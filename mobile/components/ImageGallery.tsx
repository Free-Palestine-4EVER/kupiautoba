import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../lib/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageGalleryProps {
  photos: string[];
  height?: number;
}

export default function ImageGallery({ photos, height = 300 }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Ionicons name="car-outline" size={48} color={colors.textMuted} />
        <Text style={styles.placeholderText}>Nema fotografija</Text>
      </View>
    );
  }

  return (
    <>
      <View style={{ height }}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.95} onPress={() => setFullScreen(true)}>
              <Image source={{ uri: item }} style={{ width: SCREEN_WIDTH, height }} resizeMode="cover" />
            </TouchableOpacity>
          )}
          keyExtractor={(_, i) => i.toString()}
        />
        {photos.length > 1 && (
          <View style={styles.pagination}>
            <View style={styles.counter}>
              <Ionicons name="images-outline" size={14} color={colors.white} />
              <Text style={styles.counterText}>
                {activeIndex + 1}/{photos.length}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Modal visible={fullScreen} animationType="fade" statusBarTranslucent>
        <View style={styles.fullScreenContainer}>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
            keyExtractor={(_, i) => i.toString()}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setFullScreen(false)}>
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  pagination: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  counterText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
