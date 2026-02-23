import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import {
  isEventActive,
  isEventUpcoming,
  secondsUntilEnd,
  secondsUntilStart,
  formatCountdown,
} from '../utils/restrictionUtils';

// ─── Shot Clock Display Component ────────────────────────────────────────────
function ShotClock({ seconds, label, eventName, venue, isActive }) {
  const timeStr = formatCountdown(seconds);

  return (
    <View style={clockStyles.wrapper}>
      {/* Status label above clock */}
      <Text style={clockStyles.statusLabel}>{label}</Text>

      {/* Rectangular shot clock panel */}
      <View style={[clockStyles.panel, isActive && clockStyles.panelActive]}>
        {/* Corner brackets — decorative elements found on real shot clocks */}
        <View style={[clockStyles.corner, clockStyles.cornerTL]} />
        <View style={[clockStyles.corner, clockStyles.cornerTR]} />
        <View style={[clockStyles.corner, clockStyles.cornerBL]} />
        <View style={[clockStyles.corner, clockStyles.cornerBR]} />

        {/* Top rule */}
        <View style={clockStyles.topRule} />

        {/* LED digit display */}
        <View style={clockStyles.digitRow}>
          {timeStr.split('').map((ch, i) => (
            <Text
              key={i}
              style={[clockStyles.digit, ch === ':' && clockStyles.colon]}
            >
              {ch}
            </Text>
          ))}
        </View>

        {/* Bottom rule */}
        <View style={clockStyles.bottomRule} />
      </View>

      {/* Mounting bracket — visual detail like real arena shot clocks */}
      <View style={clockStyles.bracketRow}>
        <View style={clockStyles.bracketLeft} />
        <View style={clockStyles.bracketRight} />
      </View>

      {/* BUZR brand */}
      <Text style={clockStyles.buzrLogo}>BUZR</Text>

      {/* Event info below brand */}
      {eventName ? (
        <View style={clockStyles.eventInfo}>
          <Text style={clockStyles.eventName} numberOfLines={1}>{eventName}</Text>
          {venue ? <Text style={clockStyles.eventVenue} numberOfLines={1}>📍 {venue}</Text> : null}
        </View>
      ) : (
        <Text style={clockStyles.noEventText}>No active event</Text>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ShotClockScreen({ navigation }) {
  const {
    events,
    registeredEvents,
    activeEvent,
    restrictionActive,
    emergencyApps,
    consentGiven,
    userLocation,
  } = useAppContext();

  const [countdown, setCountdown] = useState(0);
  const [flashlightOn, setFlashlightOn] = useState(false);

  // Find the next upcoming registered event if no restriction is active
  const nextEvent = !activeEvent
    ? registeredEvents
        .map((id) => events.find((e) => e.id === id))
        .filter(Boolean)
        .find((e) => isEventUpcoming(e) || new Date(e.startTime) > new Date())
    : null;

  const displayEvent = activeEvent || nextEvent;
  const isActive = !!activeEvent;

  useEffect(() => {
    const interval = setInterval(() => {
      if (displayEvent) {
        setCountdown(
          isActive
            ? secondsUntilEnd(displayEvent)
            : secondsUntilStart(displayEvent)
        );
      }
    }, 1000);
    if (displayEvent) {
      setCountdown(
        isActive
          ? secondsUntilEnd(displayEvent)
          : secondsUntilStart(displayEvent)
      );
    }
    return () => clearInterval(interval);
  }, [displayEvent, isActive]);

  const clockLabel = isActive
    ? 'RESTRICTIONS END IN'
    : displayEvent
    ? 'NEXT EVENT STARTS IN'
    : 'NO ACTIVE EVENT';

  const EMERGENCY_ICONS = {
    'Glucose Monitor': '🩸',
    Insulin: '💉',
    'Heart Monitor': '❤️‍🩹',
    Maps: '🗺️',
    Wallet: '💳',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('EventList')}
          accessibilityLabel="Browse events"
        >
          <Ionicons name="calendar-outline" size={22} color="#94A3B8" />
          <Text style={styles.headerBtnLabel}>Events</Text>
        </TouchableOpacity>

        <View style={styles.headerSpacer} />

        {!consentGiven && (
          <View style={styles.consentDot}>
            <Text style={styles.consentDotText}>!</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Profile"
        >
          <Ionicons name="person-outline" size={22} color="#94A3B8" />
          <Text style={styles.headerBtnLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Shot Clock ── */}
        <ShotClock
          seconds={displayEvent ? countdown : 0}
          label={clockLabel}
          eventName={displayEvent?.name}
          venue={displayEvent?.venue}
          isActive={isActive}
        />

        {/* ── Restriction status badge ── */}
        {isActive && (
          <TouchableOpacity
            style={styles.restrictionBanner}
            onPress={() => navigation.navigate('Restriction')}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed" size={16} color="#DDD6FE" />
            <Text style={styles.restrictionBannerText}>
              Restrictions Active — Tap for details
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#DDD6FE" />
          </TouchableOpacity>
        )}

        {/* ── Flashlight quick toggle ── */}
        <TouchableOpacity
          style={[styles.flashlightToggle, flashlightOn && styles.flashlightOn]}
          onPress={() => {
            setFlashlightOn((v) => !v);
            navigation.navigate('Flashlight');
          }}
          accessibilityLabel="Toggle flashlight"
        >
          <Ionicons
            name={flashlightOn ? 'flashlight' : 'flashlight-outline'}
            size={22}
            color={flashlightOn ? '#0F172A' : '#F1F5F9'}
          />
          <Text
            style={[
              styles.flashlightToggleText,
              flashlightOn && styles.flashlightOnText,
            ]}
          >
            {flashlightOn ? 'Flashlight On' : 'Flashlight Off'}
          </Text>
        </TouchableOpacity>

        {/* ── Emergency Apps ── */}
        {(emergencyApps || []).length > 0 && (
          <View style={styles.emergencySection}>
            <View style={styles.emergencySectionHeader}>
              <Ionicons name="medkit-outline" size={16} color="#FCA5A5" />
              <Text style={styles.emergencySectionTitle}>Emergency Apps</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('EmergencyApps')}
              >
                <Text style={styles.manageLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emergencyAppRow}>
              {(emergencyApps || []).map((app, i) => (
                <View key={i} style={styles.emergencyAppChip}>
                  <Text style={styles.emergencyAppIcon}>
                    {EMERGENCY_ICONS[app] || '📱'}
                  </Text>
                  <Text style={styles.emergencyAppName}>{app}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── No emergency apps — prompt to add ── */}
        {(emergencyApps || []).length === 0 && (
          <TouchableOpacity
            style={styles.addEmergencyPrompt}
            onPress={() => navigation.navigate('EmergencyApps')}
          >
            <Ionicons name="medkit-outline" size={18} color="#64748B" />
            <Text style={styles.addEmergencyText}>
              Add emergency apps for medical access
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
          </TouchableOpacity>
        )}

        {/* ── Register for events call-to-action ── */}
        {registeredEvents.length === 0 && (
          <TouchableOpacity
            style={styles.registerCTA}
            onPress={() => navigation.navigate('EventList')}
          >
            <Ionicons name="calendar" size={20} color="#A78BFA" />
            <Text style={styles.registerCTAText}>
              Register for an event to activate restrictions
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#A78BFA" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shot clock styles ────────────────────────────────────────────────────────
const clockStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  // Outer rectangular panel — resembles the Daktronics arena shot clock
  panel: {
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#475569',
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 18,
    width: 320,
    alignItems: 'center',
    // Subtle shadow
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  panelActive: {
    borderColor: '#F97316',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  // Decorative corner brackets
  corner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#F97316',
  },
  cornerTL: {
    top: 6,
    left: 6,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 6,
    right: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 6,
    left: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 6,
    right: 6,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  topRule: {
    width: '100%',
    height: 1,
    backgroundColor: '#1E293B',
    marginBottom: 12,
  },
  // LED digit row
  digitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    fontSize: 56,
    fontWeight: '900',
    color: '#F97316',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    // Simulate LED glow via text shadow (web) — platform handled gracefully
    textShadowColor: '#F97316',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  colon: {
    fontSize: 52,
    color: '#EA580C',
    marginHorizontal: 2,
    marginBottom: 4,
  },
  bottomRule: {
    width: '100%',
    height: 1,
    backgroundColor: '#1E293B',
    marginTop: 12,
  },
  // Mounting bracket — vertical stems below the clock panel
  bracketRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 0,
  },
  bracketLeft: {
    width: 3,
    height: 16,
    backgroundColor: '#475569',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  bracketRight: {
    width: 3,
    height: 16,
    backgroundColor: '#475569',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  // BUZR brand name beneath the clock
  buzrLogo: {
    fontSize: 30,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 10,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  eventInfo: { alignItems: 'center', marginTop: 4 },
  eventName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
    textAlign: 'center',
    maxWidth: 300,
  },
  eventVenue: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 280,
  },
  noEventText: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerBtnLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  headerSpacer: { flex: 1 },
  consentDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  consentDotText: { fontSize: 11, fontWeight: '900', color: '#0F172A' },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 20 },
  restrictionBanner: {
    backgroundColor: '#4C1D95',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 14,
  },
  restrictionBannerText: {
    flex: 1,
    color: '#DDD6FE',
    fontSize: 13,
    fontWeight: '600',
  },
  flashlightToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  flashlightOn: {
    backgroundColor: '#FDE68A',
    borderColor: '#F59E0B',
  },
  flashlightToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  flashlightOnText: { color: '#0F172A' },
  emergencySection: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F87171',
  },
  emergencySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  emergencySectionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FCA5A5',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  manageLink: { fontSize: 12, color: '#818CF8', fontWeight: '600' },
  emergencyAppRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emergencyAppChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  emergencyAppIcon: { fontSize: 16 },
  emergencyAppName: { fontSize: 13, color: '#CBD5E1', fontWeight: '500' },
  addEmergencyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderStyle: 'dashed',
  },
  addEmergencyText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
  registerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E1433',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  registerCTAText: {
    flex: 1,
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '500',
  },
});
