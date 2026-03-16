import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { subscribeToConversations, getUserProfile } from '../../lib/firestore';
import { useAuth } from '../../lib/auth-context';
import { ConversationData } from '../../types';
import { timeAgo } from '../../lib/utils';
import EmptyState from '../../components/EmptyState';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToConversations(user.uid, async (convs) => {
      setConversations(convs);
      setLoading(false);

      // Fetch usernames for other participants
      const otherIds = convs.map(c => c.participants.find(p => p !== user.uid)).filter(Boolean) as string[];
      const uniqueIds = [...new Set(otherIds)].filter(id => !userNames[id]);
      const names: Record<string, string> = {};
      await Promise.all(
        uniqueIds.map(async (uid) => {
          const profile = await getUserProfile(uid);
          if (profile) names[uid] = (profile.displayName as string) || 'Korisnik';
        })
      );
      if (Object.keys(names).length > 0) {
        setUserNames(prev => ({ ...prev, ...names }));
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.authPrompt}>
          <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
          <Text style={styles.authTitle}>Prijavite se</Text>
          <Text style={styles.authSubtitle}>Morate biti prijavljeni da biste vidjeli poruke</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Prijavi se</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderConversation = ({ item }: { item: ConversationData }) => {
    const otherUserId = item.participants.find(p => p !== user.uid) || '';
    const otherName = userNames[otherUserId] || 'Korisnik';
    const unread = item.unreadCount[user.uid] || 0;

    return (
      <TouchableOpacity
        style={styles.convRow}
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color={colors.textMuted} />
        </View>
        <View style={styles.convContent}>
          <View style={styles.convTop}>
            <Text style={[styles.convName, unread > 0 && styles.unreadText]} numberOfLines={1}>
              {otherName}
            </Text>
            <Text style={styles.convTime}>{timeAgo(item.lastMessageAt)}</Text>
          </View>
          <View style={styles.convBottom}>
            <View style={styles.listingRefRow}>
              {item.listingPhoto ? (
                <Image source={{ uri: item.listingPhoto }} style={styles.listingThumb} />
              ) : null}
              <Text style={styles.listingTitle} numberOfLines={1}>{item.listingTitle}</Text>
            </View>
            <Text style={[styles.lastMessage, unread > 0 && styles.unreadText]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
        </View>
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Poruke</Text>
      </View>
      {conversations.length === 0 && !loading ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="Nemate poruka"
          subtitle="Kada pošaljete ili primite poruku, pojavit će se ovdje"
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  headerTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  listContent: { paddingBottom: spacing.xxxl },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  convContent: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  convName: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.text, flex: 1 },
  convTime: { fontSize: fontSize.xs, color: colors.textMuted, marginLeft: spacing.sm },
  convBottom: { gap: 2 },
  listingRefRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  listingThumb: { width: 20, height: 20, borderRadius: 4 },
  listingTitle: { fontSize: fontSize.xs, color: colors.textMuted, flex: 1 },
  lastMessage: { fontSize: fontSize.sm, color: colors.textSecondary },
  unreadText: { fontWeight: fontWeight.bold, color: colors.text },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  badgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.md },
  authTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  authSubtitle: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center' },
  loginButton: { backgroundColor: colors.accent, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xxxl, paddingVertical: spacing.md, marginTop: spacing.md },
  loginButtonText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
