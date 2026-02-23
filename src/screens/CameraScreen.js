import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const CAMERA_LIMIT_SECONDS = 15 * 60; // 15 minutes per event

function formatMinSec(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CameraScreen() {
  const { activeEvent, cameraUsage, updateCameraUsage } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionRef = useRef(0);
  const intervalRef = useRef(null);

  const eventId = activeEvent?.id ?? null;
  const previouslyUsed = eventId ? (cameraUsage?.[eventId] ?? 0) : 0;
  const secondsRemaining = CAMERA_LIMIT_SECONDS - previouslyUsed - sessionSeconds;
  const cameraLocked = eventId !== null && secondsRemaining <= 0;

  // Tick the session timer while camera is active and not locked
  useEffect(() => {
    if (!eventId || cameraLocked) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      sessionRef.current += 1;
      setSessionSeconds(sessionRef.current);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [eventId, cameraLocked]);

  // Save accumulated usage when leaving the screen
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (eventId && sessionRef.current > 0) {
        updateCameraUsage(eventId, sessionRef.current);
        sessionRef.current = 0;
      }
    };
  }, [eventId, updateCameraUsage]);

  const handleFlip = useCallback(() => {
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to use this feature.',
        [{ text: 'OK' }]
      );
    }
  };

  // ── Permission not yet determined ──
  if (!permission) {
    return <SafeAreaView style={styles.container} />;
  }

  // ── Permission denied ──
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMessage}>
          <Ionicons name="camera-outline" size={64} color="#475569" />
          <Text style={styles.centeredTitle}>Camera Access Needed</Text>
          <Text style={styles.centeredBody}>
            VenueLock needs camera access to use this feature.
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleRequestPermission}>
            <Text style={styles.actionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Camera locked (time limit reached for this event) ──
  if (cameraLocked) {
    const minutes = Math.floor(CAMERA_LIMIT_SECONDS / 60);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMessage}>
          <Ionicons name="camera-off-outline" size={64} color="#F87171" />
          <Text style={styles.lockedTitle}>Camera Restricted</Text>
          <Text style={styles.lockedBody}>
            Your {minutes}-minute camera allowance for this event has been used.
            Camera access will restore when the event ends.
          </Text>
          <View style={styles.lockedEventInfo}>
            <Text style={styles.lockedEventName}>{activeEvent?.name}</Text>
            <Text style={styles.lockedEventNote}>
              Used: {formatMinSec(CAMERA_LIMIT_SECONDS)} of {formatMinSec(CAMERA_LIMIT_SECONDS)}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Active camera view ──
  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} facing={facing}>
        {/* Timer overlay */}
        <SafeAreaView style={styles.overlayTop}>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color="#F1F5F9" />
            <Text style={styles.timerText}>
              {eventId
                ? `${formatMinSec(Math.max(0, secondsRemaining))} remaining`
                : 'No limit'}
            </Text>
          </View>

          {/* Warning when under 2 minutes */}
          {eventId && secondsRemaining <= 120 && secondsRemaining > 0 && (
            <View style={styles.warningBadge}>
              <Ionicons name="warning-outline" size={14} color="#FDE68A" />
              <Text style={styles.warningText}>Camera time almost up!</Text>
            </View>
          )}
        </SafeAreaView>

        {/* Flip button */}
        <SafeAreaView style={styles.overlayBottom}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={handleFlip}
            accessibilityLabel="Flip camera"
          >
            <Ionicons name="camera-reverse-outline" size={30} color="#F1F5F9" />
          </TouchableOpacity>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  timerText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '600',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(120,53,15,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  warningText: {
    color: '#FDE68A',
    fontSize: 13,
    fontWeight: '700',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  flipButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  centeredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F1F5F9',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  centeredBody: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  actionButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F87171',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedBody: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  lockedEventInfo: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  lockedEventName: { fontSize: 15, fontWeight: '700', color: '#F1F5F9', marginBottom: 4 },
  lockedEventNote: { fontSize: 13, color: '#64748B' },
});
