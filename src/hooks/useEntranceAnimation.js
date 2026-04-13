/**
 * useEntranceAnimation — Ticketmaster/SeatGeek-style screen entrance.
 *
 * Returns an Animated.Value for opacity and one for translateY.
 * Call `start()` to trigger the animation (typically in useEffect on mount).
 *
 * Usage:
 *   const { opacity, translateY, start } = useEntranceAnimation();
 *   useEffect(() => { start(); }, []);
 *   <Animated.View style={{ opacity, transform: [{ translateY }] }}>
 *     ...
 *   </Animated.View>
 *
 * You can also stagger multiple items by passing a `delay` (ms).
 */

import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * @param {object} [opts]
 * @param {number} [opts.delay=0]          - Delay before animation starts (ms)
 * @param {number} [opts.fromY=30]         - Starting Y offset (px)
 * @param {number} [opts.duration=420]     - Animation duration (ms)
 * @returns {{ opacity: Animated.Value, translateY: Animated.Value, start: () => void }}
 */
export default function useEntranceAnimation({ delay = 0, fromY = 30, duration = 420 } = {}) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  const start = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 14,
        bounciness: 4,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { opacity, translateY, start };
}
