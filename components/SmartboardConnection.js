import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSmartboardContext } from '../context/SmartboardContext';
import { CONNECTION_STATE } from '../useSmartboard';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function SmartboardConnection() {
  const {
    connectionState,
    connecting,
    error,
    connect,
    disconnect,
    useMock,
  } = useSmartboardContext();

  const getStatusColor = () => {
    switch (connectionState) {
      case CONNECTION_STATE.CONNECTED:
        return theme.colors.success;
      case CONNECTION_STATE.CONNECTING:
        return theme.colors.warning;
      case CONNECTION_STATE.DISCONNECTED:
      default:
        return theme.colors.error;
    }
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    switch (connectionState) {
      case CONNECTION_STATE.CONNECTED:
        return useMock ? 'Mock Smartboard Connected' : 'Real Smartboard Connected';
      case CONNECTION_STATE.CONNECTING:
        return 'Connecting...';
      case CONNECTION_STATE.DISCONNECTED:
      default:
        return 'Disconnected';
    }
  };

  const renderConnectionButton = () => {
    if (connectionState === CONNECTION_STATE.CONNECTED) {
      return (
        <TouchableOpacity
          style={[styles.button, styles.disconnectButton]}
          onPress={disconnect}
        >
          <Ionicons name="power" size={16} color={theme.colors.text.primary} />
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      );
    }

    if (connecting) {
      return (
        <View style={[styles.button, styles.connectingButton]}>
          <ActivityIndicator color={theme.colors.text.primary} size="small" />
          <Text style={styles.buttonText}>Connecting...</Text>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.connectButton]}
          onPress={() => connect(false)}
        >
          <Ionicons name="game-controller" size={16} color={theme.colors.text.primary} />
          <Text style={styles.buttonText}>Use Mock Board</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.connectButton]}
          onPress={() => connect(true)}
        >
          <Ionicons name="bluetooth" size={16} color={theme.colors.text.primary} />
          <Text style={styles.buttonText}>Connect Real Board</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.statusContainer,
        { marginBottom: error ? theme.spacing.sm : theme.spacing.md }
      ]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {renderConnectionButton()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
    flex: 1,
  },
  connectButton: {
    backgroundColor: theme.colors.primary,
  },
  connectingButton: {
    backgroundColor: theme.colors.warning,
  },
  disconnectButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
}); 