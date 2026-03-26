import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';

/**
 * BuzrLogo – a vibrant "B" with an inline lightning-bolt accent.
 * Sizes: 'small' (48), 'medium' (80, default), 'large' (120).
 */
export default function BuzrLogo({ size = 'medium', showText = true }) {
  const dim = size === 'small' ? 48 : size === 'large' ? 120 : 80;
  const fontSize = size === 'small' ? 11 : size === 'large' ? 20 : 14;

  return (
    <View style={styles.wrapper} accessibilityLabel="BUZR logo">
      {/* Circular gradient badge */}
      <Svg width={dim} height={dim} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6C3FE8" />
            <Stop offset="100%" stopColor="#E83FA2" />
          </LinearGradient>
          <LinearGradient id="boltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFE500" />
            <Stop offset="100%" stopColor="#FF8C00" />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Path
          d="M50 3 a47 47 0 1 1 0 94 a47 47 0 1 1 0 -94"
          fill="url(#bgGrad)"
        />

        {/* Bold "B" letterform */}
        <Path
          d="M32 25 h18 c9 0 14 5 14 12 c0 5-3 8-7 10 c5 2 9 6 9 13
             c0 8-6 14-16 14 H32 Z
             M40 33 v12 h9 c4 0 7-2 7-6 c0-4-3-6-7-6 Z
             M40 53 v13 h10 c5 0 8-2 8-7 c0-4-3-6-9-6 Z"
          fill="white"
        />

        {/* Lightning bolt overlaid on the right side of the B */}
        <Polygon
          points="58,30 48,52 55,52 45,74 65,48 57,48"
          fill="url(#boltGrad)"
          opacity={0.92}
        />
      </Svg>

      {showText && (
        <Text style={[styles.wordmark, { fontSize }]}>BUZR</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  wordmark: {
    marginTop: 6,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#6C3FE8',
  },
});
