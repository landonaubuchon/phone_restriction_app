/**
 * FocusLockMonitor
 *
 * Listens for AppState changes while BUZR Focus Mode is active.
 * When the user leaves the app (background/inactive) and returns, a full-screen
 * modal overlay appears reminding them to stay in BUZR and showing how long
 * they were away.  The user can dismiss it (stay in Focus Mode) or explicitly
 * exit Focus Mode.
 *
 * This component renders at the root of the app (inside AppProvider, outside
 * NavigationContainer) so the Modal always appears on top of all navigation.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { F } from '../theme/fonts';

export default function FocusLockMonitor() {
  const { focusLockActive, disableFocusLock } = useAppContext();

  const appStateRef = useRef(AppState.currentState);
  const backgroundTimeRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [secondsAway, setSecondsAway] = useState(0);

  // Pulsing animation for the warning icon
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!showModal) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showModal, pulseAnim]);

  useEffect(() => {
    // If Focus Mode is off, hide any open modal and bail out
    if (!focusLockActive) {
      setShowModal(false);
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      // App moving to background / incoming call overlay
      if (
        appStateRef.current === 'active' &&
        (nextState === 'inactive' || nextState === 'background')
      ) {
        backgroundTimeRef.current = Date.now();
      }

      // App returning to foreground
      if (
        (appStateRef.current === 'inactive' || appStateRef.current === 'background') &&
        nextState === 'active'
      ) {
        const away = backgroundTimeRef.current
          ? Math.round((Date.now() - backgroundTimeRef.current) / 1000)
          : 0;
        backgroundTimeRef.current = null;

        // Only show the modal if the user was away for more than 3 seconds
        // (shorter gaps are usually system-level transitions, not intentional exits)
        if (away > 3) {
          setSecondsAway(away);
          setShowModal(true);
        }
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [focusLockActive]);

  if (!showModal) return null;

  // Human-readable "away for X" label
  const awayLabel =
    secondsAway < 60
      ? `${secondsAway} second${secondsAway !== 1 ? 's' : ''}`
      : `${Math.round(secondsAway / 60)} minute${Math.round(secondsAway / 60) !== 1 ? 's' : ''}`;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Pulsing warning icon */}
          <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="warning" size={40} color="#EF4444" />
          </Animated.View>

          <Text style={[styles.title, { fontFamily: F.black }]}>YOU LEFT BUZR</Text>

          <View style={styles.awayChip}>
            <Ionicons name="time-outline" size={14} color="#F59E0B" />
            <Text style={[styles.awayText, { fontFamily: F.semiBold }]}>
              Away for {awayLabel}
            </Text>
          </View>

          <Text style={[styles.note, { fontFamily: F.regular }]}>
            Focus Mode keeps you present at the event and earns you rewards.
            Time outside the app does not count toward your initiatives progress.
          </Text>

          {/* Primary action — stay in Focus Mode */}
          <TouchableOpacity
            style={styles.returnBtn}
            activeOpacity={0.85}
            onPress={() => setShowModal(false)}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={[styles.returnText, { fontFamily: F.black }]}>RETURN TO EVENT</Text>
          </TouchableOpacity>

          {/* Secondary action — exit Focus Mode entirely */}
          <TouchableOpacity
            style={styles.exitBtn}
            activeOpacity={0.7}
            onPress={() => {
              setShowModal(false);
              disableFocusLock();
            }}
          >
            <Text style={[styles.exitText, { fontFamily: F.regular }]}>Exit Focus Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#0F0F1A',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF444433',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A0808',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#EF444455',
  },
  title: {
    fontSize: 28,
    color: '#EF4444',
    letterSpacing: 3,
    marginBottom: 12,
    textAlign: 'center',
  },
  awayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A1000',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F59E0B44',
  },
  awayText: {
    fontSize: 13,
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  note: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  returnText: {
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  exitBtn: {
    paddingVertical: 10,
  },
  exitText: {
    fontSize: 13,
    color: '#475569',
    textDecorationLine: 'underline',
  },
});
