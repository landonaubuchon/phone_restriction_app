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
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { F } from '../theme/fonts';

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

  const features = [
    { icon: 'lock-closed',     color: '#EF4444', text: 'Locks non-essential apps inside venues' },
    { icon: 'call',            color: '#22C55E', text: 'Keeps Phone, Messages & Camera available' },
    { icon: 'medkit',          color: '#F87171', text: 'Allows emergency app exceptions' },
    { icon: 'location',        color: '#818CF8', text: 'Unlocks automatically when you leave' },
    { icon: 'ticket',          color: '#F59E0B', text: 'Activates instantly on gate ticket scan' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          {/* Decorative sport emoji ring */}
          <View style={styles.emojiRing}>
            <Text style={[styles.ringEmoji, { top: 0, left: '50%', marginLeft: -12 }]}>🏀</Text>
            <Text style={[styles.ringEmoji, { top: 20, right: 10 }]}>🎵</Text>
            <Text style={[styles.ringEmoji, { top: 20, left: 10 }]}>🎬</Text>
            <Text style={[styles.ringEmoji, { bottom: 10, right: 20 }]}>🎭</Text>
            <Text style={[styles.ringEmoji, { bottom: 10, left: 20 }]}>🏆</Text>
            <View style={styles.lockCircle}>
              <Text style={styles.lockEmoji}>🔒</Text>
            </View>
          </View>

          <Text style={[styles.title, { fontFamily: F.black }]}>BUZR</Text>
          <Text style={styles.tagline}>The event phone-restriction platform</Text>
        </View>

        {/* ── What BUZR Does ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: F.black }]}>WHAT BUZR DOES</Text>
          {features.map(({ icon, color, text }) => (
            <View key={text} style={styles.featureRow}>
              <View style={[styles.featureIconCircle, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={18} color={color} />
              </View>
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        {/* ── Consent block ── */}
        <View style={styles.consentBlock}>
          <Text style={[styles.consentTitle, { fontFamily: F.black }]}>YOUR CONSENT</Text>
          <Text style={styles.consentBody}>
            By tapping <Text style={styles.bold}>Accept &amp; Continue</Text>, you agree to let
            BUZR restrict non-essential apps while you're at a registered event. Emergency
            features (calls, texts) are always available, and you can add medical app exceptions.
          </Text>
        </View>

        {/* ── CTA Buttons ── */}
        <TouchableOpacity style={styles.agreeButton} onPress={handleConsent} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={[styles.agreeButtonText, { fontFamily: F.black }]}>
            ACCEPT &amp; CONTINUE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.declineButton} onPress={handleDecline} activeOpacity={0.8}>
          <Text style={styles.declineButtonText}>Continue Without Restrictions</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 24, paddingBottom: 48 },

  // Hero
  hero: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  emojiRing: {
    width: 120,
    height: 120,
    position: 'relative',
    marginBottom: 16,
  },
  ringEmoji: { position: 'absolute', fontSize: 20 },
  lockCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EF444433',
  },
  lockEmoji: { fontSize: 26 },
  title: {
    fontSize: 56,
    color: '#EF4444',
    letterSpacing: 10,
    textShadowColor: '#EF4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Features section
  section: {
    backgroundColor: '#0F0F1A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 14,
    letterSpacing: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, fontSize: 14, color: '#CBD5E1', lineHeight: 21 },

  // Consent block
  consentBlock: {
    backgroundColor: '#0F0F1A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EF444422',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  consentTitle: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 10,
    letterSpacing: 3,
  },
  consentBody: { fontSize: 14, color: '#94A3B8', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#F1F5F9' },

  // Buttons
  agreeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  agreeButtonText: { color: '#FFFFFF', fontSize: 16, letterSpacing: 2 },
  declineButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  declineButtonText: { color: '#475569', fontSize: 14 },
});
