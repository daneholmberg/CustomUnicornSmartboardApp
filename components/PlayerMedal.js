import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

const MEDALS = {
  1: { emoji: '🥇', text: 'Winner!', color: '#FFD700' },
  2: { emoji: '🥈', text: 'Second Place', color: '#C0C0C0' },
  3: { emoji: '🥉', text: 'Third Place', color: '#CD7F32' },
  4: { text: 'Fourth Place', color: theme.colors.text.secondary },
};

export const PlayerMedal = ({ place }) => {
  const medal = MEDALS[place];
  if (!medal) return null;

  return (
    <View style={[styles.container, { backgroundColor: medal.color + '20' }]}>
      {medal.emoji && <Text style={styles.emoji}>{medal.emoji}</Text>}
      <Text style={[styles.text, { color: medal.color }]}>{medal.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  emoji: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 