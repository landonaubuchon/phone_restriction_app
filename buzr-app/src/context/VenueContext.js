import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * VenueContext – shared state for active events and the lock mechanism.
 *
 * Simulated events are intentionally session-only: all event state is cleared
 * whenever the app returns to the foreground so that no event carries over
 * from a previous use.
 */
const VenueContext = createContext(null);

export function VenueProvider({ children }) {
  // Currently active venue event (null when no event running)
  const [activeEvent, setActiveEvent] = useState(null);

  // Whether the lock mode is currently engaged
  const [locked, setLocked] = useState(false);

  // Track previous AppState to detect background → active transitions
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      // Clear all event state whenever the app comes back to the foreground
      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        setActiveEvent(null);
        setLocked(false);
      }
    });
    return () => subscription.remove();
  }, []);

  /**
   * Start a venue event and engage the lock.
   * @param {object} event  – { id, name, latitude, longitude, radiusMeters }
   */
  const startEvent = useCallback((event) => {
    setActiveEvent(event);
    setLocked(true);
  }, []);

  /**
   * End the current venue event and release the lock.
   */
  const endEvent = useCallback(() => {
    setActiveEvent(null);
    setLocked(false);
  }, []);

  return (
    <VenueContext.Provider value={{ activeEvent, locked, startEvent, endEvent }}>
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  const ctx = useContext(VenueContext);
  if (!ctx) throw new Error('useVenue must be used inside <VenueProvider>');
  return ctx;
}
