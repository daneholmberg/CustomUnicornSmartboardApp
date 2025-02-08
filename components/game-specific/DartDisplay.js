import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../../theme';

const TRANSITION_DURATION = 10000; // 10 seconds in milliseconds

/**
 * Displays the last 3 darts thrown by the current player
 * Uses standard dart notation (T20 for triple 20, D16 for double 16)
 * Shows previous player's darts for 10 seconds when turn changes
 */
export function DartDisplay({ darts = [], lastTurnDarts = [], lastTurnTimestamp = null }) {
  const [displayDarts, setDisplayDarts] = useState(darts);
  
  useEffect(() => {
    // If we have current darts, show them
    if (darts.length > 0) {
      setDisplayDarts(darts);
      return;
    }
    
    // If we have last turn darts and they're recent, show them
    if (lastTurnDarts.length > 0 && lastTurnTimestamp) {
      const timeSinceLastTurn = Date.now() - lastTurnTimestamp;
      
      if (timeSinceLastTurn < TRANSITION_DURATION) {
        setDisplayDarts(lastTurnDarts);
        
        // Set timer to clear the display
        const timer = setTimeout(() => {
          setDisplayDarts([]);
        }, TRANSITION_DURATION - timeSinceLastTurn);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Otherwise show empty display
    setDisplayDarts([]);
  }, [darts, lastTurnDarts, lastTurnTimestamp]);

  const renderDart = (dart, index) => {
    if (!dart) {
      return (
        <View key={index} style={styles.dartPlaceholder}>
          <Text style={styles.placeholderText}>-</Text>
        </View>
      );
    }

    const displayText = dart.multiplier > 1 
      ? `${dart.multiplier === 2 ? 'D' : 'T'}${dart.score}`
      : `${dart.score}`;

    return (
      <View key={index} style={styles.dartBox}>
        <Text style={styles.dartText}>{displayText}</Text>
      </View>
    );
  };

  // Always show 3 boxes, fill empty ones with placeholders
  const dartsToShow = [...displayDarts.slice(-3)];
  while (dartsToShow.length < 3) {
    dartsToShow.push(null);
  }

  return (
    <View style={styles.container}>
      {dartsToShow.map((dart, index) => renderDart(dart, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  dartBox: {
    width: 50,
    height: 30,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.tiny,
  },
  dartPlaceholder: {
    width: 50,
    height: 30,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dartText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
}); 