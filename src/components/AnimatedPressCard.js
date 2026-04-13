/**
 * AnimatedPressCard — Spring-scale press effect for interactive cards.
 *
 * Wraps any children in an Animated.View that scales down to 0.97 on press
 * and springs back to 1.0 on release. This is the "premium feel" pattern used
 * by Ticketmaster, SeatGeek, and Shopify storefronts.
 *
 * Usage:
 *   <AnimatedPressCard onPress={...} style={styles.card}>
 *     <Text>Card content</Text>
 *   </AnimatedPressCard>
 */

import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';

/**
 * @param {object} props
 * @param {Function}  [props.onPress]     - Tap handler
 * @param {object}    [props.style]       - Style for the Animated.View wrapper
 * @param {React.ReactNode} props.children
 * @param {number}    [props.scaleTo=0.97] - How far to compress on press
 * @param {boolean}   [props.disabled=false]
 */
export default function AnimatedPressCard({
  onPress,
  style,
  children,
  scaleTo = 0.97,
  disabled = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={disabled ? undefined : onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
