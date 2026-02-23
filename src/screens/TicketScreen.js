import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { formatDate, formatTime, isEventActive, isEventUpcoming } from '../utils/restrictionUtils';
import { EVENT_TYPE_ICONS, EVENT_TYPE_COLORS } from '../data/sampleEvents';

// Simulates a barcode row using thin/thick alternating bars
function Barcode() {
  const pattern = [3,1,2,1,3,2,1,2,1,3,1,2,2,1,1,3,2,1,2,1,1,2,3,1,2,1,3,2,1,1];
  return (
    <View style={barcodeStyles.container}>
      {pattern.map((w, i) => (
        <View
          key={i}
          style={[
            barcodeStyles.bar,
            i % 2 === 0 ? barcodeStyles.barDark : barcodeStyles.barLight,
            { width: w * 2 },
          ]}
        />
      ))}
    </View>
  );
}

function TicketCard({ event }) {
  const typeColor = EVENT_TYPE_COLORS[event.type] || '#6D28D9';
  const typeIcon = EVENT_TYPE_ICONS[event.type] || '📅';
  const active = isEventActive(event);
  const upcoming = isEventUpcoming(event);

  return (
    <View style={[ticketStyles.card, { borderTopColor: typeColor }]}>
      {/* Ticket top half */}
      <View style={ticketStyles.topHalf}>
        {/* Left accent strip */}
        <View style={[ticketStyles.accent, { backgroundColor: typeColor }]} />

        <View style={ticketStyles.topContent}>
          {/* Status */}
          <View style={ticketStyles.statusRow}>
            {active && (
              <View style={[ticketStyles.statusBadge, { backgroundColor: '#450A0A' }]}>
                <Text style={ticketStyles.statusText}>🔴 LIVE NOW</Text>
              </View>
            )}
            {upcoming && !active && (
              <View style={[ticketStyles.statusBadge, { backgroundColor: '#1C1917' }]}>
                <Text style={ticketStyles.statusText}>⏳ STARTING SOON</Text>
              </View>
            )}
            {/* BUZR Verified stamp */}
            <View style={ticketStyles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#6EE7B7" />
              <Text style={ticketStyles.verifiedText}>BUZR VERIFIED</Text>
            </View>
          </View>

          {/* Event name */}
          <Text style={ticketStyles.eventName}>{event.name}</Text>

          {/* Venue & date row */}
          <View style={ticketStyles.detailsGrid}>
            <View style={ticketStyles.detailItem}>
              <Text style={ticketStyles.detailLabel}>VENUE</Text>
              <Text style={ticketStyles.detailValue} numberOfLines={1}>
                {event.venue}
              </Text>
            </View>
            <View style={ticketStyles.detailItem}>
              <Text style={ticketStyles.detailLabel}>DATE</Text>
              <Text style={ticketStyles.detailValue}>
                {formatDate(event.startTime)}
              </Text>
            </View>
            <View style={ticketStyles.detailItem}>
              <Text style={ticketStyles.detailLabel}>TIME</Text>
              <Text style={ticketStyles.detailValue}>
                {formatTime(event.startTime)}
              </Text>
            </View>
            <View style={ticketStyles.detailItem}>
              <Text style={ticketStyles.detailLabel}>TYPE</Text>
              <Text style={ticketStyles.detailValue}>
                {typeIcon} {event.type.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tear line */}
      <View style={ticketStyles.tearLine}>
        <View style={ticketStyles.tearCircleLeft} />
        <View style={ticketStyles.tearDashes} />
        <View style={ticketStyles.tearCircleRight} />
      </View>

      {/* Ticket bottom half — barcode + ticket code */}
      <View style={ticketStyles.bottomHalf}>
        <Text style={ticketStyles.ticketCodeLabel}>TICKET CODE</Text>
        <Text style={ticketStyles.ticketCode}>{event.ticketCode}</Text>
        <Barcode />
        <Text style={ticketStyles.barcodeDigits}>
          {event.ticketCode.replace(/[^0-9]/g, '').padStart(12, '0')}
        </Text>
      </View>
    </View>
  );
}

export default function TicketScreen({ navigation }) {
  const { registeredEvents, events } = useAppContext();

  const myEvents = registeredEvents
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="ticket-outline" size={26} color="#F59E0B" />
        <Text style={styles.headerTitle}>My Tickets</Text>
      </View>

      {myEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="ticket-outline" size={72} color="#1E293B" />
          <Text style={styles.emptyTitle}>No Tickets Yet</Text>
          <Text style={styles.emptyBody}>
            Register for events to see your tickets here.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('EventList')}
          >
            <Text style={styles.browseButtonText}>Browse Events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.countLabel}>
            {myEvents.length} ticket{myEvents.length !== 1 ? 's' : ''}
          </Text>
          {myEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
              activeOpacity={0.9}
            >
              <TicketCard event={event} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => navigation.navigate('EventList')}
          >
            <Ionicons name="add-circle-outline" size={18} color="#A78BFA" />
            <Text style={styles.addMoreText}>Register for more events</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Barcode styles ────────────────────────────────────────────────────────
const barcodeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 52,
    alignItems: 'stretch',
    marginVertical: 8,
  },
  bar: { height: '100%' },
  barDark: { backgroundColor: '#1E293B' },
  barLight: { backgroundColor: '#F1F5F9' },
});

// ─── Ticket card styles ────────────────────────────────────────────────────
const ticketStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderTopWidth: 4,
  },
  topHalf: {
    flexDirection: 'row',
    padding: 0,
  },
  accent: {
    width: 5,
  },
  topContent: {
    flex: 1,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, color: '#F1F5F9', fontWeight: '700' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  verifiedText: { fontSize: 10, color: '#6EE7B7', fontWeight: '700', letterSpacing: 0.5 },
  eventName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 12,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    minWidth: '45%',
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  // Tear line between top and bottom halves
  tearLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    height: 20,
    backgroundColor: '#0F172A',
  },
  tearCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    marginLeft: -10,
  },
  tearDashes: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    borderStyle: 'dashed',
  },
  tearCircleRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    marginRight: -10,
  },
  bottomHalf: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  ticketCodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  ticketCode: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 3,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  barcodeDigits: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94A3B8',
    letterSpacing: 2,
    marginTop: 2,
  },
});

// ─── Screen styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#F1F5F9' },
  scroll: { padding: 16, paddingBottom: 48 },
  countLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F1F5F9',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  browseButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  addMoreText: { color: '#A78BFA', fontSize: 14, fontWeight: '600' },
});
