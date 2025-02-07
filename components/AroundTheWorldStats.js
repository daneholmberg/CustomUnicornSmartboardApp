import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

export const AroundTheWorldStats = ({ stats, textSize = 10 }) => (
  <View style={styles.container}>
    <Text style={[styles.label, { fontSize: textSize }]}>HIT RATE:</Text>
    <Text style={[styles.value, { fontSize: textSize }]}>
      {stats?.hitRate || 0}%
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  value: {
    color: theme.colors.text.highlight,
    fontSize: 12,
    fontWeight: '700',
  },
}); 