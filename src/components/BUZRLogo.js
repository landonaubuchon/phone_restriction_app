/**
 * BUZRLogo — Flashy animated neon logo component.
 *
 * Uses React Native's built-in Animated API (no extra deps):
 *  • Multi-layer textShadow stacking creates a "neon glow" effect
 *  • A slow Animated.loop pulses the outer glow intensity
 *  • Geometric accent brackets (View) frame the letters
 *
 * Inspired by sports-scoreboard lettering and premium event-app branding
 * (Ticketmaster, SeatGeek header logos).
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { F } from '../theme/fonts';

/**
 * @param {object} props
 * @param {number}  [props.size=56]      - Base font size
 * @param {boolean} [props.pulse=true]   - Whether to animate the outer glow
 * @param {string}  [props.color='#EF4444'] - Brand red (default)
 * @param {object}  [props.style]        - Outer container style override
 */
export default function BUZRLogo({ size = 56, pulse = true, color = '#EF4444', style }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulse) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulse]);

  // Outer glow radius interpolates 14 → 28 (soft breathe)
  const outerGlowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 28],
  });
  // Outer glow opacity interpolates 0.35 → 0.65
  const outerGlowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  const letterSpacing = size * 0.18;
  const bracketSize  = size * 0.55;
  const bracketThick = Math.max(2, size * 0.04);

  return (
    <View style={[styles.root, style]}>
      {/* ── Left geometric bracket ── */}
      <View style={[styles.bracket, styles.bracketLeft, {
        width: bracketSize * 0.45,
        height: bracketSize,
        borderTopWidth: bracketThick,
        borderLeftWidth: bracketThick,
        borderBottomWidth: bracketThick,
        borderColor: color,
        opacity: 0.55,
        marginRight: size * 0.08,
      }]} />

      {/* ── Letters ── */}
      <View style={styles.textWrap}>
        {/* Layer 1 — outermost animated glow */}
        <Animated.Text
          style={[
            styles.letter,
            {
              fontFamily: F.black,
              fontSize: size,
              letterSpacing,
              color,
              textShadowColor: color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: outerGlowRadius,
              opacity: outerGlowOpacity,
              position: 'absolute',
            },
          ]}
          accessibilityElementsHidden
        >
          BUZR
        </Animated.Text>

        {/* Layer 2 — mid glow (static) */}
        <Text
          style={[
            styles.letter,
            {
              fontFamily: F.black,
              fontSize: size,
              letterSpacing,
              color,
              textShadowColor: color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
              opacity: 0.55,
              position: 'absolute',
            },
          ]}
          accessibilityElementsHidden
        >
          BUZR
        </Text>

        {/* Layer 3 — crisp foreground text (accessible) */}
        <Text
          style={[
            styles.letter,
            {
              fontFamily: F.black,
              fontSize: size,
              letterSpacing,
              color: '#FFFFFF',
              textShadowColor: color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 3,
            },
          ]}
          accessibilityLabel="BUZR"
        >
          BUZR
        </Text>
      </View>

      {/* ── Right geometric bracket ── */}
      <View style={[styles.bracket, styles.bracketRight, {
        width: bracketSize * 0.45,
        height: bracketSize,
        borderTopWidth: bracketThick,
        borderRightWidth: bracketThick,
        borderBottomWidth: bracketThick,
        borderColor: color,
        opacity: 0.55,
        marginLeft: size * 0.08,
      }]} />

      {/* ── Underline accent bar ── */}
      <View style={[
        styles.underline,
        {
          backgroundColor: color,
          width: size * 2.4,
          height: bracketThick,
          marginTop: size * 0.06,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
          elevation: 6,
        },
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  bracket: {
    alignSelf: 'center',
  },
  bracketLeft: {
    borderRightWidth: 0,
    borderRadius: 2,
  },
  bracketRight: {
    borderLeftWidth: 0,
    borderRadius: 2,
  },
  textWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  underline: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: [{ translateX: -60 }],
  },
});
