/**
 * InitiativesScreen
 *
 * Shows reward initiatives that users can earn by voluntarily using BUZR
 * Focus Mode at live events.  Each initiative has an animated progress bar
 * and a reward description so users always know how close they are to their
 * next benefit.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { F } from '../theme/fonts';

// ─── Initiative definitions ───────────────────────────────────────────────────

function buildInitiatives(stats) {
  const { sessionsCount = 0, totalSecondsLocked = 0, majorVenueComplied = false } = stats;
  const hoursLocked = totalSecondsLocked / 3600;

  return [
    {
      id: 'first_timer',
      icon: '🎟️',
      color: '#818CF8',
      bgColor: '#0D0D2A',
      borderColor: '#818CF844',
      title: 'First Timer',
      description: 'Use BUZR Focus Mode at your first event',
      reward: 'Free seat upgrade at your next event',
      rewardIcon: 'arrow-up-circle',
      rewardColor: '#818CF8',
      current: Math.min(1, sessionsCount),
      total: 1,
      unit: 'event',
      progressLabel: `${Math.min(1, sessionsCount)} / 1 event`,
    },
    {
      id: 'triple_play',
      icon: '🎯',
      color: '#F59E0B',
      bgColor: '#1A0D00',
      borderColor: '#F59E0B44',
      title: 'Triple Play',
      description: 'Use BUZR Focus Mode at 3 events',
      reward: '$25 Ticketmaster credit',
      rewardIcon: 'card',
      rewardColor: '#F59E0B',
      current: Math.min(3, sessionsCount),
      total: 3,
      unit: 'events',
      progressLabel: `${Math.min(3, sessionsCount)} / 3 events`,
    },
    {
      id: 'time_champion',
      icon: '⏱️',
      color: '#34D399',
      bgColor: '#001A0D',
      borderColor: '#34D39944',
      title: 'Time Champion',
      description: 'Log 10 total hours in BUZR Focus Mode',
      reward: 'Exclusive BUZR merchandise pack',
      rewardIcon: 'shirt',
      rewardColor: '#34D399',
      current: parseFloat(Math.min(10, hoursLocked).toFixed(1)),
      total: 10,
      unit: 'hrs',
      progressLabel: `${parseFloat(Math.min(10, hoursLocked).toFixed(1))} / 10 hrs`,
    },
    {
      id: 'streak_star',
      icon: '⚡',
      color: '#EF4444',
      bgColor: '#1A0808',
      borderColor: '#EF444444',
      title: 'Streak Star',
      description: 'Use BUZR Focus Mode at 5 events',
      reward: 'Priority venue entry at all registered events',
      rewardIcon: 'rocket',
      rewardColor: '#EF4444',
      current: Math.min(5, sessionsCount),
      total: 5,
      unit: 'events',
      progressLabel: `${Math.min(5, sessionsCount)} / 5 events`,
    },
    {
      id: 'venue_legend',
      icon: '🏆',
      color: '#EC4899',
      bgColor: '#1A0012',
      borderColor: '#EC489944',
      title: 'Venue Legend',
      description: 'Use Focus Mode at a major concert or sporting event',
      reward: 'Concert ticket giveaway entry + BUZR VIP status',
      rewardIcon: 'trophy',
      rewardColor: '#EC4899',
      current: majorVenueComplied ? 1 : 0,
      total: 1,
      unit: 'event',
      progressLabel: majorVenueComplied ? '1 / 1 event' : '0 / 1 event',
    },
  ];
}

// ─── Animated progress bar ────────────────────────────────────────────────────

function ProgressBar({ current, total, color }) {
  const fraction = total > 0 ? Math.min(1, current / total) : 0;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: fraction,
      duration: 900,
      delay: 200,
      useNativeDriver: false, // width animation requires JS driver
    }).start();
  }, [fraction, barAnim]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={pbStyles.track}>
      <Animated.View
        style={[
          pbStyles.fill,
          { width: barWidth, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const pbStyles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});

// ─── Initiative card ──────────────────────────────────────────────────────────

function InitiativeCard({ initiative, index }) {
  const { icon, color, bgColor, borderColor, title, description, reward,
    rewardIcon, rewardColor, current, total, progressLabel } = initiative;

  const isComplete = current >= total;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 100,
        useNativeDriver: true,
        bounciness: 4,
      }),
    ]).start();
  }, [opacity, translateY, index]);

  return (
    <Animated.View
      style={[
        cardStyles.card,
        { backgroundColor: bgColor, borderColor, opacity, transform: [{ translateY }] },
        isComplete && cardStyles.cardComplete,
      ]}
    >
      {/* Status badge */}
      {isComplete ? (
        <View style={[cardStyles.badge, cardStyles.badgeComplete]}>
          <Ionicons name="checkmark-circle" size={12} color="#34D399" />
          <Text style={[cardStyles.badgeText, { color: '#34D399', fontFamily: F.semiBold }]}>
            COMPLETED
          </Text>
        </View>
      ) : (
        <View style={[cardStyles.badge, cardStyles.badgeProgress]}>
          <View style={[cardStyles.progDot, { backgroundColor: color }]} />
          <Text style={[cardStyles.badgeText, { color, fontFamily: F.semiBold }]}>
            IN PROGRESS
          </Text>
        </View>
      )}

      {/* Icon + title */}
      <View style={cardStyles.titleRow}>
        <Text style={cardStyles.iconLabel}>{icon}</Text>
        <View style={cardStyles.titleBlock}>
          <Text style={[cardStyles.title, { fontFamily: F.black, color }]}>{title}</Text>
          <Text style={[cardStyles.description, { fontFamily: F.regular }]}>{description}</Text>
        </View>
      </View>

      {/* Progress bar + label */}
      <ProgressBar current={current} total={total} color={color} />
      <Text style={[cardStyles.progressLabel, { fontFamily: F.semiBold, color }]}>
        {progressLabel}
      </Text>

      {/* Reward row */}
      <View style={[cardStyles.rewardRow, { borderColor: rewardColor + '33' }]}>
        <Ionicons name={rewardIcon} size={16} color={rewardColor} />
        <Text style={[cardStyles.rewardText, { fontFamily: F.regular }]}>
          <Text style={{ color: rewardColor, fontFamily: F.semiBold }}>Reward: </Text>
          {reward}
        </Text>
      </View>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  cardComplete: {
    borderWidth: 1.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeComplete: { backgroundColor: '#00200E' },
  badgeProgress: { backgroundColor: '#0F172A' },
  progDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 10, letterSpacing: 1.5 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconLabel: { fontSize: 32, lineHeight: 40 },
  titleBlock: { flex: 1 },
  title: { fontSize: 20, letterSpacing: 0.5, marginBottom: 2 },
  description: { fontSize: 13, color: '#94A3B8', lineHeight: 18 },
  progressLabel: { fontSize: 12, letterSpacing: 0.5, marginBottom: 12 },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  rewardText: { flex: 1, fontSize: 12, color: '#94A3B8', lineHeight: 17 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InitiativesScreen() {
  const { complianceStats } = useAppContext();
  const initiatives = buildInitiatives(complianceStats);

  const completedCount = initiatives.filter((i) => i.current >= i.total).length;
  const { sessionsCount = 0, totalSecondsLocked = 0 } = complianceStats;
  const hoursDisplay = (totalSecondsLocked / 3600).toFixed(1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Summary banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontFamily: F.black }]}>
              {completedCount}/{initiatives.length}
            </Text>
            <Text style={[styles.summaryLabel, { fontFamily: F.regular }]}>Completed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontFamily: F.black }]}>{sessionsCount}</Text>
            <Text style={[styles.summaryLabel, { fontFamily: F.regular }]}>Focus Sessions</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { fontFamily: F.black }]}>{hoursDisplay}h</Text>
            <Text style={[styles.summaryLabel, { fontFamily: F.regular }]}>Time in BUZR</Text>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howRow}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" />
          <Text style={[styles.howText, { fontFamily: F.regular }]}>
            Activate Focus Mode on the BUZR home screen during events to earn progress.
          </Text>
        </View>

        {/* Initiative cards */}
        {initiatives.map((initiative, index) => (
          <InitiativeCard key={initiative.id} initiative={initiative} index={index} />
        ))}

        {/* Footer note */}
        <Text style={[styles.footer, { fontFamily: F.regular }]}>
          Rewards are delivered via your registered email once each initiative is completed.
          Contact support@buzr.app to claim completed rewards.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 16, paddingBottom: 48 },

  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 26, color: '#EF4444', letterSpacing: 1 },
  summaryLabel: { fontSize: 11, color: '#475569', letterSpacing: 0.5, marginTop: 2 },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1E1E2E',
  },

  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#0D1117',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  howText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  footer: {
    fontSize: 11,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 8,
    paddingHorizontal: 8,
  },
});
