import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../lib/theme';

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  time: string;
  read?: boolean;
}

export default function MessageBubble({ text, isMine, time, read }: MessageBubbleProps) {
  return (
    <View style={[styles.row, isMine && styles.rowMine]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.text, isMine && styles.textMine]}>{text}</Text>
        <View style={styles.meta}>
          <Text style={[styles.time, isMine && styles.timeMine]}>{time}</Text>
          {isMine && (
            <Ionicons
              name={read ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={read ? '#34D399' : 'rgba(255,255,255,0.5)'}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  bubbleMine: {
    backgroundColor: colors.messageSent,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.messageReceived,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 20,
  },
  textMine: {
    color: colors.white,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  timeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
});
