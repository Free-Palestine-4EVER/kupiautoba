import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { subscribeToMessages, markAsRead, getUserProfile } from '../../lib/firestore';
import { useAuth } from '../../lib/auth-context';
import { MessageData } from '../../types';
import MessageBubble from '../../components/MessageBubble';
import { timeAgo } from '../../lib/utils';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputText, setInputText] = useState('');
  const [otherName, setOtherName] = useState('');
  const [listingTitle, setListingTitle] = useState('');
  const [listingPhoto, setListingPhoto] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    // Load conversation metadata
    (async () => {
      const convDoc = await getDoc(doc(db, 'conversations', conversationId));
      if (convDoc.exists()) {
        const data = convDoc.data();
        setListingTitle(data.listingTitle || '');
        setListingPhoto(data.listingPhoto || '');
        const otherId = data.participants?.find((p: string) => p !== user.uid);
        if (otherId) {
          const profile = await getUserProfile(otherId);
          setOtherName((profile?.displayName as string) || 'Korisnik');
        }
      }
    })();

    markAsRead(conversationId, user.uid);

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      // Mark incoming messages as read
      markAsRead(conversationId, user.uid);
      // Mark individual messages from others as read in Firestore
      msgs.forEach(msg => {
        if (msg.senderId !== user.uid && !msg.read) {
          updateDoc(doc(db, 'conversations', conversationId, 'messages', msg.id), { read: true }).catch(() => {});
        }
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => unsubscribe();
  }, [conversationId, user]);

  const sendMsg = async () => {
    if (!inputText.trim() || !user || !conversationId) return;
    const text = inputText.trim();
    setInputText('');

    // Add message directly
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
      read: false,
    });

    // Update conversation last message
    const convDoc = await getDoc(doc(db, 'conversations', conversationId));
    if (convDoc.exists()) {
      const data = convDoc.data();
      const otherId = data.participants?.find((p: string) => p !== user.uid);
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        ...(otherId ? { [`unreadCount.${otherId}`]: increment(1) } : {}),
      });
    }
  };

  const formatMessageTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{otherName}</Text>
          {listingTitle ? <Text style={styles.headerListing} numberOfLines={1}>{listingTitle}</Text> : null}
        </View>
      </View>

      {/* Listing reference */}
      {listingTitle && (
        <View style={styles.listingRef}>
          {listingPhoto ? (
            <Image source={{ uri: listingPhoto }} style={styles.listingThumb} />
          ) : null}
          <Text style={styles.listingRefText} numberOfLines={1}>{listingTitle}</Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <MessageBubble
            text={item.text}
            isMine={item.senderId === user.uid}
            time={formatMessageTime(item.createdAt)}
            read={item.read}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Napišite poruku..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMsg}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  headerListing: { fontSize: fontSize.xs, color: colors.textSecondary },
  listingRef: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  listingThumb: { width: 32, height: 32, borderRadius: 6 },
  listingRefText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  messageList: { paddingVertical: spacing.md, flexGrow: 1 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white,
  },
  textInput: {
    flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: fontSize.md, color: colors.text, maxHeight: 100,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
});
