import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

export const X01Stats = ({ stats }) => (
  <View style={styles.container}>
    <Text style={styles.label}>AVG/ROUND</Text>
    <Text style={styles.value}>{stats?.averagePerRound || 0}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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