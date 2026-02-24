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

// ─── Time Progress Bar ────────────────────────────────────────────────────────
// Shows how much camera time remains as a horizontal depleting bar.
function TimeProgressBar({ secondsRemaining, totalSeconds }) {
  const pct = Math.max(0, Math.min(1, secondsRemaining / totalSeconds));
  const isLow = pct < 0.2;
  const isCritical = pct < 0.1;
  const barColor = isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#22C55E';

  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.trackRow}>
        <Ionicons name="time-outline" size={12} color="#64748B" />
        <View style={progressStyles.track}>
          <View
            style={[progressStyles.fill, { width: `${pct * 100}%`, backgroundColor: barColor }]}
          />
        </View>
        <Text style={[progressStyles.label, { color: barColor }]}>
          {formatMinSec(Math.max(0, secondsRemaining))}
        </Text>
      </View>
      <Text style={progressStyles.subLabel}>
        {isCritical ? 'Almost out!' : isLow ? 'Running low' : 'Camera time remaining'}
      </Text>
    </View>
  );
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

  // Reset session counter when the active event changes (e.g. user switches events)
  useEffect(() => {
    sessionRef.current = 0;
    setSessionSeconds(0);
  }, [eventId]);

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
        'Please enable camera access in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!permission) return <SafeAreaView style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMessage}>
          <Ionicons name="camera-outline" size={64} color="#3F3F5A" />
          <Text style={styles.centeredTitle}>Camera Access Needed</Text>
          <Text style={styles.centeredBody}>Enable camera access to use this feature.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleRequestPermission}>
            <Text style={styles.actionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (cameraLocked) {
    const minutes = Math.floor(CAMERA_LIMIT_SECONDS / 60);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMessage}>
          <View style={styles.lockedIconRing}>
            <Ionicons name="camera-off-outline" size={40} color="#EF4444" />
          </View>
          <Text style={styles.lockedTitle}>Camera Restricted</Text>
          <Text style={styles.lockedBody}>
            Your {minutes}-min allowance for this event has been used.
          </Text>
          {/* Show depleted bar */}
          <View style={styles.lockedBarWrapper}>
            <TimeProgressBar secondsRemaining={0} totalSeconds={CAMERA_LIMIT_SECONDS} />
          </View>
          <View style={styles.lockedEventInfo}>
            <Text style={styles.lockedEventName}>{activeEvent?.name}</Text>
            <Text style={styles.lockedEventNote}>Restores when the event ends</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} facing={facing}>
        {/* ── Top overlay: warning badge if < 2 min ── */}
        <SafeAreaView style={styles.overlayTop}>
          {eventId && secondsRemaining <= 120 && secondsRemaining > 0 && (
            <View style={styles.warningBadge}>
              <Ionicons name="warning" size={14} color="#FDE68A" />
              <Text style={styles.warningText}>Under 2 minutes left!</Text>
            </View>
          )}
        </SafeAreaView>

        {/* ── Bottom overlay: progress bar + flip ── */}
        <View style={styles.overlayBottom}>
          <SafeAreaView>
            {eventId && (
              <View style={styles.progressWrapper}>
                <TimeProgressBar
                  secondsRemaining={Math.max(0, secondsRemaining)}
                  totalSeconds={CAMERA_LIMIT_SECONDS}
                />
              </View>
            )}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={handleFlip}
                accessibilityLabel="Flip camera"
              >
                <Ionicons name="camera-reverse-outline" size={28} color="#F1F5F9" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </CameraView>
    </View>
  );
}

// ─── Progress bar styles ──────────────────────────────────────────────────────
const progressStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    minWidth: 40,
    textAlign: 'right',
  },
  subLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginLeft: 18,
    fontWeight: '500',
  },
});

// ─── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(120,53,15,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  warningText: { color: '#FDE68A', fontSize: 13, fontWeight: '700' },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  progressWrapper: {
    marginBottom: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  lockedIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1A0808',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EF444433',
    marginBottom: 20,
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
    backgroundColor: '#EF4444',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  actionButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedBody: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  lockedBarWrapper: {
    width: '100%',
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  lockedEventInfo: {
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  lockedEventName: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginBottom: 4 },
  lockedEventNote: { fontSize: 12, color: '#3F3F5A' },
});

