import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DIAL_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

const KEY_SUB = {
  '1': '',
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
  '0': '+',
  '*': '',
  '#': '',
};

export default function PhoneScreen() {
  const [dialValue, setDialValue] = useState('');

  const handleKey = (key) => {
    if (dialValue.length >= 15) return;
    setDialValue((prev) => prev + key);
  };

  const handleBackspace = () => {
    setDialValue((prev) => prev.slice(0, -1));
  };

  const handleCall = async () => {
    const number = dialValue.replace(/[^0-9+*#]/g, '');
    if (!number) {
      Alert.alert('No Number', 'Please dial a phone number first.');
      return;
    }
    const url = `tel:${number}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Unable to Call', 'Your device does not support phone calls from this app.');
    }
  };

  const formatDisplay = (raw) => {
    // Simple US-style formatting as user types
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+${digits.slice(0, digits.length - 10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header icon */}
      <View style={styles.header}>
        <Ionicons name="call-outline" size={32} color="#22C55E" />
        <Text style={styles.headerTitle}>Phone</Text>
      </View>

      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {dialValue ? formatDisplay(dialValue) : 'Enter a number'}
        </Text>
        {dialValue.length > 0 && (
          <TouchableOpacity
            style={styles.backspaceButton}
            onPress={handleBackspace}
            onLongPress={() => setDialValue('')}
            accessibilityLabel="Delete last digit"
          >
            <Ionicons name="backspace-outline" size={24} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Dial Pad */}
      <View style={styles.dialPad}>
        {DIAL_KEYS.map((row, ri) => (
          <View key={ri} style={styles.dialRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.dialKey}
                onPress={() => handleKey(key)}
                activeOpacity={0.7}
                accessibilityLabel={`Dial ${key}`}
              >
                <Text style={styles.dialKeyMain}>{key}</Text>
                {KEY_SUB[key] ? (
                  <Text style={styles.dialKeySub}>{KEY_SUB[key]}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Call button */}
      <View style={styles.callRow}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCall}
          activeOpacity={0.85}
          accessibilityLabel="Call"
          accessibilityRole="button"
        >
          <Ionicons name="call" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.accessNote}>
        Always available — even during event restrictions.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  display: {
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
  },
  displayText: {
    flex: 1,
    fontSize: 32,
    fontWeight: '300',
    color: '#F1F5F9',
    textAlign: 'center',
    letterSpacing: 1,
  },
  backspaceButton: {
    padding: 8,
  },
  dialPad: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 4,
  },
  dialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  dialKey: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F0F1A',
    borderWidth: 1,
    borderColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialKeyMain: {
    fontSize: 28,
    fontWeight: '300',
    color: '#F1F5F9',
    lineHeight: 32,
  },
  dialKeySub: {
    fontSize: 10,
    color: '#3F3F5A',
    letterSpacing: 1.5,
    fontWeight: '500',
  },
  callRow: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  callButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessNote: {
    fontSize: 11,
    color: '#3F3F5A',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
