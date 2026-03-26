import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import BuzrLogo from '../components/BuzrLogo';
import { useVenue } from '../context/VenueContext';

export default function HomeScreen({ navigation }) {
  const { activeEvent, locked } = useVenue();

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Centered logo banner ── */}
      <View style={styles.header}>
        <BuzrLogo size="large" showText />
      </View>

      {/* Active-event banner */}
      {activeEvent && (
        <View style={styles.eventBanner}>
          <Text style={styles.eventBannerText}>
            🔒 BUZR Lock active · {activeEvent.name}
          </Text>
        </View>
      )}

      {/* Main navigation tiles */}
      <View style={styles.tiles}>
        <Tile
          emoji="👥"
          label="Contacts"
          onPress={() => navigation.navigate('Contacts')}
        />
        <Tile
          emoji="💬"
          label="Messages"
          onPress={() => navigation.navigate('Messages')}
        />
        <Tile
          emoji="🗺️"
          label="Admin Map"
          onPress={() => navigation.navigate('AdminMap')}
        />
        <Tile
          emoji="🔒"
          label={locked ? 'App Locked' : 'Lock Status'}
          onPress={() => navigation.navigate('LockStatus')}
          highlight={locked}
        />
      </View>
    </SafeAreaView>
  );
}

function Tile({ emoji, label, onPress, highlight = false }) {
  return (
    <TouchableOpacity
      style={[styles.tile, highlight && styles.tileHighlight]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={[styles.tileLabel, highlight && styles.tileLabelHighlight]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const PURPLE = '#6C3FE8';
const PINK = '#E83FA2';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  eventBanner: {
    backgroundColor: PINK,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  eventBannerText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 13,
  },
  tiles: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
    justifyContent: 'center',
    alignContent: 'center',
  },
  tile: {
    width: '44%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tileHighlight: {
    backgroundColor: PURPLE,
  },
  tileEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  tileLabelHighlight: {
    color: '#fff',
  },
});
