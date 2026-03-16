import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../lib/theme';
import { useAuth } from '../../lib/auth-context';
import { getUnreadCount } from '../../lib/firestore';

export default function TabLayout() {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadMessages(0);
      return;
    }
    const checkUnread = async () => {
      const count = await getUnreadCount(user.uid);
      setUnreadMessages(count);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Početna',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Pretraga',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: 'Objavi',
          tabBarIcon: ({ focused }) => (
            <View style={styles.postButton}>
              <Ionicons name="add" size={28} color={colors.white} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Poruke',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="chatbubble-outline" size={size} color={color} />
              {unreadMessages > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  postButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
});
