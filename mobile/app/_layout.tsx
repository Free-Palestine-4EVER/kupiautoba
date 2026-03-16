import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../lib/auth-context';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.white },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="dealer/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="register" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
