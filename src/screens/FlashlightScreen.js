import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function FlashlightScreen() {
  const [torchOn, setTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    // Turn torch off when leaving this screen
    return () => setTorchOn(false);
  }, []);

  const handleToggle = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'VenueLock needs camera access to use the flashlight. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setTorchOn((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden CameraView used solely to control the torch */}
      {permission?.granted && (
        <CameraView
          style={styles.hiddenCamera}
          enableTorch={torchOn}
          facing="back"
        />
      )}

      {/* Icon header */}
      <View style={styles.iconHeader}>
        <Ionicons
          name={torchOn ? 'flashlight' : 'flashlight-outline'}
          size={80}
          color={torchOn ? '#FDE68A' : '#475569'}
        />
        <Text style={styles.statusLabel}>
          {torchOn ? 'Flashlight On' : 'Flashlight Off'}
        </Text>
        <Text style={styles.description}>
          {torchOn
            ? 'Your rear flashlight is active.'
            : 'Tap the button below to turn on the flashlight.'}
        </Text>
      </View>

      {/* Big toggle button */}
      <TouchableOpacity
        style={[styles.toggleButton, torchOn && styles.toggleButtonOn]}
        onPress={handleToggle}
        activeOpacity={0.85}
        accessibilityLabel={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
        accessibilityRole="button"
      >
        <Ionicons
          name={torchOn ? 'flashlight' : 'flashlight-outline'}
          size={36}
          color={torchOn ? '#0F172A' : '#F1F5F9'}
        />
        <Text style={[styles.toggleButtonText, torchOn && styles.toggleButtonTextOn]}>
          {torchOn ? 'Turn Off' : 'Turn On'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.accessNote}>
        Always available — even during event restrictions.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  // Camera view is zero-size; it only activates the hardware torch
  hiddenCamera: {
    width: 1,
    height: 1,
    position: 'absolute',
    opacity: 0,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  statusLabel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F1F5F9',
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 24,
  },
  toggleButtonOn: {
    backgroundColor: '#FDE68A',
    borderColor: '#F59E0B',
  },
  toggleButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  toggleButtonTextOn: {
    color: '#0F172A',
  },
  accessNote: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
