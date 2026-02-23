import React from 'react';
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

export default function WelcomeScreen({ navigation }) {
  const { giveConsent } = useAppContext();

  const handleConsent = async () => {
    await giveConsent();
    navigation.replace('Home');
  };

  const handleDecline = () => {
    Alert.alert(
      'Restrictions Disabled',
      'You can still browse events and register, but phone restrictions will not be enforced without consent.',
      [{ text: 'OK', onPress: () => navigation.replace('Home') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📵</Text>
          <Text style={styles.title}>VenueLock</Text>
          <Text style={styles.subtitle}>Be present. Experience more.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is VenueLock?</Text>
          <Text style={styles.body}>
            VenueLock partners with ticketing services and venues to automatically restrict
            non-essential phone functions during live events — concerts, sporting events, movies,
            and more — so you and everyone around you can be fully present.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          {[
            {
              icon: '🎟️',
              text: 'Register your ticket and link it to an event.',
            },
            {
              icon: '📍',
              text: 'When you arrive at the venue, the app detects your proximity and activates restrictions.',
            },
            {
              icon: '⏱️',
              text: 'Restrictions are also time-based — activating 30 minutes before the event and lasting 30 minutes after it ends.',
            },
            {
              icon: '📞',
              text: 'Phone calls, messages, and camera (with time limits) remain available at all times.',
            },
            {
              icon: '🏥',
              text: 'Register emergency apps (e.g. glucose monitor) to keep them accessible regardless.',
            },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Consent</Text>
          <Text style={styles.body}>
            By tapping <Text style={styles.bold}>I Agree</Text>, you consent to VenueLock
            restricting non-essential phone functions while you are at a registered event.
            You may revoke consent at any time in your profile settings.
          </Text>
          <Text style={styles.legalNote}>
            Emergency features (calls, texts) are always available. You can register medical or
            safety-critical apps to keep them unrestricted.
          </Text>
        </View>

        <TouchableOpacity style={styles.agreeButton} onPress={handleConsent}>
          <Text style={styles.agreeButtonText}>I Agree – Enable VenueLock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
          <Text style={styles.declineButtonText}>Continue Without Restrictions</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 24, paddingBottom: 48 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 36, fontWeight: '800', color: '#F1F5F9', letterSpacing: 1 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 12,
  },
  body: { fontSize: 15, color: '#CBD5E1', lineHeight: 22 },
  featureRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  featureIcon: { fontSize: 22, marginRight: 12, marginTop: 1 },
  featureText: { flex: 1, fontSize: 14, color: '#CBD5E1', lineHeight: 21 },
  legalNote: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  bold: { fontWeight: '700', color: '#F1F5F9' },
  agreeButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  agreeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  declineButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  declineButtonText: { color: '#94A3B8', fontSize: 15 },
});
