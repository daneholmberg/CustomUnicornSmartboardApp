import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

// Standard dartboard number sequence
const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const VALID_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);

export default function SettingsScreen({ onClose }) {
  const { boardRotation, updateBoardRotation } = useSettings();
  const [inputValue, setInputValue] = useState(boardRotation?.toString() || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleNumberInput = (value) => {
    setInputValue(value);
    setError('');
    setSaved(false);
  };

  const handleSave = () => {
    const num = parseInt(inputValue, 10);
    if (!inputValue) {
      setError('Please enter a number');
      return;
    }
    if (isNaN(num) || !VALID_NUMBERS.includes(num)) {
      setError('Please enter a valid number (1-20)');
      return;
    }

    // Find the index of the input number in the standard sequence
    const inputIndex = NUMBERS.indexOf(num);
    if (inputIndex === -1) {
      setError('Invalid number');
      return;
    }

    console.log('Settings - Input number:', num);
    console.log('Settings - Input index in sequence:', inputIndex);

    // Calculate how many positions we need to rotate
    // We want the input number to be at index 4 (where 13 is in standard position)
    const standardIndex = 0; // Index where 13 appears in standard position
    let rotationToSave = inputIndex - standardIndex;
    
    console.log('Settings - Positions to rotate:', rotationToSave);

    
    // Save the rotation - ensure it's a proper number
    // const rotationToSave = rotationDegrees === 0 ? 0 : rotationDegrees; // Convert -0 to 0
    console.log('Settings - Saving rotation value:', rotationToSave);
    updateBoardRotation(inputValue);
    setSaved(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Board Number Position</Text>
            <Text style={styles.description}>
              Enter the number that appears to the left of the blue button on your dartboard
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={handleNumberInput}
                keyboardType="number-pad"
                placeholder="Enter number (1-20)"
                placeholderTextColor={theme.colors.text.secondary}
                maxLength={2}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.saveButton,
                saved && styles.savedButton
              ]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {saved ? 'Saved!' : 'Save Position'}
              </Text>
            </TouchableOpacity>
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.helperText}>
                This helps us match your dartboard's physical orientation
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    height: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  backText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: theme.spacing.lg,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 18,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  savedButton: {
    backgroundColor: theme.colors.success,
  },
  saveButtonText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.accent,
    fontSize: 14,
    marginTop: theme.spacing.sm,
  },
  helperText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
}); 