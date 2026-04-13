import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { secondsUntilEnd, formatCountdown } from '../utils/restrictionUtils';

const ALLOWED_APP_DETAILS = {
  Phone: { icon: '📞', description: 'Make and receive phone calls', color: '#22C55E' },
  Messages: { icon: '💬', description: 'Send and receive text messages', color: '#3B82F6' },
  Camera: { icon: '📷', description: 'Capture photos (2 min limit)', color: '#F59E0B' },
  'Glucose Monitor': { icon: '🩸', description: 'Monitor blood glucose levels', color: '#EF4444' },
  Insulin: { icon: '💉', description: 'Insulin dosage tracker', color: '#EF4444' },
  'Heart Monitor': { icon: '❤️‍🩹', description: 'Cardiac monitoring app', color: '#EF4444' },
  Maps: { icon: '🗺️', description: 'Navigation & venue maps', color: '#8B5CF6' },
  Wallet: { icon: '💳', description: 'Mobile ticketing & payments', color: '#06B6D4' },
};

export default function RestrictionScreen({ navigation }) {
  const { activeEvent, allowedApps, restrictionActive, consentGiven } = useAppContext();
  const [countdown, setCountdown] = useState(0);
  const [pulse] = useState(new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (!activeEvent) return;
    const interval = setInterval(() => {
      setCountdown(secondsUntilEnd(activeEvent));
    }, 1000);
    setCountdown(secondsUntilEnd(activeEvent));
    return () => clearInterval(interval);
  }, [activeEvent]);

  if (!consentGiven) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMessage}>
          <Text style={styles.centeredIcon}>⚠️</Text>
          <Text style={styles.centeredTitle}>Consent Required</Text>
          <Text style={styles.centeredBody}>
            You haven't given consent for BUZR to manage your phone restrictions.
            Please enable BUZR in your Profile settings.
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.actionButtonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!restrictionActive || !activeEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMessage}>
          <Text style={styles.centeredIcon}>🔓</Text>
          <Text style={styles.centeredTitle}>No Active Restrictions</Text>
          <Text style={styles.centeredBody}>
            Restrictions activate automatically when you arrive at a registered event venue.
            Register for events on the Home screen.
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.actionButtonText}>Browse Events</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Lock Icon + Status */}
        <View style={styles.lockSection}>
          <Animated.Text style={[styles.lockIcon, { transform: [{ scale: pulse }] }]}>
            🔒
          </Animated.Text>
          <Text style={styles.lockTitle}>Restrictions Active</Text>
          <Text style={styles.eventName}>{activeEvent.name}</Text>
          <Text style={styles.eventVenue}>📍 {activeEvent.venue}</Text>
        </View>

        {/* Countdown */}
        <View style={styles.countdownSection}>
          <Text style={styles.countdownLabel}>Restrictions lift in</Text>
          <Text style={styles.countdown}>{formatCountdown(countdown)}</Text>
          <Text style={styles.countdownNote}>Includes 30-minute post-event buffer</Text>
        </View>

        {/* Allowed Apps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Available Apps</Text>
          <Text style={styles.sectionSubtitle}>
            Only the following apps are accessible on your device:
          </Text>
          {allowedApps.map((app, i) => {
            const details = ALLOWED_APP_DETAILS[app] || {
              icon: '📱',
              description: 'Custom emergency app',
              color: '#EF4444',
            };
            const isEmergency = !activeEvent.allowedApps.includes(app);
            return (
              <View key={i} style={styles.appCard}>
                <View style={[styles.appIconContainer, { backgroundColor: details.color + '22' }]}>
                  <Text style={styles.appIconText}>{details.icon}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app}</Text>
                  <Text style={styles.appDescription}>{details.description}</Text>
                </View>
                {isEmergency && (
                  <View style={styles.emergencyTag}>
                    <Text style={styles.emergencyTagText}>Emergency</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Restricted Notice */}
        <View style={[styles.section, styles.restrictedSection]}>
          <Text style={styles.restrictedTitle}>🚫 All Other Apps Restricted</Text>
          <Text style={styles.restrictedBody}>
            Social media, streaming, browsers, and all other non-essential apps are restricted
            for the duration of the event. Thank you for helping create a better experience for
            everyone!
          </Text>
        </View>

        {/* Emergency Settings Link */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => navigation.navigate('EmergencyApps')}
        >
          <Text style={styles.emergencyButtonIcon}>🏥</Text>
          <Text style={styles.emergencyButtonText}>Need emergency app access?</Text>
          <Text style={styles.emergencyButtonArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { paddingBottom: 48 },
  lockSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  lockIcon: { fontSize: 64, marginBottom: 12 },
  lockTitle: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 6 },
  eventName: { fontSize: 16, color: '#C4B5FD', fontWeight: '600', textAlign: 'center' },
  eventVenue: { fontSize: 13, color: '#64748B', marginTop: 4 },
  countdownSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  countdownLabel: { fontSize: 13, color: '#94A3B8', marginBottom: 4 },
  countdown: {
    fontSize: 52,
    fontWeight: '800',
    color: '#A78BFA',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  countdownNote: { fontSize: 12, color: '#475569', marginTop: 4, fontStyle: 'italic' },
  section: {
    backgroundColor: '#1E293B',
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#F1F5F9', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 19 },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
    gap: 12,
  },
  appIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: { fontSize: 22 },
  appInfo: { flex: 1 },
  appName: { fontSize: 15, fontWeight: '600', color: '#F1F5F9' },
  appDescription: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  emergencyTag: {
    backgroundColor: '#450A0A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emergencyTagText: { fontSize: 11, color: '#FCA5A5', fontWeight: '600' },
  restrictedSection: { backgroundColor: '#1C0D2E' },
  restrictedTitle: { fontSize: 15, fontWeight: '700', color: '#F87171', marginBottom: 8 },
  restrictedBody: { fontSize: 13, color: '#94A3B8', lineHeight: 20 },
  emergencyButton: {
    margin: 16,
    marginTop: 16,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emergencyButtonIcon: { fontSize: 22 },
  emergencyButtonText: { flex: 1, fontSize: 14, color: '#CBD5E1', fontWeight: '500' },
  emergencyButtonArrow: { color: '#64748B', fontSize: 22 },
  centeredMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  centeredIcon: { fontSize: 64, marginBottom: 16 },
  centeredTitle: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 12, textAlign: 'center' },
  centeredBody: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  actionButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
