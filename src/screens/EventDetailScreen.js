import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import {
  isEventActive,
  isEventUpcoming,
  formatTime,
  formatDate,
  secondsUntilStart,
  secondsUntilEnd,
  formatCountdown,
  getAllowedApps,
} from '../utils/restrictionUtils';
import { EVENT_TYPE_ICONS, EVENT_TYPE_COLORS } from '../data/sampleEvents';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { events, registeredEvents, registerForEvent, unregisterFromEvent, emergencyApps, consentGiven } = useAppContext();
  const event = events.find((e) => e.id === eventId);

  const [countdown, setCountdown] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!event) return;
    if (isEventActive(event)) {
      setCountdown(secondsUntilEnd(event));
    } else {
      setCountdown(secondsUntilStart(event));
    }
  }, [event, tick]);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const isRegistered = registeredEvents.includes(event.id);
  const active = isEventActive(event);
  const upcoming = isEventUpcoming(event);
  const typeColor = EVENT_TYPE_COLORS[event.type] || '#6D28D9';
  const typeIcon = EVENT_TYPE_ICONS[event.type] || '📅';
  const allowed = getAllowedApps(event, emergencyApps);

  const handleRegister = () => {
    if (!consentGiven) {
      Alert.alert(
        'Consent Required',
        'Please give BUZR consent first to enable phone restrictions at this event.',
        [{ text: 'OK' }]
      );
      return;
    }
    registerForEvent(event.id);
    Alert.alert('Registered!', `You are now registered for ${event.name}. Restrictions will activate automatically.`);
  };

  const handleUnregister = () => {
    Alert.alert(
      'Remove Registration',
      `Remove ${event.name} from your events? Restrictions will no longer apply.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => unregisterFromEvent(event.id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={[styles.heroHeader, { backgroundColor: typeColor + '22' }]}>
          <Text style={styles.heroIcon}>{typeIcon}</Text>
          <Text style={styles.heroTitle}>{event.name}</Text>
          <Text style={styles.heroVenue}>📍 {event.venue}</Text>
          <Text style={styles.heroAddress}>{event.address}</Text>
        </View>

        {/* Status + Countdown */}
        <View style={styles.section}>
          <View style={styles.statusRow}>
            {active && (
              <View style={[styles.badge, { backgroundColor: '#450A0A' }]}>
                <Text style={styles.badgeText}>🔴 EVENT LIVE</Text>
              </View>
            )}
            {upcoming && !active && (
              <View style={[styles.badge, { backgroundColor: '#1C1917' }]}>
                <Text style={styles.badgeText}>⏳ STARTING SOON</Text>
              </View>
            )}
            {!active && !upcoming && (
              <View style={[styles.badge, { backgroundColor: '#1E293B' }]}>
                <Text style={styles.badgeText}>📅 UPCOMING</Text>
              </View>
            )}
          </View>

          <Text style={styles.countdownLabel}>
            {active ? 'Restrictions end in' : 'Restrictions activate in'}
          </Text>
          <Text style={[styles.countdown, { color: typeColor }]}>
            {formatCountdown(countdown)}
          </Text>

          <View style={styles.timeDetails}>
            <View style={styles.timeItem}>
              <Text style={styles.timeItemLabel}>Date</Text>
              <Text style={styles.timeItemValue}>{formatDate(event.startTime)}</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeItemLabel}>Start</Text>
              <Text style={styles.timeItemValue}>{formatTime(event.startTime)}</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeItemLabel}>End</Text>
              <Text style={styles.timeItemValue}>{formatTime(event.endTime)}</Text>
            </View>
          </View>
          <Text style={styles.bufferNote}>
            ⏱ 30-minute buffer added after event ends in case of overtime.
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.description}</Text>
          <Text style={styles.ticketLabel}>Ticket Code</Text>
          <View style={styles.ticketBadge}>
            <Text style={styles.ticketCode}>{event.ticketCode}</Text>
          </View>
        </View>

        {/* Restriction Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📵 Restriction Details</Text>
          <Text style={styles.sectionBody}>
            When you are within <Text style={styles.bold}>{event.proximityRadiusMeters}m</Text> of
            the venue and the event is active, the following apps will be the only ones accessible:
          </Text>
          {allowed.map((app, i) => (
            <View key={i} style={styles.appRow}>
              <Text style={styles.appIcon}>{getAppIcon(app)}</Text>
              <Text style={styles.appName}>{app}</Text>
              {event.allowedApps.includes(app) ? (
                <Text style={styles.appTagDefault}>Default</Text>
              ) : (
                <Text style={styles.appTagEmergency}>Emergency</Text>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.emergencyLink}
            onPress={() => navigation.navigate('EmergencyApps')}
          >
            <Text style={styles.emergencyLinkText}>+ Configure Emergency Apps</Text>
          </TouchableOpacity>
        </View>

        {/* Register/Unregister */}
        {isRegistered ? (
          <TouchableOpacity style={styles.unregisterButton} onPress={handleUnregister}>
            <Text style={styles.unregisterButtonText}>Remove from My Events</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: typeColor }]}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>Register for This Event</Text>
          </TouchableOpacity>
        )}

        {(active || upcoming) && isRegistered && (
          <TouchableOpacity
            style={styles.restrictionViewButton}
            onPress={() => navigation.navigate('Restriction')}
          >
            <Text style={styles.restrictionViewButtonText}>View Restriction Screen →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getAppIcon(app) {
  const icons = {
    Phone: '📞',
    Messages: '💬',
    Camera: '📷',
    'Glucose Monitor': '🩸',
    Insulin: '💉',
    'Heart Monitor': '❤️‍🩹',
    Maps: '🗺️',
    Wallet: '💳',
  };
  return icons[app] || '📱';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { paddingBottom: 48 },
  heroHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  heroIcon: { fontSize: 52, marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', textAlign: 'center', marginBottom: 6 },
  heroVenue: { fontSize: 15, color: '#94A3B8', marginBottom: 2 },
  heroAddress: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  section: {
    backgroundColor: '#1E293B',
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
  },
  statusRow: { flexDirection: 'row', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#F1F5F9', fontSize: 12, fontWeight: '700' },
  countdownLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 4 },
  countdown: { fontSize: 42, fontWeight: '800', fontVariant: ['tabular-nums'], marginBottom: 16 },
  timeDetails: { flexDirection: 'row', gap: 16 },
  timeItem: { flex: 1, backgroundColor: '#0F172A', borderRadius: 10, padding: 12, alignItems: 'center' },
  timeItemLabel: { fontSize: 11, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeItemValue: { fontSize: 14, fontWeight: '600', color: '#F1F5F9' },
  bufferNote: { marginTop: 12, fontSize: 12, color: '#64748B', fontStyle: 'italic' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#F1F5F9', marginBottom: 10 },
  sectionBody: { fontSize: 14, color: '#CBD5E1', lineHeight: 21, marginBottom: 12 },
  description: { fontSize: 14, color: '#CBD5E1', lineHeight: 21, marginBottom: 12 },
  ticketLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  ticketBadge: { backgroundColor: '#0F172A', borderRadius: 8, padding: 10, alignItems: 'center' },
  ticketCode: { fontFamily: 'monospace', fontSize: 15, color: '#A5B4FC', letterSpacing: 2 },
  bold: { fontWeight: '700', color: '#F1F5F9' },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  appIcon: { fontSize: 20, marginRight: 12 },
  appName: { flex: 1, fontSize: 15, color: '#F1F5F9', fontWeight: '500' },
  appTagDefault: {
    fontSize: 11, color: '#6EE7B7', backgroundColor: '#064E3B',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, fontWeight: '600',
  },
  appTagEmergency: {
    fontSize: 11, color: '#FCA5A5', backgroundColor: '#450A0A',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, fontWeight: '600',
  },
  emergencyLink: { marginTop: 12 },
  emergencyLinkText: { color: '#818CF8', fontSize: 14, fontWeight: '600' },
  registerButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  unregisterButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  unregisterButtonText: { color: '#F87171', fontSize: 15 },
  restrictionViewButton: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4C1D95',
  },
  restrictionViewButtonText: { color: '#DDD6FE', fontSize: 15, fontWeight: '600' },
  errorText: { color: '#F87171', textAlign: 'center', marginTop: 60, fontSize: 18 },
});
