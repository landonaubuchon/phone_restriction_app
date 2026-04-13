import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { isEventUpcoming, secondsUntilStart, secondsUntilEnd } from '../utils/restrictionUtils';
import { EVENT_TYPE_COLORS, EVENT_TYPE_ICONS } from '../data/sampleEvents';
import { F } from '../theme/fonts';
import BUZRLogo from '../components/BUZRLogo';
import AnimatedPressCard from '../components/AnimatedPressCard';
import useEntranceAnimation from '../hooks/useEntranceAnimation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRealTime() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const isPM = h >= 12;
  h = h % 12 || 12;
  return { hh: String(h).padStart(2, '0'), mm: m, ampm: isPM ? 'PM' : 'AM' };
}

function fmtCountdown(secs) {
  if (secs <= 0) return '0m';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Event Atmosphere Strip ───────────────────────────────────────────────────
// Shows event-type theming above the clock — fills the screen with venue energy.

const ATMOSPHERE = {
  concert: {
    bg: '#12002A',
    border: '#8B5CF6',
    tagline: 'SHOW NIGHT',
    emojis: ['🎵', '🎤', '🎶'],
  },
  sporting: {
    bg: '#1A0D00',
    border: '#F59E0B',
    tagline: 'GAME NIGHT',
    emojis: ['🏀', '🏆', '⚡'],
  },
  theater: {
    bg: '#1A0012',
    border: '#EC4899',
    tagline: 'CURTAIN CALL',
    emojis: ['🎭', '🌟', '🎪'],
  },
  movie: {
    bg: '#00081A',
    border: '#3B82F6',
    tagline: 'SHOWTIME',
    emojis: ['🎬', '🎥', '🍿'],
  },
};

function AtmosphereStrip({ event }) {
  const theme = ATMOSPHERE[event?.type] ?? null;
  if (!theme || !event) {
    // No event registered — show a neutral "ready" strip
    return (
      <View style={atmosStyles.neutralStrip}>
        <Text style={atmosStyles.neutralIcon}>🔒</Text>
        <View style={atmosStyles.neutralText}>
          <Text style={[atmosStyles.neutralTitle, { fontFamily: F.black }]}>BUZR READY</Text>
          <Text style={atmosStyles.neutralSub}>Register an event to activate</Text>
        </View>
      </View>
    );
  }

  const typeColor = EVENT_TYPE_COLORS[event.type] ?? '#6D28D9';

  return (
    <View style={[atmosStyles.strip, { backgroundColor: theme.bg, borderColor: theme.border + '66' }]}>
      {/* Decorative emoji row */}
      <View style={atmosStyles.emojiRow}>
        {theme.emojis.map((e, i) => (
          <Text key={i} style={[atmosStyles.emojiDeco, { opacity: i === 1 ? 1 : 0.4 }]}>{e}</Text>
        ))}
      </View>

      <View style={atmosStyles.stripContent}>
        <View style={[atmosStyles.tagRow, { backgroundColor: typeColor + '33' }]}>
          <Text style={[atmosStyles.tagText, { color: typeColor, fontFamily: F.black }]}>
            {theme.tagline}
          </Text>
        </View>
        <Text style={[atmosStyles.eventTitle, { fontFamily: F.black }]} numberOfLines={1}>
          {event.name}
        </Text>
        <Text style={atmosStyles.venueName} numberOfLines={1}>📍 {event.venue}</Text>
      </View>

      {/* Type icon */}
      <Text style={atmosStyles.typeIcon}>{EVENT_TYPE_ICONS[event.type]}</Text>
    </View>
  );
}

// ─── Shot Clock Panel ─────────────────────────────────────────────────────────
// Displays current real time (HH:MM) like an arena scoreboard wall clock.
// Square panel, bright red LED digits, NBA/CBB corner accents.

function ShotClock({ isActive, eventName, eventType, secsToEnd, secsToStart }) {
  const [time, setTime] = useState(getRealTime());

  // Update the clock only when the minute changes (HH:MM display — seconds not shown).
  // Calculate the exact ms until the next minute boundary so the clock stays accurate
  // while avoiding 59 out of every 60 unnecessary re-renders.
  useEffect(() => {
    let timeoutId;
    const scheduleNextMinute = () => {
      const now = new Date();
      const msUntilNext = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      timeoutId = setTimeout(() => {
        setTime(getRealTime());
        scheduleNextMinute();
      }, msUntilNext);
    };
    scheduleNextMinute();
    return () => clearTimeout(timeoutId);
  }, []);

  const { hh, mm, ampm } = time;
  const typeColor = EVENT_TYPE_COLORS[eventType] ?? '#EF4444';

  return (
    <View style={clockStyles.wrapper}>
      <Text style={[clockStyles.statusLabel, { fontFamily: F.regular }]}>CURRENT TIME</Text>

      {/* Square panel */}
      <View style={[clockStyles.panel, isActive && { borderColor: '#EF4444', ...clockStyles.panelActiveShadow }]}>
        {/* Corner accent marks */}
        <View style={[clockStyles.corner, clockStyles.cTL]} />
        <View style={[clockStyles.corner, clockStyles.cTR]} />
        <View style={[clockStyles.corner, clockStyles.cBL]} />
        <View style={[clockStyles.corner, clockStyles.cBR]} />

        {/* LED digit blocks */}
        <View style={clockStyles.digitRow}>
          <Text style={[clockStyles.digit, { fontFamily: F.black }]}>{hh}</Text>
          <Text style={[clockStyles.colon, { fontFamily: F.black }]}>:</Text>
          <Text style={[clockStyles.digit, { fontFamily: F.black }]}>{mm}</Text>
        </View>

        {/* AM / PM */}
        <Text style={[clockStyles.ampm, { fontFamily: F.semiBold }]}>{ampm}</Text>
      </View>

      {/* Bracket stems */}
      <View style={clockStyles.bracketRow}>
        <View style={clockStyles.bracket} />
        <View style={clockStyles.bracket} />
      </View>

      {/* Brand */}
      <Text style={[clockStyles.brand, { fontFamily: F.black }]}>BUZR</Text>

      {/* Event status row */}
      {eventName ? (
        <View style={clockStyles.eventStatusRow}>
          {isActive ? (
            <View style={clockStyles.liveChip}>
              <View style={clockStyles.liveDot} />
              <Text style={[clockStyles.liveText, { fontFamily: F.semiBold }]}>LIVE</Text>
            </View>
          ) : (
            <View style={[clockStyles.soonChip, { borderColor: typeColor + '44' }]}>
              <Text style={[clockStyles.soonText, { color: typeColor, fontFamily: F.semiBold }]}>
                IN {fmtCountdown(secsToStart)}
              </Text>
            </View>
          )}
          <Text style={[clockStyles.eventNameLabel, { fontFamily: F.regular }]} numberOfLines={1}>
            {eventName}
          </Text>
        </View>
      ) : (
        <Text style={clockStyles.noEvent}>No active event</Text>
      )}

      {/* Thin restriction progress bar (when active) */}
      {isActive && secsToEnd > 0 && (
        <View style={clockStyles.progressBarWrap}>
          <Text style={[clockStyles.progressLabel, { fontFamily: F.regular }]}>
            RESTRICTIONS END IN {fmtCountdown(secsToEnd)}
          </Text>
        </View>
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
    focusLockActive,
    enableFocusLock,
    disableFocusLock,
  } = useAppContext();

  const [secsToEnd, setSecsToEnd]     = useState(0);
  const [secsToStart, setSecsToStart] = useState(0);

  // Staggered entrance animations
  const headerAnim  = useEntranceAnimation({ delay: 0,   fromY: -20, duration: 380 });
  const atmoAnim    = useEntranceAnimation({ delay: 80,  fromY: 20,  duration: 400 });
  const clockAnim   = useEntranceAnimation({ delay: 160, fromY: 24,  duration: 440 });
  const gridAnim    = useEntranceAnimation({ delay: 280, fromY: 20,  duration: 380 });
  const bottomAnim  = useEntranceAnimation({ delay: 360, fromY: 16,  duration: 360 });

  useEffect(() => {
    headerAnim.start();
    atmoAnim.start();
    clockAnim.start();
    gridAnim.start();
    bottomAnim.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextEvent = !activeEvent
    ? registeredEvents
        .map((id) => events.find((e) => e.id === id))
        .filter(Boolean)
        .find((e) => isEventUpcoming(e) || new Date(e.startTime) > new Date())
    : null;

  const displayEvent = activeEvent || nextEvent;
  const isActive     = !!activeEvent;

  useEffect(() => {
    const tick = () => {
      if (displayEvent) {
        setSecsToEnd(secondsUntilEnd(displayEvent));
        setSecsToStart(secondsUntilStart(displayEvent));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [displayEvent]);

  const EMERGENCY_ICONS = {
    'Glucose Monitor': '🩸',
    Insulin: '💉',
    'Heart Monitor': '❤️',
    Maps: '🗺️',
    Wallet: '💳',
  };

  const notifItems = [
    { type: 'phone',    icon: 'call',        color: '#22C55E', count: notifications.phone,             label: 'Missed',  tab: 'Phone'    },
    { type: 'messages', icon: 'chatbubble',   color: '#3B82F6', count: notifications.messages,          label: 'Unread',  tab: 'Messages' },
    { type: 'ticket',   icon: 'ticket',       color: '#F59E0B', count: notifications.ticket ? 1 : 0,    label: 'Alert',   tab: 'Ticket'   },
    { type: 'camera',   icon: 'camera',       color: '#A855F7', count: notifications.camera ? 1 : 0,    label: 'Notice',  tab: 'Camera'   },
  ].filter((n) => n.count > 0);

  // Quick-action cards
  const quickActions = [
    { icon: 'flashlight-outline', color: '#F1F5F9', label: 'Torch',   sub: 'On/Off toggle',      screen: 'Flashlight'    },
    { icon: 'medkit-outline',     color: '#F87171', label: 'Medical', sub: 'Emergency apps',     screen: 'EmergencyApps', badge: (emergencyApps || []).length || null },
    { icon: 'calendar-outline',   color: '#818CF8', label: 'Events',  sub: 'Browse & register',  screen: 'EventList'     },
    { icon: 'person-outline',     color: '#94A3B8', label: 'Profile', sub: 'Settings & consent', screen: 'Profile'       },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header — animated slide down ── */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerAnim.opacity, transform: [{ translateY: headerAnim.translateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('EventList')}
          accessibilityLabel="Browse events"
        >
          <Ionicons name="calendar-outline" size={24} color="#3F3F5A" />
          {!consentGiven && <View style={styles.warningDot} />}
        </TouchableOpacity>

        {/* Centered BUZR logo in header */}
        <BUZRLogo size={22} pulse={false} style={styles.headerLogo} />

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

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Admin')}
          accessibilityLabel="Admin panel"
        >
          <Ionicons name="construct-outline" size={22} color="#3F3F5A" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Atmosphere strip — animated ── */}
        <Animated.View
          style={{ opacity: atmoAnim.opacity, transform: [{ translateY: atmoAnim.translateY }] }}
        >
          <AtmosphereStrip event={displayEvent} />
        </Animated.View>

        {/* ── Shot Clock — animated ── */}
        <Animated.View
          style={{ opacity: clockAnim.opacity, transform: [{ translateY: clockAnim.translateY }] }}
        >
          <ShotClock
            isActive={isActive}
            eventName={displayEvent?.name}
            eventType={displayEvent?.type}
            secsToEnd={secsToEnd}
            secsToStart={secsToStart}
          />
        </Animated.View>

        {/* ── Notification row ── */}
        {notifItems.length > 0 && (
          <Animated.View
            style={[
              styles.notifSection,
              { opacity: gridAnim.opacity, transform: [{ translateY: gridAnim.translateY }] },
            ]}
          >
            <Text style={[styles.notifSectionTitle, { fontFamily: F.semiBold }]}>NOTIFICATIONS</Text>
            <View style={styles.notifRow}>
              {notifItems.map((item) => (
                <AnimatedPressCard
                  key={item.type}
                  style={[styles.notifCard, { borderColor: item.color + '55' }]}
                  onPress={() => { clearNotification(item.type); navigation.navigate(item.tab); }}
                  scaleTo={0.95}
                >
                  <View style={[styles.notifIconCircle, { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={[styles.notifBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.notifBadgeText}>{item.count}</Text>
                  </View>
                  <Text style={[styles.notifCardLabel, { color: item.color, fontFamily: F.semiBold }]}>
                    {item.label}
                  </Text>
                </AnimatedPressCard>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── Active restriction pill ── */}
        {isActive && (
          <Animated.View
            style={{ opacity: gridAnim.opacity, transform: [{ translateY: gridAnim.translateY }] }}
          >
            <AnimatedPressCard
              onPress={() => navigation.navigate('Restriction')}
              style={styles.restrictionPill}
              scaleTo={0.97}
            >
              <Ionicons name="lock-closed" size={14} color="#EF4444" />
              <Text style={[styles.restrictionPillText, { fontFamily: F.semiBold }]}>
                Restrictions Active — Tap to View
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#3F3F5A" />
            </AnimatedPressCard>
          </Animated.View>
        )}

        {/* ── Quick-action grid — animated ── */}
        <Animated.View
          style={[
            styles.quickGrid,
            { opacity: gridAnim.opacity, transform: [{ translateY: gridAnim.translateY }] },
          ]}
        >
          {quickActions.map(({ icon, color, label, sub, screen, badge }) => (
            <AnimatedPressCard
              key={label}
              style={styles.quickCard}
              onPress={() => navigation.navigate(screen)}
              scaleTo={0.95}
            >
              <Ionicons name={icon} size={30} color={color} />
              <Text style={[styles.quickCardLabel, { fontFamily: F.black }]}>{label}</Text>
              <Text style={styles.quickCardSub}>{sub}</Text>
              {badge ? (
                <View style={styles.quickCardBadge}>
                  <Text style={styles.quickCardBadgeText}>{badge}</Text>
                </View>
              ) : null}
            </AnimatedPressCard>
          ))}
        </Animated.View>

        {/* ── Focus Mode toggle card ── */}
        <Animated.View
          style={[
            styles.focusCard,
            focusLockActive && styles.focusCardActive,
            { opacity: gridAnim.opacity, transform: [{ translateY: gridAnim.translateY }] },
          ]}
        >
          <View style={styles.focusCardLeft}>
            <View style={[styles.focusIconCircle, focusLockActive && styles.focusIconCircleActive]}>
              <Ionicons
                name={focusLockActive ? 'lock-closed' : 'lock-open-outline'}
                size={22}
                color={focusLockActive ? '#EF4444' : '#3F3F5A'}
              />
            </View>
            <View style={styles.focusCardText}>
              <Text style={[styles.focusCardTitle, { fontFamily: F.black }]}>
                {focusLockActive ? 'FOCUS MODE ACTIVE' : 'BUZR FOCUS MODE'}
              </Text>
              <Text style={[styles.focusCardSub, { fontFamily: F.regular }]}>
                {focusLockActive
                  ? 'Stay in BUZR — earns initiatives progress'
                  : 'Voluntarily lock yourself to this app'}
              </Text>
            </View>
          </View>
          <AnimatedPressCard
            style={[
              styles.focusToggleBtn,
              focusLockActive && styles.focusToggleBtnActive,
            ]}
            onPress={() => {
              if (focusLockActive) {
                disableFocusLock();
              } else {
                enableFocusLock(activeEvent);
              }
            }}
            scaleTo={0.92}
          >
            <Text style={[styles.focusToggleText, { fontFamily: F.black }]}>
              {focusLockActive ? 'EXIT' : 'START'}
            </Text>
          </AnimatedPressCard>
        </Animated.View>

        {/* ── Emergency apps row ── */}
        <Animated.View
          style={{ opacity: bottomAnim.opacity, transform: [{ translateY: bottomAnim.translateY }] }}
        >
          {(emergencyApps || []).length > 0 && (
            <View style={styles.emergencySection}>
              <View style={styles.emergencySectionHeader}>
                <Ionicons name="medkit" size={14} color="#F87171" />
                <Text style={[styles.emergencySectionTitle, { fontFamily: F.semiBold }]}>
                  EMERGENCY APPS ACTIVE
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('EmergencyApps')}>
                  <Text style={[styles.manageLink, { fontFamily: F.regular }]}>Manage ›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.emergencyChipRow}>
                {emergencyApps.slice(0, 4).map((app) => (
                  <View key={app} style={styles.emergencyChip}>
                    <Text style={styles.emergencyChipIcon}>{EMERGENCY_ICONS[app] ?? '📱'}</Text>
                    <Text style={[styles.emergencyChipLabel, { fontFamily: F.regular }]}>{app}</Text>
                  </View>
                ))}
                {emergencyApps.length > 4 && (
                  <Text style={styles.emergencyMore}>+{emergencyApps.length - 4}</Text>
                )}
              </View>
            </View>
          )}

          {/* ── Upcoming events strip (fills bottom blank space) ── */}
          {registeredEvents.length > 0 ? (
            <View style={styles.upcomingStrip}>
              <View style={styles.upcomingStripHeader}>
                <Ionicons name="calendar" size={14} color="#818CF8" />
                <Text style={[styles.upcomingStripTitle, { fontFamily: F.semiBold }]}>
                  MY EVENTS
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('EventList')}>
                  <Text style={[styles.manageLink, { fontFamily: F.regular }]}>View All ›</Text>
                </TouchableOpacity>
              </View>
              {registeredEvents.slice(0, 3).map((id) => {
                const ev = events.find((e) => e.id === id);
                if (!ev) return null;
                const typeColor = EVENT_TYPE_COLORS[ev.type] ?? '#6D28D9';
                return (
                  <AnimatedPressCard
                    key={id}
                    style={styles.upcomingRow}
                    onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}
                    scaleTo={0.98}
                  >
                    <View style={[styles.upcomingDot, { backgroundColor: typeColor }]} />
                    <View style={styles.upcomingInfo}>
                      <Text style={[styles.upcomingName, { fontFamily: F.semiBold }]} numberOfLines={1}>
                        {ev.name}
                      </Text>
                      <Text style={styles.upcomingVenue} numberOfLines={1}>📍 {ev.venue}</Text>
                    </View>
                    <Text style={[styles.upcomingType, { color: typeColor }]}>
                      {EVENT_TYPE_ICONS[ev.type]}
                    </Text>
                  </AnimatedPressCard>
                );
              })}
            </View>
          ) : (
            <AnimatedPressCard
              onPress={() => navigation.navigate('EventList')}
              style={styles.registerCTA}
              scaleTo={0.97}
            >
              <Ionicons name="add-circle-outline" size={18} color="#818CF8" />
              <Text style={[styles.registerCTAText, { fontFamily: F.regular }]}>
                Register for an event to activate BUZR
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#3F3F5A" />
            </AnimatedPressCard>
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
// ─── Atmosphere strip styles ──────────────────────────────────────────────────
const atmosStyles = StyleSheet.create({
  strip: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  emojiRow: {
    flexDirection: 'column',
    gap: 4,
  },
  emojiDeco: { fontSize: 22 },
  stripContent: { flex: 1 },
  tagRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 11, letterSpacing: 2 },
  eventTitle: { fontSize: 18, color: '#F1F5F9', marginBottom: 3 },
  venueName: { fontSize: 12, color: '#64748B' },
  typeIcon: { fontSize: 36, opacity: 0.7 },
  // Neutral strip (no event)
  neutralStrip: {
    width: '100%',
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  neutralIcon: { fontSize: 32 },
  neutralText: { flex: 1 },
  neutralTitle: { fontSize: 18, color: '#3F3F5A', letterSpacing: 2 },
  neutralSub: { fontSize: 12, color: '#1E293B', marginTop: 2 },
});

// ─── Shot clock styles ────────────────────────────────────────────────────────
const PANEL_SIZE = 240; // square

const clockStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 20, paddingTop: 4 },
  statusLabel: {
    fontSize: 10,
    color: '#3F3F5A',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  panel: {
    width: PANEL_SIZE,
    height: PANEL_SIZE,
    backgroundColor: '#0A0007',
    borderWidth: 2,
    borderColor: '#2A2A3A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelActiveShadow: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
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
  digitRow: { flexDirection: 'row', alignItems: 'center' },
  digit: {
    fontSize: 80,
    color: '#EF4444',
    lineHeight: 84,
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  colon: {
    fontSize: 68,
    color: '#B91C1C',
    marginHorizontal: 4,
    marginBottom: 8,
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  ampm: {
    fontSize: 13,
    color: '#7F1D1D',
    letterSpacing: 3,
    marginTop: -4,
  },
  bracketRow: { flexDirection: 'row', gap: 20, marginTop: 0 },
  bracket: { width: 3, height: 14, backgroundColor: '#2A2A3A', borderRadius: 2 },
  brand: {
    fontSize: 24,
    color: '#F1F5F9',
    letterSpacing: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  // Event status row below brand
  eventStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 280,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#450A0A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF444455',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: { fontSize: 11, color: '#EF4444', letterSpacing: 1 },
  soonChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#0F0F1A',
  },
  soonText: { fontSize: 11, letterSpacing: 0.5 },
  eventNameLabel: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  noEvent: { fontSize: 12, color: '#1E293B', fontStyle: 'italic' },
  progressBarWrap: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 9,
    color: '#EF4444',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#EF4444',
    letterSpacing: 8,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8, alignItems: 'center' },

  // Notification row
  notifSection: { width: '100%', marginBottom: 16 },
  notifSectionTitle: {
    fontSize: 10,
    color: '#3F3F5A',
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
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
  notifCardLabel: { fontSize: 10, letterSpacing: 0.5 },

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
    color: '#EF4444',
    letterSpacing: 0.5,
  },

  // Quick action grid — 4 cards, 2×2
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#0F0F1A',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    position: 'relative',
  },
  quickCardLabel: {
    fontSize: 13,
    color: '#CBD5E1',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quickCardSub: {
    fontSize: 9,
    color: '#3F3F5A',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  quickCardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },

  // Emergency apps strip
  emergencySection: {
    width: '100%',
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F8717133',
  },
  emergencySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  emergencySectionTitle: {
    flex: 1,
    fontSize: 10,
    color: '#F87171',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  manageLink: { fontSize: 12, color: '#818CF8' },
  emergencyChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emergencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1A0808',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8717122',
  },
  emergencyChipIcon: { fontSize: 14 },
  emergencyChipLabel: { fontSize: 11, color: '#F87171' },
  emergencyMore: { fontSize: 12, color: '#64748B', alignSelf: 'center' },

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
    borderColor: '#818CF822',
  },
  registerCTAText: { flex: 1, fontSize: 13, color: '#3F3F5A' },

  // Header BUZRLogo
  headerLogo: { flex: 1 },

  // Upcoming events strip (fills bottom blank space)
  upcomingStrip: {
    width: '100%',
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#818CF833',
  },
  upcomingStripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  upcomingStripTitle: {
    flex: 1,
    fontSize: 10,
    color: '#818CF8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  upcomingInfo: { flex: 1 },
  upcomingName: { fontSize: 14, color: '#F1F5F9', marginBottom: 2 },
  upcomingVenue: { fontSize: 11, color: '#475569' },
  upcomingType: { fontSize: 20 },

  // Focus Mode toggle card
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#0F0F1A',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    gap: 12,
  },
  focusCardActive: {
    backgroundColor: '#1A0808',
    borderColor: '#EF444444',
  },
  focusCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  focusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusIconCircleActive: {
    backgroundColor: '#2A0808',
    borderWidth: 1,
    borderColor: '#EF444455',
  },
  focusCardText: { flex: 1 },
  focusCardTitle: {
    fontSize: 12,
    color: '#CBD5E1',
    letterSpacing: 1,
    marginBottom: 3,
  },
  focusCardSub: {
    fontSize: 11,
    color: '#3F3F5A',
    lineHeight: 15,
  },
  focusToggleBtn: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#3F3F5A',
  },
  focusToggleBtnActive: {
    backgroundColor: '#2A0808',
    borderColor: '#EF4444',
  },
  focusToggleText: {
    fontSize: 13,
    color: '#CBD5E1',
    letterSpacing: 1.5,
  },
});

