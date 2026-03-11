/**
 * AdminScreen — BUZR Admin Panel
 *
 * Gives the admin/tester ability to:
 *  1. Inspect current app state at a glance
 *  2. Create simulated events that start immediately or in N minutes
 *  3. Manage existing custom events (register, remove)
 *  4. Override GPS location to simulate being inside/outside a venue
 *  5. Force restrictions ON or OFF for manual QA
 *  6. Trigger test notifications for each tab category
 *  7. Quick-launch any screen in the app
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { SAMPLE_EVENTS, EVENT_TYPE_COLORS, EVENT_TYPE_ICONS } from '../data/sampleEvents';
import { isEventActive, isEventUpcoming } from '../utils/restrictionUtils';
import { F } from '../theme/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = '#EF4444';
const BG = '#0A0A0F';
const CARD_BG = '#12121C';
const BORDER = '#1E1E2E';
const TEXT = '#F1F5F9';
const MUTED = '#6B7280';

// Venue preset locations for GPS simulation
const GPS_PRESETS = [
  { label: 'MSG (inside)',      lat: 40.7505,  lon: -73.9934,  icon: '🏟️' },
  { label: 'Crypto.com (in)',   lat: 34.0430,  lon: -118.2673, icon: '🏀' },
  { label: 'Rodgers (inside)',  lat: 40.7590,  lon: -73.9872,  icon: '🎭' },
  { label: 'AMC (inside)',      lat: 40.7845,  lon: -73.9818,  icon: '🎬' },
  { label: '2 km outside MSG',  lat: 40.7685,  lon: -73.9934,  icon: '🚶' },
];

// Event type options for the create form
const EVENT_TYPES = ['concert', 'sporting', 'theater', 'movie'];

// Start-in minute options (0 = starts right now)
const START_OPTIONS   = [0, 1, 2, 5, 10, 15, 30];
// Duration minute options
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];
// Proximity radius options (meters)
const RADIUS_OPTIONS  = [10, 20, 30, 60, 80, 100, 200];

// Apps that can be allowed per event
const ALL_APPS = ['Phone', 'Messages', 'Camera'];

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildEventId() {
  return `admin_${Date.now()}`;
}

function buildEvent({ name, type, venue, startOffsetMins, durationMins, radiusMeters, allowedApps }) {
  const now = new Date();
  const start = new Date(now.getTime() + startOffsetMins * 60 * 1000);
  const end   = new Date(start.getTime() + durationMins  * 60 * 1000);
  return {
    id: buildEventId(),
    name: name.trim() || 'Admin Test Event',
    type,
    venue: venue.trim() || 'Test Venue',
    address: 'Admin-created test location',
    latitude: 40.7505,   // default to MSG; admin can set GPS override separately
    longitude: -73.9934,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    proximityRadiusMeters: radiusMeters,
    allowedApps: [...allowedApps],
    description: `Admin-created simulated event for beta testing. Starts in ${startOffsetMins}m, runs for ${durationMins}m.`,
    ticketCode: `ADMIN-${Date.now()}`,
    image: type,
  };
}

function eventStatus(event) {
  if (isEventActive(event)) return { label: 'LIVE', color: '#EF4444' };
  if (isEventUpcoming(event)) return { label: 'SOON', color: '#F59E0B' };
  return { label: 'ENDED', color: '#6B7280' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, color = ACCENT }) {
  return (
    <View style={s.sectionHeader}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[s.sectionTitle, { color, fontFamily: F.black }]}>{title}</Text>
    </View>
  );
}

function StatusBadge({ label, value, valueColor }) {
  return (
    <View style={s.statusRow}>
      <Text style={[s.statusLabel, { fontFamily: F.regular }]}>{label}</Text>
      <Text style={[s.statusValue, { color: valueColor ?? TEXT, fontFamily: F.semiBold }]}>{value}</Text>
    </View>
  );
}

function Stepper({ label, value, options, onChange }) {
  const idx = options.indexOf(value);
  const dec = () => idx > 0 && onChange(options[idx - 1]);
  const inc = () => idx < options.length - 1 && onChange(options[idx + 1]);
  return (
    <View style={s.stepperRow}>
      <Text style={[s.stepperLabel, { fontFamily: F.regular }]}>{label}</Text>
      <View style={s.stepperControls}>
        <TouchableOpacity style={[s.stepBtn, idx === 0 && s.stepBtnDisabled]} onPress={dec} activeOpacity={0.7}>
          <Text style={s.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={[s.stepValue, { fontFamily: F.semiBold }]}>{value}</Text>
        <TouchableOpacity style={[s.stepBtn, idx === options.length - 1 && s.stepBtnDisabled]} onPress={inc} activeOpacity={0.7}>
          <Text style={s.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminScreen({ navigation }) {
  const {
    consentGiven,
    userLocation,
    activeEvent,
    restrictionActive,
    registeredEvents,
    events,
    customEvents,
    addCustomEvent,
    removeCustomEvent,
    registerForEvent,
    unregisterFromEvent,
    addNotification,
    clearNotification,
    notifications,
    simulatedLocation,
    setSimulatedLocation,
    restrictionOverride,
    setRestrictionOverride,
  } = useAppContext();

  // ── Create-event form state ──
  const [eventName,     setEventName]     = useState('My Test Event');
  const [eventType,     setEventType]     = useState('sporting');
  const [venueName,     setVenueName]     = useState('Test Arena');
  const [startOffset,   setStartOffset]   = useState(0);
  const [duration,      setDuration]      = useState(30);
  const [radius,        setRadius]        = useState(60);
  const [selectedApps,  setSelectedApps]  = useState(['Phone', 'Messages', 'Camera']);

  const toggleApp = useCallback((app) => {
    setSelectedApps((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    );
  }, []);

  const handleCreateEvent = useCallback(() => {
    const event = buildEvent({
      name: eventName,
      type: eventType,
      venue: venueName,
      startOffsetMins: startOffset,
      durationMins: duration,
      radiusMeters: radius,
      allowedApps: selectedApps,
    });
    addCustomEvent(event);
    registerForEvent(event.id);
    const startMsg = startOffset === 0 ? 'starting NOW' : `starts in ${startOffset}m`;
    Alert.alert(
      '✅ Event Created',
      `"${event.name}" ${startMsg}, running ${duration}m.\n\nAuto-registered. Use GPS override to simulate venue entry.`,
      [{ text: 'OK' }]
    );
  }, [eventName, eventType, venueName, startOffset, duration, radius, selectedApps, addCustomEvent, registerForEvent]);

  const handleRemoveEvent = useCallback((id, name) => {
    Alert.alert('Remove Event', `Delete "${name}" and unregister?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeCustomEvent(id),
      },
    ]);
  }, [removeCustomEvent]);

  const handleClearAllNotifications = useCallback(() => {
    clearNotification('phone');
    clearNotification('messages');
    clearNotification('ticket');
    clearNotification('camera');
  }, [clearNotification]);

  // ── Derived ──
  const gpsDisplay = simulatedLocation
    ? `🔴 OVERRIDE: ${simulatedLocation.latitude.toFixed(4)}, ${simulatedLocation.longitude.toFixed(4)}`
    : userLocation
      ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
      : 'No GPS signal';

  const overrideDisplay =
    restrictionOverride === true  ? 'FORCE ON'  :
    restrictionOverride === false ? 'FORCE OFF' : 'AUTO';

  const notifSummary = [
    notifications.phone > 0 && `${notifications.phone} missed call(s)`,
    notifications.messages > 0 && `${notifications.messages} message(s)`,
    notifications.ticket && 'ticket alert',
    notifications.camera && 'camera notice',
  ].filter(Boolean).join(', ') || 'None';

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 1. App State Inspector ── */}
        <View style={s.card}>
          <SectionHeader icon="pulse-outline" title="APP STATE" color="#22C55E" />
          <StatusBadge label="Consent"
            value={consentGiven ? 'Granted ✓' : 'Not given ✗'}
            valueColor={consentGiven ? '#22C55E' : ACCENT} />
          <StatusBadge label="GPS"
            value={gpsDisplay}
            valueColor={simulatedLocation ? '#F59E0B' : TEXT} />
          <StatusBadge label="Restriction"
            value={restrictionActive ? 'ACTIVE 🔒' : 'Inactive 🔓'}
            valueColor={restrictionActive ? ACCENT : '#22C55E'} />
          <StatusBadge label="Override"
            value={overrideDisplay}
            valueColor={restrictionOverride === null ? MUTED : '#F59E0B'} />
          <StatusBadge label="Active Event"
            value={activeEvent?.name ?? 'None'}
            valueColor={activeEvent ? '#818CF8' : MUTED} />
          <StatusBadge label="Registered"
            value={`${registeredEvents.length} event(s)`} />
          <StatusBadge label="Notifications"
            value={notifSummary}
            valueColor={notifSummary === 'None' ? MUTED : '#F59E0B'} />
        </View>

        {/* ── 2. GPS Simulator ── */}
        <View style={s.card}>
          <SectionHeader icon="navigate-outline" title="GPS SIMULATOR" color="#3B82F6" />
          <Text style={[s.helpText, { fontFamily: F.regular }]}>
            Simulate your device being at a venue without physically going there.
          </Text>
          <View style={s.gpsGrid}>
            {GPS_PRESETS.map((p) => {
              const isActive = simulatedLocation?.latitude === p.lat && simulatedLocation?.longitude === p.lon;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[s.gpsBtn, isActive && s.gpsBtnActive]}
                  onPress={() => setSimulatedLocation({ latitude: p.lat, longitude: p.lon })}
                  activeOpacity={0.75}
                >
                  <Text style={s.gpsBtnIcon}>{p.icon}</Text>
                  <Text style={[s.gpsBtnLabel, { fontFamily: F.semiBold, color: isActive ? ACCENT : TEXT }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {simulatedLocation && (
            <TouchableOpacity style={s.clearBtn} onPress={() => setSimulatedLocation(null)} activeOpacity={0.8}>
              <Ionicons name="close-circle-outline" size={16} color={ACCENT} />
              <Text style={[s.clearBtnText, { fontFamily: F.semiBold }]}>Clear GPS Override</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 3. Restriction Override ── */}
        <View style={s.card}>
          <SectionHeader icon="lock-closed-outline" title="RESTRICTION OVERRIDE" color="#F59E0B" />
          <Text style={[s.helpText, { fontFamily: F.regular }]}>
            Force restrictions on or off regardless of GPS or event timing.
          </Text>
          <View style={s.overrideRow}>
            {[
              { label: 'Force ON',   value: true,  color: ACCENT      },
              { label: 'Force OFF',  value: false, color: '#22C55E'   },
              { label: 'AUTO',       value: null,  color: '#818CF8'   },
            ].map(({ label, value, color }) => {
              const active = restrictionOverride === value;
              return (
                <TouchableOpacity
                  key={label}
                  style={[s.overrideBtn, active && { borderColor: color, backgroundColor: color + '22' }]}
                  onPress={() => setRestrictionOverride(value)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.overrideBtnText, { color: active ? color : MUTED, fontFamily: F.black }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 4. Notification Triggers ── */}
        <View style={s.card}>
          <SectionHeader icon="notifications-outline" title="NOTIFICATION TRIGGERS" color="#A855F7" />
          <Text style={[s.helpText, { fontFamily: F.regular }]}>
            Fire test notifications to verify tab badges and notification cards.
          </Text>
          <View style={s.notifGrid}>
            {[
              { label: '+1 Missed Call', type: 'phone',    icon: 'call',       color: '#22C55E' },
              { label: '+1 Message',     type: 'messages', icon: 'chatbubble', color: '#3B82F6' },
              { label: 'Ticket Alert',   type: 'ticket',   icon: 'ticket',     color: '#F59E0B' },
              { label: 'Camera Notice',  type: 'camera',   icon: 'camera',     color: '#A855F7' },
            ].map(({ label, type, icon, color }) => (
              <TouchableOpacity
                key={type}
                style={[s.notifBtn, { borderColor: color + '55' }]}
                onPress={() => addNotification(type)}
                activeOpacity={0.75}
              >
                <Ionicons name={icon} size={20} color={color} />
                <Text style={[s.notifBtnLabel, { color, fontFamily: F.semiBold }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.clearBtn} onPress={handleClearAllNotifications} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color={MUTED} />
            <Text style={[s.clearBtnText, { color: MUTED, fontFamily: F.semiBold }]}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>

        {/* ── 5. Create Simulated Event ── */}
        <View style={s.card}>
          <SectionHeader icon="add-circle-outline" title="CREATE SIMULATED EVENT" color="#818CF8" />
          <Text style={[s.helpText, { fontFamily: F.regular }]}>
            Create a test event, auto-register for it, then use GPS Simulator to trigger restrictions.
          </Text>

          {/* Name */}
          <Text style={[s.fieldLabel, { fontFamily: F.semiBold }]}>Event Name</Text>
          <TextInput
            style={[s.textInput, { fontFamily: F.regular }]}
            value={eventName}
            onChangeText={setEventName}
            placeholder="e.g. NBA Finals Game 7"
            placeholderTextColor={MUTED}
          />

          {/* Venue */}
          <Text style={[s.fieldLabel, { fontFamily: F.semiBold }]}>Venue Name</Text>
          <TextInput
            style={[s.textInput, { fontFamily: F.regular }]}
            value={venueName}
            onChangeText={setVenueName}
            placeholder="e.g. Madison Square Garden"
            placeholderTextColor={MUTED}
          />

          {/* Event Type */}
          <Text style={[s.fieldLabel, { fontFamily: F.semiBold }]}>Event Type</Text>
          <View style={s.typeRow}>
            {EVENT_TYPES.map((t) => {
              const active = eventType === t;
              const color  = EVENT_TYPE_COLORS[t];
              return (
                <TouchableOpacity
                  key={t}
                  style={[s.typeChip, active && { borderColor: color, backgroundColor: color + '22' }]}
                  onPress={() => setEventType(t)}
                  activeOpacity={0.75}
                >
                  <Text style={s.typeChipIcon}>{EVENT_TYPE_ICONS[t]}</Text>
                  <Text style={[s.typeChipLabel, { color: active ? color : MUTED, fontFamily: F.semiBold }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Steppers */}
          <Stepper
            label={`Starts In (min) — ${startOffset === 0 ? 'NOW' : `${startOffset} min`}`}
            value={startOffset}
            options={START_OPTIONS}
            onChange={setStartOffset}
          />
          <Stepper
            label={`Duration — ${duration} min`}
            value={duration}
            options={DURATION_OPTIONS}
            onChange={setDuration}
          />
          <Stepper
            label={`Proximity Radius — ${radius} m`}
            value={radius}
            options={RADIUS_OPTIONS}
            onChange={setRadius}
          />

          {/* Allowed Apps */}
          <Text style={[s.fieldLabel, { fontFamily: F.semiBold }]}>Allowed Apps</Text>
          <View style={s.appsRow}>
            {ALL_APPS.map((app) => {
              const checked = selectedApps.includes(app);
              return (
                <TouchableOpacity
                  key={app}
                  style={[s.appChip, checked && s.appChipChecked]}
                  onPress={() => toggleApp(app)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={16}
                    color={checked ? ACCENT : MUTED}
                  />
                  <Text style={[s.appChipLabel, { color: checked ? TEXT : MUTED, fontFamily: F.regular }]}>
                    {app}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={s.createBtn} onPress={handleCreateEvent} activeOpacity={0.8}>
            <Ionicons name="add-circle" size={18} color="#0A0A0F" />
            <Text style={[s.createBtnText, { fontFamily: F.black }]}>Create & Register</Text>
          </TouchableOpacity>
        </View>

        {/* ── 6. Custom Events List ── */}
        {customEvents.length > 0 && (
          <View style={s.card}>
            <SectionHeader icon="list-outline" title="MY SIMULATED EVENTS" color="#22C55E" />
            {customEvents.map((ev) => {
              const { label: statusLabel, color: statusColor } = eventStatus(ev);
              const isRegistered = registeredEvents.includes(ev.id);
              const typeColor    = EVENT_TYPE_COLORS[ev.type] ?? ACCENT;
              return (
                <View key={ev.id} style={s.eventRow}>
                  <View style={[s.eventTypeDot, { backgroundColor: typeColor }]} />
                  <View style={s.eventInfo}>
                    <Text style={[s.eventName, { fontFamily: F.semiBold }]} numberOfLines={1}>
                      {ev.name}
                    </Text>
                    <Text style={[s.eventMeta, { fontFamily: F.regular }]}>
                      {ev.venue} · {ev.proximityRadiusMeters}m radius
                    </Text>
                  </View>
                  <View style={[s.statusPill, { borderColor: statusColor + '55' }]}>
                    <Text style={[s.statusPillText, { color: statusColor, fontFamily: F.semiBold }]}>
                      {statusLabel}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[s.regBtn, isRegistered && s.regBtnActive]}
                    onPress={() => isRegistered ? unregisterFromEvent(ev.id) : registerForEvent(ev.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.regBtnText, { fontFamily: F.semiBold }]}>
                      {isRegistered ? 'Unreg' : 'Reg'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => handleRemoveEvent(ev.id, ev.name)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="trash-outline" size={16} color={ACCENT} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* ── 7. Quick Launch ── */}
        <View style={s.card}>
          <SectionHeader icon="rocket-outline" title="QUICK LAUNCH" color="#F59E0B" />
          <Text style={[s.helpText, { fontFamily: F.regular }]}>
            Jump directly to any screen to verify it is working correctly.
          </Text>
          <View style={s.launchGrid}>
            {[
              { icon: 'lock-closed-outline',    color: ACCENT,     label: 'Restrictions',   screen: 'Restriction'    },
              { icon: 'medkit-outline',          color: '#F87171',  label: 'Emergency Apps', screen: 'EmergencyApps'  },
              { icon: 'flashlight-outline',      color: '#F1F5F9',  label: 'Flashlight',     screen: 'Flashlight'     },
              { icon: 'flask-outline',           color: '#818CF8',  label: 'Simulation',     screen: 'Simulation'     },
              { icon: 'calendar-outline',        color: '#6366F1',  label: 'Events',         screen: 'EventList'      },
              { icon: 'person-outline',          color: '#94A3B8',  label: 'Profile',        screen: 'Profile'        },
            ].map(({ icon, color, label, screen }) => (
              <TouchableOpacity
                key={label}
                style={s.launchBtn}
                onPress={() => navigation.navigate(screen)}
                activeOpacity={0.75}
              >
                <View style={[s.launchIcon, { backgroundColor: color + '22' }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>
                <Text style={[s.launchLabel, { fontFamily: F.semiBold }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll:    { padding: 16 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 1.5,
  },

  helpText: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 12,
    lineHeight: 18,
  },

  // Status inspector
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  statusLabel: { fontSize: 13, color: MUTED },
  statusValue: { fontSize: 13, maxWidth: '60%', textAlign: 'right' },

  // GPS simulator
  gpsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0E0E1A',
  },
  gpsBtnActive: { borderColor: ACCENT, backgroundColor: ACCENT + '18' },
  gpsBtnIcon: { fontSize: 16 },
  gpsBtnLabel: { fontSize: 12 },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearBtnText: { fontSize: 13, color: ACCENT },

  // Restriction override
  overrideRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  overrideBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  overrideBtnText: { fontSize: 13 },

  // Notification triggers
  notifGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  notifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0E0E1A',
    minWidth: '44%',
  },
  notifBtnLabel: { fontSize: 12 },

  // Create form
  fieldLabel: {
    fontSize: 12,
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#0E0E1A',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: TEXT,
    fontSize: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  typeChipIcon: { fontSize: 14 },
  typeChipLabel: { fontSize: 12 },

  // Stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  stepperLabel: { fontSize: 13, color: TEXT, flex: 1 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepBtnText: { color: TEXT, fontSize: 18, lineHeight: 22 },
  stepValue: { fontSize: 15, color: TEXT, minWidth: 48, textAlign: 'center' },

  // Allowed apps checkboxes
  appsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  appChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  appChipChecked: { borderColor: ACCENT + '66', backgroundColor: ACCENT + '12' },
  appChipLabel: { fontSize: 13 },

  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 18,
  },
  createBtnText: { fontSize: 15, color: '#0A0A0F', letterSpacing: 0.5 },

  // Custom events list
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  eventTypeDot: { width: 8, height: 8, borderRadius: 4 },
  eventInfo: { flex: 1 },
  eventName: { fontSize: 13, color: TEXT },
  eventMeta: { fontSize: 11, color: MUTED, marginTop: 2 },
  statusPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusPillText: { fontSize: 10 },
  regBtn: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  regBtnActive: { borderColor: '#22C55E55', backgroundColor: '#22C55E18' },
  regBtnText: { fontSize: 11, color: TEXT },
  deleteBtn: {
    padding: 4,
  },

  // Quick launch
  launchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  launchBtn: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#0E0E1A',
  },
  launchIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchLabel: { fontSize: 11, color: TEXT, textAlign: 'center' },
});
