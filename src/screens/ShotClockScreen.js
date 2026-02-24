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
  isEventUpcoming,
  secondsUntilEnd,
  secondsUntilStart,
  formatHoursMinutes,
} from '../utils/restrictionUtils';

// ─── Shot Clock ───────────────────────────────────────────────────────────────
// Modeled after NBA/CBB arena shot clocks: square panel, bright red LED digits,
// HH:MM display (no seconds), corner accent marks.
function ShotClock({ seconds, label, eventName, isActive }) {
  const timeStr = formatHoursMinutes(seconds);
  const [hh, mm] = timeStr.split(':');

  return (
    <View style={clockStyles.wrapper}>
      <Text style={clockStyles.statusLabel}>{label}</Text>

      {/* Square panel */}
      <View style={[clockStyles.panel, isActive && clockStyles.panelActive]}>
        {/* Corner accent marks — NBA Daktronics detail */}
        <View style={[clockStyles.corner, clockStyles.cTL]} />
        <View style={[clockStyles.corner, clockStyles.cTR]} />
        <View style={[clockStyles.corner, clockStyles.cBL]} />
        <View style={[clockStyles.corner, clockStyles.cBR]} />

        {/* LED digit blocks */}
        <View style={clockStyles.digitRow}>
          <View style={clockStyles.digitBlock}>
            <Text style={clockStyles.digit}>{hh}</Text>
          </View>
          <Text style={clockStyles.colon}>:</Text>
          <View style={clockStyles.digitBlock}>
            <Text style={clockStyles.digit}>{mm}</Text>
          </View>
        </View>

        {/* Unit labels */}
        <View style={clockStyles.unitRow}>
          <Text style={clockStyles.unitLabel}>HR</Text>
          <View style={clockStyles.unitSpacer} />
          <Text style={clockStyles.unitLabel}>MIN</Text>
        </View>
      </View>

      {/* Bracket stems */}
      <View style={clockStyles.bracketRow}>
        <View style={clockStyles.bracket} />
        <View style={clockStyles.bracket} />
      </View>

      {/* Brand */}
      <Text style={clockStyles.brand}>BUZR</Text>

      {eventName ? (
        <Text style={clockStyles.eventName} numberOfLines={1}>{eventName}</Text>
      ) : (
        <Text style={clockStyles.noEvent}>No active event</Text>
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
    notifications,
    clearNotification,
  } = useAppContext();

  const [countdown, setCountdown] = useState(0);

  const nextEvent = !activeEvent
    ? registeredEvents
        .map((id) => events.find((e) => e.id === id))
        .filter(Boolean)
        .find((e) => isEventUpcoming(e) || new Date(e.startTime) > new Date())
    : null;

  const displayEvent = activeEvent || nextEvent;
  const isActive = !!activeEvent;

  useEffect(() => {
    const tick = () => {
      if (displayEvent) {
        setCountdown(isActive ? secondsUntilEnd(displayEvent) : secondsUntilStart(displayEvent));
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [displayEvent, isActive]);

  const clockLabel = isActive
    ? 'RESTRICTIONS END IN'
    : displayEvent
    ? 'NEXT EVENT STARTS IN'
    : 'NO ACTIVE EVENT';

  // Emoji icons for each emergency app preset — displayed inside app chips
  const EMERGENCY_ICONS = {
    'Glucose Monitor': '🩸',
    Insulin: '💉',
    'Heart Monitor': '❤️‍🩹',
    Maps: '🗺️',
    Wallet: '💳',
  };

  // Notification items for the home screen row
  const notifItems = [
    {
      type: 'phone',
      icon: 'call',
      color: '#22C55E',
      count: notifications.phone,
      label: 'Missed',
      tab: 'Phone',
    },
    {
      type: 'messages',
      icon: 'chatbubble',
      color: '#3B82F6',
      count: notifications.messages,
      label: 'Unread',
      tab: 'Messages',
    },
    {
      type: 'ticket',
      icon: 'ticket',
      color: '#F59E0B',
      count: notifications.ticket ? 1 : 0,
      label: 'Alert',
      tab: 'Ticket',
    },
    {
      type: 'camera',
      icon: 'camera',
      color: '#A855F7',
      count: notifications.camera ? 1 : 0,
      label: 'Notice',
      tab: 'Camera',
    },
  ].filter((n) => n.count > 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('EventList')}
          accessibilityLabel="Browse events"
        >
          <Ionicons name="calendar-outline" size={24} color="#3F3F5A" />
          {!consentGiven && <View style={styles.warningDot} />}
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>BUZR</Text>
        </View>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Profile"
        >
          <Ionicons name="person-circle-outline" size={26} color="#3F3F5A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Simulation')}
          accessibilityLabel="Run simulation"
        >
          <Ionicons name="flask-outline" size={22} color="#3F3F5A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Shot Clock ── */}
        <ShotClock
          seconds={displayEvent ? countdown : 0}
          label={clockLabel}
          eventName={displayEvent?.name}
          isActive={isActive}
        />

        {/* ── Notification row ── */}
        {notifItems.length > 0 && (
          <View style={styles.notifSection}>
            <Text style={styles.notifSectionTitle}>NOTIFICATIONS</Text>
            <View style={styles.notifRow}>
              {notifItems.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[styles.notifCard, { borderColor: item.color + '55' }]}
                  onPress={() => {
                    clearNotification(item.type);
                    navigation.navigate(item.tab);
                  }}
                  activeOpacity={0.75}
                >
                  <View style={[styles.notifIconCircle, { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={[styles.notifBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.notifBadgeText}>{item.count}</Text>
                  </View>
                  <Text style={[styles.notifCardLabel, { color: item.color }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Active restriction pill ── */}
        {isActive && (
          <TouchableOpacity
            style={styles.restrictionPill}
            onPress={() => navigation.navigate('Restriction')}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed" size={14} color="#EF4444" />
            <Text style={styles.restrictionPillText}>Restrictions Active</Text>
            <Ionicons name="chevron-forward" size={14} color="#3F3F5A" />
          </TouchableOpacity>
        )}

        {/* ── Quick-action grid ── */}
        <View style={styles.quickGrid}>
          {/* Flashlight */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Flashlight')}
            accessibilityLabel="Flashlight"
          >
            <Ionicons name="flashlight-outline" size={26} color="#F1F5F9" />
            <Text style={styles.quickCardLabel}>Torch</Text>
          </TouchableOpacity>

          {/* Emergency apps */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('EmergencyApps')}
            accessibilityLabel="Emergency apps"
          >
            <Ionicons name="medkit-outline" size={26} color="#F87171" />
            <Text style={styles.quickCardLabel}>Medical</Text>
            {(emergencyApps || []).length > 0 && (
              <View style={styles.quickCardBadge}>
                <Text style={styles.quickCardBadgeText}>{emergencyApps.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Events */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('EventList')}
            accessibilityLabel="Events"
          >
            <Ionicons name="calendar-outline" size={26} color="#818CF8" />
            <Text style={styles.quickCardLabel}>Events</Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-outline" size={26} color="#94A3B8" />
            <Text style={styles.quickCardLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Register CTA ── */}
        {registeredEvents.length === 0 && (
          <TouchableOpacity
            style={styles.registerCTA}
            onPress={() => navigation.navigate('EventList')}
          >
            <Ionicons name="add-circle-outline" size={18} color="#818CF8" />
            <Text style={styles.registerCTAText}>Register for an event</Text>
            <Ionicons name="chevron-forward" size={14} color="#3F3F5A" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Shot clock styles ────────────────────────────────────────────────────────
const PANEL_SIZE = 240; // square

const clockStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 24, paddingTop: 4 },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3F3F5A',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  // Square panel — NBA/CBB shot clock aesthetic
  panel: {
    width: PANEL_SIZE,
    height: PANEL_SIZE,
    backgroundColor: '#0A0007',
    borderWidth: 2,
    borderColor: '#2A2A3A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  panelActive: {
    borderColor: '#EF4444',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  // Corner accent marks
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: '#EF4444',
    opacity: 0.7,
  },
  cTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2 },
  cTR: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2 },
  cBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2 },
  cBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2 },
  // Digit layout
  digitRow: { flexDirection: 'row', alignItems: 'center' },
  digitBlock: { alignItems: 'center' },
  digit: {
    fontSize: 72,
    fontWeight: '900',
    color: '#EF4444',
    fontVariant: ['tabular-nums'],
    lineHeight: 76,
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  colon: {
    fontSize: 64,
    fontWeight: '900',
    color: '#B91C1C',
    marginHorizontal: 4,
    marginBottom: 6,
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  unitRow: {
    flexDirection: 'row',
    marginTop: 6,
    width: 180,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  unitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A1515',
    letterSpacing: 2,
    textTransform: 'uppercase',
    width: 60,
    textAlign: 'center',
  },
  unitSpacer: { width: 20 },
  // Bracket stems
  bracketRow: { flexDirection: 'row', gap: 20, marginTop: 0 },
  bracket: { width: 3, height: 14, backgroundColor: '#2A2A3A', borderRadius: 2 },
  // Brand
  brand: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  eventName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    maxWidth: 280,
  },
  noEvent: { fontSize: 12, color: '#1E293B', fontStyle: 'italic' },
});

// ─── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerIconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  warningDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E1E2E',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8, alignItems: 'center' },

  // Notification row
  notifSection: { width: '100%', marginBottom: 16 },
  notifSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3F3F5A',
    letterSpacing: 2,
    marginBottom: 10,
  },
  notifRow: { flexDirection: 'row', gap: 10 },
  notifCard: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF' },
  notifCardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  // Restriction pill
  restrictionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A0808',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EF444433',
    alignSelf: 'stretch',
  },
  restrictionPillText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.5,
  },

  // Quick action grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginBottom: 14,
  },
  quickCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    position: 'relative',
  },
  quickCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3F3F5A',
    letterSpacing: 0.5,
  },
  quickCardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },

  // Register CTA
  registerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  registerCTAText: { flex: 1, fontSize: 13, color: '#3F3F5A' },
});

