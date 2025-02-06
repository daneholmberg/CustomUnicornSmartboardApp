import { StyleSheet, Platform } from 'react-native';
import { theme } from '../theme';

export const gameStyles = StyleSheet.create({
  playerInfoContainer: {
    gap: theme.spacing.md,
  },
  currentTurnContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAccent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.elevation.small,
  },
  turnLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    opacity: 0.8,
  },
  currentTurnText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  scoreBoard: {
    gap: theme.spacing.sm,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    ...theme.elevation.small,
  },
  activePlayer: {
    backgroundColor: theme.colors.surface2,
    borderLeftColor: theme.colors.accent,
  },
  playerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  playerName: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  scoreText: {
    color: theme.colors.text.primary,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      web: 'monospace',
    }),
    opacity: 0.9,
  },
  activeBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    opacity: 0.9,
  },
  activeBadgeText: {
    color: theme.colors.text.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  targetText: {
    color: theme.colors.text.accent,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
}); 