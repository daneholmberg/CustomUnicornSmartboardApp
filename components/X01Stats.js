import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

export const X01Stats = ({ stats, textSize = 10 }) => (
  <View style={styles.container}>
    <Text style={[styles.label, { fontSize: textSize }]}>AVG/ROUND:</Text>
    <Text style={[styles.value, { fontSize: textSize }]}>
      {stats?.averagePerRound || 0}
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
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  value: {
    color: theme.colors.text.highlight,
    fontWeight: '700',
  },
}); 