import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * VenueContext – shared state for active events and the lock mechanism.
 */
const VenueContext = createContext(null);

export function VenueProvider({ children }) {
  // Currently active venue event (null when no event running)
  const [activeEvent, setActiveEvent] = useState(null);

  // Whether the lock mode is currently engaged
  const [locked, setLocked] = useState(false);

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
