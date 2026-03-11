import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { F } from '../theme/fonts';
import BUZRLogo from '../components/BUZRLogo';
import AnimatedPressCard from '../components/AnimatedPressCard';
import useEntranceAnimation from '../hooks/useEntranceAnimation';

export default function WelcomeScreen({ navigation }) {
  const { giveConsent } = useAppContext();

  // Staggered entrance animations — hero, features, buttons
  const hero     = useEntranceAnimation({ delay: 0,   fromY: 40, duration: 500 });
  const feats    = useEntranceAnimation({ delay: 180, fromY: 25, duration: 420 });
  const consent  = useEntranceAnimation({ delay: 320, fromY: 20, duration: 400 });
  const buttons  = useEntranceAnimation({ delay: 440, fromY: 18, duration: 380 });

  useEffect(() => {
    hero.start();
    feats.start();
    consent.start();
    buttons.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    { icon: 'lock-closed', color: '#EF4444', text: 'Locks non-essential apps inside venues' },
    { icon: 'call',        color: '#22C55E', text: 'Phone, Messages & Camera always available' },
    { icon: 'medkit',      color: '#F87171', text: 'Emergency app exceptions supported' },
    { icon: 'location',    color: '#818CF8', text: 'Unlocks automatically when you leave' },
    { icon: 'ticket',      color: '#F59E0B', text: 'Instant gate activation via ticket scan' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero — animated entrance ── */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: hero.opacity, transform: [{ translateY: hero.translateY }] },
          ]}
        >
          {/* Sport event emoji orbit */}
          <View style={styles.emojiOrbit}>
            <Text style={[styles.orbitEmoji, styles.orbitTL]}>🏀</Text>
            <Text style={[styles.orbitEmoji, styles.orbitTR]}>🎵</Text>
            <Text style={[styles.orbitEmoji, styles.orbitBL]}>🎭</Text>
            <Text style={[styles.orbitEmoji, styles.orbitBR]}>🏆</Text>
            {/* Center lock mark */}
            <View style={styles.centerMark}>
              <Ionicons name="lock-closed" size={32} color="#EF4444" />
            </View>
          </View>

          {/* Flashy BUZR logo — centered, with animated neon glow */}
          <BUZRLogo size={62} pulse style={styles.logoSpacing} />

          <Text style={styles.tagline}>The event phone-restriction platform</Text>

          {/* Live event genre strip */}
          <View style={styles.genreRow}>
            {['🎵 CONCERTS', '🏀 SPORTS', '🎬 MOVIES', '🎭 THEATER'].map((g) => (
              <View key={g} style={styles.genreChip}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── What BUZR Does ── */}
        <Animated.View
          style={[
            styles.section,
            { opacity: feats.opacity, transform: [{ translateY: feats.translateY }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontFamily: F.black }]}>WHAT BUZR DOES</Text>
          {features.map(({ icon, color, text }, idx) => (
            <AnimatedPressCard key={text} style={styles.featureRow} scaleTo={0.98}>
              <View style={[styles.featureIconCircle, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={20} color={color} />
              </View>
              <Text style={styles.featureText}>{text}</Text>
              <Ionicons name="chevron-forward" size={14} color="#2A2A3A" />
            </AnimatedPressCard>
          ))}
        </Animated.View>

        {/* ── Consent block ── */}
        <Animated.View
          style={[
            styles.consentBlock,
            { opacity: consent.opacity, transform: [{ translateY: consent.translateY }] },
          ]}
        >
          <Text style={[styles.consentTitle, { fontFamily: F.black }]}>YOUR CONSENT</Text>
          <Text style={styles.consentBody}>
            By tapping <Text style={styles.bold}>Accept &amp; Continue</Text>, you agree to let
            BUZR restrict non-essential apps while you're at a registered event. Emergency
            features (calls, texts) are always available, and you can add medical app exceptions.
          </Text>
        </Animated.View>

        {/* ── CTA Buttons ── */}
        <Animated.View
          style={[
            styles.buttonsWrap,
            { opacity: buttons.opacity, transform: [{ translateY: buttons.translateY }] },
          ]}
        >
          <AnimatedPressCard
            onPress={handleConsent}
            style={styles.agreeButton}
            scaleTo={0.96}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={[styles.agreeButtonText, { fontFamily: F.black }]}>
              ACCEPT &amp; CONTINUE
            </Text>
          </AnimatedPressCard>

          <TouchableOpacity style={styles.declineButton} onPress={handleDecline} activeOpacity={0.7}>
            <Text style={styles.declineButtonText}>Continue Without Restrictions</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 24, paddingBottom: 56 },

  // Hero
  hero: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  emojiOrbit: {
    width: 110,
    height: 110,
    position: 'relative',
    marginBottom: 20,
  },
  orbitEmoji: { position: 'absolute', fontSize: 22 },
  orbitTL: { top: 8,  left: 4 },
  orbitTR: { top: 8,  right: 4 },
  orbitBL: { bottom: 8, left: 4 },
  orbitBR: { bottom: 8, right: 4 },
  centerMark: {
    position: 'absolute',
    top: '50%', left: '50%',
    marginTop: -24, marginLeft: -24,
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: '#12001A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EF444444',
  },
  logoSpacing: { marginBottom: 14 },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  genreChip: {
    backgroundColor: '#12001A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#EF444422',
  },
  genreText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Features section
  section: {
    backgroundColor: '#0F0F1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  sectionTitle: {
    fontSize: 11,
    color: '#EF4444',
    marginBottom: 14,
    letterSpacing: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2A',
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, fontSize: 14, color: '#CBD5E1', lineHeight: 21 },

  // Consent block
  consentBlock: {
    backgroundColor: '#0F0F1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#EF444422',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  consentTitle: {
    fontSize: 11,
    color: '#EF4444',
    marginBottom: 10,
    letterSpacing: 3,
  },
  consentBody: { fontSize: 14, color: '#94A3B8', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#F1F5F9' },

  // Buttons
  buttonsWrap: { gap: 10 },
  agreeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 18,
    paddingVertical: 19,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 9,
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
