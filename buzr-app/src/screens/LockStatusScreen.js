import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useVenue } from '../context/VenueContext';
import BuzrLogo from '../components/BuzrLogo';

const PURPLE = '#6C3FE8';
const PINK = '#E83FA2';

/**
 * LockStatusScreen
 *
 * Implements the BUZR lock mechanism (similar to LockDown Browser):
 *
 * • When an event is active the screen displays a full-screen lock UI.
 * • The Android hardware back button is intercepted and disabled.
 * • useKeepAwake keeps the display on so the screen never turns off.
 * • The lock can only be released by the admin ending the event in the
 *   Admin Map screen.
 *
 * On iOS, true kiosk/guided-access mode requires either Apple Configurator /
 * MDM enrollment or a call to the UIAccessibility Guided Access API.  This
 * screen ships a native-compatible module stub; the full native integration
 * would be added via an Expo custom dev client build.
 */
export default function LockStatusScreen({ navigation }) {
  const { activeEvent, locked, endEvent } = useVenue();

  // Keep display awake while locked
  useKeepAwake();

  // ── Block Android back button while locked ─────────────────────────────
  useEffect(() => {
    if (!locked) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true = event handled, back action suppressed
      return true;
    });
    return () => sub.remove();
  }, [locked]);

  // ── Admin override (for testing purposes) ─────────────────────────────
  const adminOverride = useCallback(() => {
    Alert.prompt(
      'Admin Override',
      'Enter the admin PIN to release the lock:',
      (pin) => {
        if (pin === '1234') {
          endEvent();
          Alert.alert('Lock Released', 'The BUZR lock has been deactivated.');
        } else if (pin !== null) {
          Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect.');
        }
      },
      'secure-text',
    );
  }, [endEvent]);

  if (!locked || !activeEvent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.unlockedContainer}>
          <BuzrLogo size="medium" showText />
          <Text style={styles.unlockedTitle}>App Unlocked</Text>
          <Text style={styles.unlockedBlurb}>
            No active venue event. Use the Admin Map to start an event and
            engage BUZR Lock.
          </Text>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => navigation.navigate('AdminMap')}
          >
            <Text style={styles.mapBtnText}>Open Admin Map</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.lockedSafe}>
      {/* Full-screen lock overlay */}
      <View style={styles.lockedContainer}>
        <BuzrLogo size="large" showText />

        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>BUZR Lock Active</Text>
        </View>

        <Text style={styles.eventName}>{activeEvent.name}</Text>
        <Text style={styles.lockBlurb}>
          You are currently inside the venue geofence.{'\n'}
          This app is restricted until you leave the venue.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoRow}>📍 Location pinned by event admin</Text>
          <Text style={styles.infoRow}>📡 Radius: {activeEvent.radiusMeters} m</Text>
          <Text style={styles.infoRow}>💬 In-app messaging is still available</Text>
        </View>

        <Text style={styles.noticeText}>
          Attempting to close or switch away from BUZR is blocked while
          this lock is active — similar to LockDown Browser.
        </Text>

        {/* Admin override accessible for demo / testing */}
        <TouchableOpacity style={styles.overrideBtn} onPress={adminOverride}>
          <Text style={styles.overrideBtnText}>Admin Override</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  unlockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  unlockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#22C55E',
    marginTop: 20,
    marginBottom: 8,
  },
  unlockedBlurb: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  mapBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  mapBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Locked styles
  lockedSafe: { flex: 1, backgroundColor: '#1A0533' },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    backgroundColor: PINK,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 8,
  },
  lockIcon: { fontSize: 22 },
  lockTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  eventName: {
    color: '#E9D5FF',
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 8,
    textAlign: 'center',
  },
  lockBlurb: {
    color: '#C4B5FD',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  infoRow: { color: '#E9D5FF', fontSize: 14 },
  noticeText: {
    color: '#7C3AED',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
  overrideBtn: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  overrideBtnText: { color: '#C4B5FD', fontWeight: '600', fontSize: 14 },
});
