/**
 * SimulatedAppScreen
 *
 * Beta-mode simulated live data for each emergency app preset.
 * Route param:  appName — one of 'Glucose Monitor', 'Heart Monitor',
 *                          'Insulin', 'Maps', 'Wallet'
 *
 * All values are randomly generated and update on a timer so the screen
 * feels like a real connected health / utility app.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { F } from '../theme/fonts';

// ─── Shared layout helpers ────────────────────────────────────────────────────

function BetaBanner() {
  return (
    <View style={shared.betaBanner}>
      <Ionicons name="flask-outline" size={13} color="#A78BFA" />
      <Text style={shared.betaText}>BETA · SIMULATED DATA — NOT REAL READINGS</Text>
    </View>
  );
}

function InfoRow({ text }) {
  return (
    <View style={shared.infoRow}>
      <Ionicons name="time-outline" size={13} color="#475569" />
      <Text style={shared.infoText}>{text}</Text>
    </View>
  );
}

function StatusChip({ label, color }) {
  return (
    <View style={[shared.chip, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[shared.chipText, { color }]}>{label}</Text>
    </View>
  );
}

// Slight downward bias keeps simulated glucose trending toward the normal range
// rather than drifting to extremes (0.47 < 0.5 creates a small negative skew).
const GLUCOSE_DRIFT_BIAS = 0.47;

// ─── Glucose Monitor ─────────────────────────────────────────────────────────

function GlucoseApp() {
  const [glucose, setGlucose] = useState(5.4);
  const [history, setHistory] = useState([5.1, 5.3, 5.2, 5.5, 5.4, 5.4]);

  useEffect(() => {
    const id = setInterval(() => {
      setGlucose((g) => {
        const delta = (Math.random() - GLUCOSE_DRIFT_BIAS) * 0.15;
        const next = +(Math.max(3.2, Math.min(11.0, g + delta)).toFixed(1));
        setHistory((h) => [...h.slice(-5), next]);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const isLow  = glucose < 4.0;
  const isHigh = glucose > 10.0;
  const status = isLow ? 'LOW' : isHigh ? 'HIGH' : 'IN RANGE';
  const color  = isLow ? '#EF4444' : isHigh ? '#F59E0B' : '#22C55E';
  const prev   = history[history.length - 2] ?? glucose;
  const diff   = glucose - prev;
  const arrow  = diff > 0.1 ? '↑↑' : diff > 0 ? '↗' : diff < -0.1 ? '↓↓' : diff < 0 ? '↘' : '→';

  return (
    <ScrollView contentContainerStyle={appStyles.scroll}>
      <BetaBanner />

      {/* Main reading */}
      <View style={appStyles.mainCard}>
        <Text style={appStyles.appIcon}>🩸</Text>
        <View style={appStyles.readingRow}>
          <Text style={[appStyles.bigValue, { color, fontFamily: F.black }]}>{glucose.toFixed(1)}</Text>
          <View style={appStyles.readingMeta}>
            <Text style={[appStyles.unit, { color }]}>mmol/L</Text>
            <Text style={[appStyles.trendArrow, { color }]}>{arrow}</Text>
          </View>
        </View>
        <StatusChip label={status} color={color} />
      </View>

      {/* Mini bar chart */}
      <View style={appStyles.section}>
        <Text style={[appStyles.sectionTitle, { fontFamily: F.semiBold }]}>Last 30 Minutes</Text>
        <View style={appStyles.barChart}>
          {history.map((v, i) => {
            const h  = Math.max(8, ((v - 2) / 9) * 70);
            const c  = v < 4.0 ? '#EF4444' : v > 10.0 ? '#F59E0B' : '#22C55E';
            const op = i === history.length - 1 ? 'FF' : '77';
            return (
              <View key={i} style={appStyles.barCol}>
                <Text style={appStyles.barValLabel}>{v.toFixed(1)}</Text>
                <View style={[appStyles.bar, { height: h, backgroundColor: c + op }]} />
              </View>
            );
          })}
        </View>
        <View style={appStyles.rangeRow}>
          <View style={[appStyles.rangeDot, { backgroundColor: '#22C55E' }]} />
          <Text style={appStyles.rangeText}>Target range: 4.0 – 10.0 mmol/L</Text>
        </View>
      </View>

      {/* Details */}
      <View style={appStyles.detailsCard}>
        {[
          { label: 'Last Meal',    value: '2h 14m ago' },
          { label: 'Sensor Type',  value: 'CGM — Continuous' },
          { label: 'Next Calibration', value: 'In 4h 30m' },
        ].map(({ label, value }) => (
          <View key={label} style={appStyles.detailRow}>
            <Text style={appStyles.detailLabel}>{label}</Text>
            <Text style={appStyles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      <InfoRow text="Auto-refreshes every 3 seconds · Sensor active" />
    </ScrollView>
  );
}

// ─── Heart Monitor ────────────────────────────────────────────────────────────

function HeartApp() {
  const [bpm, setBpm] = useState(72);
  const [tick, setTick]  = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBpm((b) => Math.round(Math.max(50, Math.min(115, b + (Math.random() - 0.5) * 5))));
      setTick((t) => t + 1);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const isHigh = bpm > 100;
  const isLow  = bpm < 60;
  const status = isHigh ? 'ELEVATED' : isLow ? 'LOW' : 'NORMAL';
  const color  = isHigh ? '#EF4444'  : isLow  ? '#F59E0B' : '#22C55E';

  // Decorative ECG bar pattern (heights in px)
  const ecg = [4, 4, 4, 4, 24, 44, 12, 20, 6, 4, 4, 4, 4];

  return (
    <ScrollView contentContainerStyle={appStyles.scroll}>
      <BetaBanner />

      <View style={appStyles.mainCard}>
        <Ionicons name="heart" size={44} color={color} style={{ marginBottom: 8 }} />
        <Text style={[appStyles.bigValue, { color, fontFamily: F.black }]}>{bpm}</Text>
        <Text style={[appStyles.unit, { color, fontSize: 18, marginTop: -4 }]}>BPM</Text>
        <StatusChip label={status} color={color} />
      </View>

      {/* ECG strip */}
      <View style={appStyles.section}>
        <Text style={[appStyles.sectionTitle, { fontFamily: F.semiBold }]}>Live ECG Strip</Text>
        <View style={appStyles.ecgStrip}>
          {ecg.map((h, i) => (
            <View
              key={i}
              style={[
                appStyles.ecgSeg,
                { height: h, backgroundColor: color + (i === 4 || i === 5 ? 'FF' : '99') },
              ]}
            />
          ))}
        </View>
        <Text style={appStyles.ecgNote}>Tick #{tick} — waveform updates every 1.5 s</Text>
      </View>

      <View style={appStyles.detailsCard}>
        {[
          { label: 'Resting HR (24h avg)', value: '69 BPM' },
          { label: 'Variability',          value: 'Normal (38 ms RMSSD)' },
          { label: 'Zone',                 value: isHigh ? 'Cardio zone' : 'Resting zone' },
        ].map(({ label, value }) => (
          <View key={label} style={appStyles.detailRow}>
            <Text style={appStyles.detailLabel}>{label}</Text>
            <Text style={appStyles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      <InfoRow text="Sensor reads every 1.5 seconds · Wrist sensor active" />
    </ScrollView>
  );
}

// ─── Insulin ─────────────────────────────────────────────────────────────────

function InsulinApp() {
  const log = [
    { time: '7:30 AM',  dose: '10 units', type: 'Rapid-acting', note: 'Before breakfast' },
    { time: '12:45 PM', dose: '8 units',  type: 'Rapid-acting', note: 'Before lunch' },
    { time: '6:00 PM',  dose: '12 units', type: 'Rapid-acting', note: 'Scheduled' },
  ];
  const nextDose = { time: '10:00 PM', dose: '18 units', type: 'Long-acting (basal)' };

  return (
    <ScrollView contentContainerStyle={appStyles.scroll}>
      <BetaBanner />

      <View style={appStyles.mainCard}>
        <Text style={appStyles.appIcon}>💉</Text>
        <Text style={[appStyles.bigValue, { color: '#818CF8', fontFamily: F.black }]}>
          Last Dose
        </Text>
        <Text style={[appStyles.unit, { color: '#818CF8', fontSize: 14, marginTop: 2 }]}>
          8 units · 4h 12m ago
        </Text>
        <StatusChip label="ON SCHEDULE" color="#22C55E" />
      </View>

      <View style={appStyles.section}>
        <Text style={[appStyles.sectionTitle, { fontFamily: F.semiBold }]}>Today's Log</Text>
        {log.map((entry) => (
          <View key={entry.time} style={appStyles.logRow}>
            <View style={appStyles.logDot} />
            <View style={appStyles.logContent}>
              <Text style={appStyles.logTime}>{entry.time}</Text>
              <Text style={appStyles.logDose}>{entry.dose} · {entry.type}</Text>
              <Text style={appStyles.logNote}>{entry.note}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={appStyles.nextDoseCard}>
        <View style={appStyles.nextDoseRow}>
          <Ionicons name="alarm-outline" size={20} color="#F59E0B" />
          <Text style={[appStyles.nextDoseTitle, { fontFamily: F.semiBold }]}>Next Dose</Text>
        </View>
        <Text style={appStyles.nextDoseValue}>{nextDose.time} · {nextDose.dose}</Text>
        <Text style={appStyles.nextDoseType}>{nextDose.type}</Text>
      </View>

      <InfoRow text="Dose log synced to your care team" />
    </ScrollView>
  );
}

// ─── Maps ─────────────────────────────────────────────────────────────────────

function MapsApp() {
  const venue = { name: 'Crypto.com Arena', city: 'Los Angeles, CA', dist: '0.1 mi' };

  return (
    <ScrollView contentContainerStyle={appStyles.scroll}>
      <BetaBanner />

      <View style={appStyles.mainCard}>
        <Text style={appStyles.appIcon}>🗺️</Text>
        <Text style={[appStyles.bigValue, { color: '#34D399', fontFamily: F.black, fontSize: 26 }]}>
          {venue.name}
        </Text>
        <Text style={[appStyles.unit, { color: '#34D399', fontSize: 14, marginTop: 4 }]}>
          {venue.city} · {venue.dist} from you
        </Text>
        <StatusChip label="INSIDE VENUE" color="#22C55E" />
      </View>

      {/* Fake compass grid */}
      <View style={appStyles.section}>
        <Text style={[appStyles.sectionTitle, { fontFamily: F.semiBold }]}>Venue Map</Text>
        <View style={appStyles.compassBox}>
          <Text style={appStyles.compassN}>N</Text>
          <View style={appStyles.compassRing}>
            <View style={appStyles.compassDot} />
          </View>
          <Text style={appStyles.compassS}>S</Text>
          <Text style={appStyles.compassW}>W</Text>
          <Text style={appStyles.compassE}>E</Text>
          <Text style={appStyles.venuePin}>📍</Text>
        </View>
      </View>

      <View style={appStyles.detailsCard}>
        {[
          { label: 'Nearest Exit',  value: 'Gate B — South Entrance' },
          { label: 'Section',       value: '114 · Row 12 · Seat 7' },
          { label: 'Concessions',   value: 'Section 110 & 120' },
        ].map(({ label, value }) => (
          <View key={label} style={appStyles.detailRow}>
            <Text style={appStyles.detailLabel}>{label}</Text>
            <Text style={appStyles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      <InfoRow text="GPS active · Location updated just now" />
    </ScrollView>
  );
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

function WalletApp() {
  const balance = 45.00;
  const txns = [
    { desc: 'Parking — Lot C',       amount: -25.00, time: '5:14 PM' },
    { desc: 'Concession Stand',       amount: -12.50, time: '6:31 PM' },
    { desc: 'BUZR Event Credit',      amount: +5.00,  time: '4:00 PM' },
  ];

  return (
    <ScrollView contentContainerStyle={appStyles.scroll}>
      <BetaBanner />

      <View style={appStyles.mainCard}>
        <Text style={appStyles.appIcon}>💳</Text>
        <Text style={[appStyles.bigValue, { color: '#F59E0B', fontFamily: F.black }]}>
          ${balance.toFixed(2)}
        </Text>
        <Text style={[appStyles.unit, { color: '#F59E0B', fontSize: 14, marginTop: 2 }]}>
          Event Wallet Balance
        </Text>
        <StatusChip label="ACTIVE" color="#22C55E" />
      </View>

      <View style={appStyles.section}>
        <Text style={[appStyles.sectionTitle, { fontFamily: F.semiBold }]}>Recent Transactions</Text>
        {txns.map((t) => (
          <View key={t.desc} style={appStyles.txnRow}>
            <View style={appStyles.txnInfo}>
              <Text style={appStyles.txnDesc}>{t.desc}</Text>
              <Text style={appStyles.txnTime}>{t.time}</Text>
            </View>
            <Text style={[appStyles.txnAmount, { color: t.amount < 0 ? '#F87171' : '#4ADE80' }]}>
              {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <InfoRow text="Wallet linked to your event ticket" />
    </ScrollView>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

const APP_MAP = {
  'Glucose Monitor': { component: GlucoseApp, icon: '🩸', color: '#22C55E' },
  'Heart Monitor':   { component: HeartApp,   icon: '❤️',  color: '#EF4444' },
  'Insulin':         { component: InsulinApp, icon: '💉',  color: '#818CF8' },
  'Maps':            { component: MapsApp,    icon: '🗺️',  color: '#34D399' },
  'Wallet':          { component: WalletApp,  icon: '💳',  color: '#F59E0B' },
};

export default function SimulatedAppScreen({ route }) {
  const appName = route?.params?.appName ?? 'Glucose Monitor';
  const entry   = APP_MAP[appName] ?? APP_MAP['Glucose Monitor'];
  const AppComponent = entry.component;

  return (
    <SafeAreaView style={appStyles.container}>
      {/* Screen header */}
      <View style={[appStyles.screenHeader, { borderBottomColor: entry.color + '33' }]}>
        <Text style={appStyles.screenHeaderIcon}>{entry.icon}</Text>
        <Text style={[appStyles.screenHeaderTitle, { fontFamily: F.black, color: entry.color }]}>
          {appName.toUpperCase()}
        </Text>
        <View style={[appStyles.liveChip, { backgroundColor: entry.color + '22', borderColor: entry.color + '55' }]}>
          <View style={[appStyles.liveDot, { backgroundColor: entry.color }]} />
          <Text style={[appStyles.liveText, { color: entry.color }]}>LIVE</Text>
        </View>
      </View>

      <AppComponent />
    </SafeAreaView>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const shared = StyleSheet.create({
  betaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1033',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4C1D95',
  },
  betaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A78BFA',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: { fontSize: 11, color: '#475569' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  chipText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});

// ─── App screen styles ────────────────────────────────────────────────────────

const appStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 16, paddingBottom: 40 },

  // Screen header
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    backgroundColor: '#0A0A0F',
  },
  screenHeaderIcon: { fontSize: 26 },
  screenHeaderTitle: { flex: 1, fontSize: 22, letterSpacing: 2 },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  // Main reading card
  mainCard: {
    backgroundColor: '#0F0F1A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  appIcon: { fontSize: 48, marginBottom: 8 },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 4,
  },
  bigValue: { fontSize: 72, lineHeight: 76 },
  readingMeta: { paddingBottom: 10 },
  unit: { fontSize: 16, fontWeight: '700', color: '#94A3B8' },
  trendArrow: { fontSize: 22, fontWeight: '900', marginTop: 2 },

  // Section card
  section: {
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 14,
    textTransform: 'uppercase',
  },

  // Bar chart (glucose)
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 90,
    marginBottom: 10,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 3 },
  barValLabel: { fontSize: 9, color: '#475569', marginBottom: 3 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rangeDot: { width: 8, height: 8, borderRadius: 4 },
  rangeText: { fontSize: 11, color: '#64748B' },

  // ECG strip (heart)
  ecgStrip: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 50,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  ecgSeg: { flex: 1, borderRadius: 2 },
  ecgNote: { fontSize: 10, color: '#475569', textAlign: 'center' },

  // Details card (shared)
  detailsCard: {
    backgroundColor: '#0F0F1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  detailLabel: { fontSize: 13, color: '#64748B' },
  detailValue: { fontSize: 13, color: '#F1F5F9', fontWeight: '600' },

  // Insulin log
  logRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#818CF8',
    marginTop: 4,
  },
  logContent: { flex: 1 },
  logTime: { fontSize: 12, color: '#64748B', marginBottom: 1 },
  logDose: { fontSize: 14, color: '#F1F5F9', fontWeight: '600' },
  logNote: { fontSize: 12, color: '#475569' },

  // Insulin next dose
  nextDoseCard: {
    backgroundColor: '#1A1200',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F59E0B33',
  },
  nextDoseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nextDoseTitle: { fontSize: 14, color: '#F59E0B', letterSpacing: 1, textTransform: 'uppercase' },
  nextDoseValue: { fontSize: 16, color: '#F1F5F9', fontWeight: '700', marginBottom: 2 },
  nextDoseType: { fontSize: 12, color: '#64748B' },

  // Maps compass
  compassBox: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#22C55E55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
  },
  compassN: { position: 'absolute', top: 0, color: '#EF4444', fontWeight: '800', fontSize: 14 },
  compassS: { position: 'absolute', bottom: 0, color: '#64748B', fontWeight: '700', fontSize: 13 },
  compassW: { position: 'absolute', left: 10, color: '#64748B', fontWeight: '700', fontSize: 13 },
  compassE: { position: 'absolute', right: 10, color: '#64748B', fontWeight: '700', fontSize: 13 },
  venuePin: { position: 'absolute', fontSize: 28, top: 50, left: '50%', marginLeft: -14 },

  // Wallet txns
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: 14, color: '#F1F5F9', fontWeight: '600' },
  txnTime: { fontSize: 11, color: '#475569', marginTop: 1 },
  txnAmount: { fontSize: 15, fontWeight: '800' },
});
