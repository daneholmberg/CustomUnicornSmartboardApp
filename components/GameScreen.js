import React from 'react';
import { StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import Dartboard from './Dartboard';
import { theme } from '../theme';
import { useOrientation } from '../hooks/useOrientation';

export default function GameScreen({ 
  title,
  gameState,
  renderPlayerInfo,
  connected,
  error,
  handleThrow,
  onUndo,
}) {
  const orientation = useOrientation();
  const { throwsThisTurn, lastHit, targetNumbers } = gameState;
  // Get gameMessage but provide default if none exists
  const gameMessage = gameState.gameMessage || "Game in progress";
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.scrollContainer,
        orientation === 'landscape' && styles.landscapeContainer
      ]}>
        <View style={[styles.header, theme.elevation.small]}>
          <Text style={styles.headerTitle}>{title}</Text>
          
          <View style={styles.messageContainer}>
            <Text style={styles.gameMessage}>{gameMessage}</Text>
            <View style={styles.throwInfo}>
              <TouchableOpacity 
                style={[
                  styles.undoButton,
                  !gameState.hasHistory && styles.undoButtonDisabled
                ]}
                onPress={onUndo}
                disabled={!gameState.hasHistory}
              >
                <Text style={styles.undoButtonText}>↩ Undo</Text>
              </TouchableOpacity>
              <Text style={styles.throwCount}>
                Throws: {throwsThisTurn}<Text style={styles.throwTotal}>/3</Text>
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[
          styles.contentContainer,
          orientation === 'landscape' && styles.landscapeContent
        ]}>
          <View style={[styles.gameInfo, theme.elevation.small]}>
            {renderPlayerInfo()}
          </View>

          {error && (
            <View style={[styles.errorContainer, theme.elevation.small]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <View style={[styles.dartboardContainer, theme.elevation.medium]}>
            <Dartboard 
              onThrow={handleThrow} 
              lastHit={lastHit} 
              targetNumbers={targetNumbers}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  landscapeContainer: {
    flexDirection: 'column',
    padding: theme.spacing.md,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xs,
    minHeight: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  messageContainer: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    position: 'relative',
  },
  gameMessage: {
    fontSize: 14,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  throwCount: {
    color: theme.colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  throwTotal: {
    opacity: 0.6,
  },
  contentContainer: {
    flex: 1,
    minHeight: 0,
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    paddingLeft: theme.spacing.md,
  },
  landscapeContent: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    flex: 1,
    minHeight: 0,
  },
  gameInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    width: '45%',
    minWidth: 280,
    maxHeight: '100%',
    overflow: 'hidden',
  },
  errorContainer: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  dartboardContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    aspectRatio: 1,
    alignSelf: 'center',
    maxHeight: '100%',
    maxWidth: '55%',
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  throwInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    position: 'absolute',
    right: theme.spacing.sm,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  undoButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    height: 24,
    ...theme.elevation.tiny,
  },
  undoButtonDisabled: {
    opacity: 0.5,
  },
  undoButtonText: {
    color: theme.colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});