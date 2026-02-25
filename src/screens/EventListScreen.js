import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { isEventActive, isEventUpcoming, formatTime, formatDate } from '../utils/restrictionUtils';
import { EVENT_TYPE_ICONS, EVENT_TYPE_COLORS } from '../data/sampleEvents';

function EventCard({ event, isRegistered, onPress }) {
  const active = isEventActive(event);
  const upcoming = isEventUpcoming(event);
  const typeColor = EVENT_TYPE_COLORS[event.type] || '#6D28D9';
  const typeIcon = EVENT_TYPE_ICONS[event.type] || '📅';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.cardAccent, { backgroundColor: typeColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeIcon}>{typeIcon}</Text>
            <Text style={[styles.typeLabel, { color: typeColor }]}>
              {event.type.toUpperCase()}
            </Text>
          </View>
          {active && <View style={[styles.statusBadge, styles.activeBadge]}>
            <Text style={styles.statusText}>🔴 LIVE</Text>
          </View>}
          {upcoming && !active && <View style={[styles.statusBadge, styles.upcomingBadge]}>
            <Text style={styles.statusText}>⏳ SOON</Text>
          </View>}
          {isRegistered && <View style={[styles.statusBadge, styles.registeredBadge]}>
            <Text style={styles.statusText}>✓ Registered</Text>
          </View>}
        </View>

        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.venue}>📍 {event.venue}</Text>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {formatDate(event.startTime)} · {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventListScreen({ navigation }) {
  const { events, registeredEvents, restrictionActive, activeEvent, consentGiven } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      {/* Restriction Banner */}
      {restrictionActive && activeEvent && (
        <TouchableOpacity
          style={styles.restrictionBanner}
          onPress={() => navigation.navigate('Restriction')}
          activeOpacity={0.85}
        >
          <Text style={styles.restrictionBannerIcon}>🔒</Text>
          <View>
            <Text style={styles.restrictionBannerTitle}>Restrictions Active</Text>
            <Text style={styles.restrictionBannerSub}>{activeEvent.name} – Tap for details</Text>
          </View>
          <Text style={styles.restrictionBannerArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Consent reminder */}
      {!consentGiven && (
        <View style={styles.consentBanner}>
          <Text style={styles.consentText}>
            ⚠️ BUZR consent not given. Restrictions won't be enforced.
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.heading}>Upcoming Events</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            isRegistered={registeredEvents.includes(item.id)}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No events available.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  restrictionBanner: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  restrictionBannerIcon: { fontSize: 24 },
  restrictionBannerTitle: { color: '#F1F5F9', fontWeight: '700', fontSize: 15 },
  restrictionBannerSub: { color: '#C4B5FD', fontSize: 13 },
  restrictionBannerArrow: { marginLeft: 'auto', color: '#C4B5FD', fontSize: 22 },
  consentBanner: {
    backgroundColor: '#78350F',
    padding: 12,
    paddingHorizontal: 16,
  },
  consentText: { color: '#FDE68A', fontSize: 13 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  heading: { flex: 1, fontSize: 24, fontWeight: '800', color: '#F1F5F9' },
  profileIcon: { fontSize: 26 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardAccent: { width: 6 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeIcon: { fontSize: 16 },
  typeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activeBadge: { backgroundColor: '#450A0A' },
  upcomingBadge: { backgroundColor: '#1C1917' },
  registeredBadge: { backgroundColor: '#14532D' },
  statusText: { fontSize: 11, color: '#F1F5F9', fontWeight: '600' },
  eventName: { fontSize: 17, fontWeight: '700', color: '#F1F5F9', marginBottom: 4 },
  venue: { fontSize: 13, color: '#94A3B8', marginBottom: 4 },
  timeRow: { marginTop: 2 },
  timeText: { fontSize: 13, color: '#64748B' },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
