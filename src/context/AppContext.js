import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAMPLE_EVENTS } from '../data/sampleEvents';
import { shouldRestrictionsBeActive, getAllowedApps } from '../utils/restrictionUtils';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  CONSENT_GIVEN: 'consent_given',
  EMERGENCY_APPS: 'emergency_apps',
  USER_PROFILE: 'user_profile',
  REGISTERED_EVENTS: 'registered_events',
};

export function AppProvider({ children }) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude }
  const [emergencyApps, setEmergencyApps] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [restrictionActive, setRestrictionActive] = useState(false);
  const [allowedApps, setAllowedApps] = useState([]);
  const [events] = useState(SAMPLE_EVENTS);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [consent, eApps, profile, regEvents] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CONSENT_GIVEN),
          AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_APPS),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_EVENTS),
        ]);
        if (consent === 'true') setConsentGiven(true);
        if (eApps) setEmergencyApps(JSON.parse(eApps));
        if (profile) setUserProfile(JSON.parse(profile));
        if (regEvents) setRegisteredEvents(JSON.parse(regEvents));
      } catch (e) {
        // Ignore storage errors
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Evaluate active restrictions whenever relevant state changes
  useEffect(() => {
    if (!consentGiven) {
      setRestrictionActive(false);
      setActiveEvent(null);
      return;
    }
    let found = null;
    for (const event of registeredEvents.map((id) => events.find((e) => e.id === id)).filter(Boolean)) {
      const lat = userLocation?.latitude ?? null;
      const lon = userLocation?.longitude ?? null;
      if (shouldRestrictionsBeActive(event, lat, lon)) {
        found = event;
        break;
      }
    }
    setActiveEvent(found);
    setRestrictionActive(!!found);
    if (found) {
      setAllowedApps(getAllowedApps(found, emergencyApps));
    }
  }, [consentGiven, registeredEvents, events, userLocation, emergencyApps]);

  const giveConsent = useCallback(async () => {
    setConsentGiven(true);
    await AsyncStorage.setItem(STORAGE_KEYS.CONSENT_GIVEN, 'true');
  }, []);

  const revokeConsent = useCallback(async () => {
    setConsentGiven(false);
    await AsyncStorage.setItem(STORAGE_KEYS.CONSENT_GIVEN, 'false');
  }, []);

  const updateEmergencyApps = useCallback(async (apps) => {
    setEmergencyApps(apps);
    await AsyncStorage.setItem(STORAGE_KEYS.EMERGENCY_APPS, JSON.stringify(apps));
  }, []);

  const updateUserProfile = useCallback(async (profile) => {
    setUserProfile(profile);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }, []);

  const registerForEvent = useCallback(async (eventId) => {
    setRegisteredEvents((prev) => {
      if (prev.includes(eventId)) return prev;
      const updated = [...prev, eventId];
      AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_EVENTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unregisterFromEvent = useCallback(async (eventId) => {
    setRegisteredEvents((prev) => {
      const updated = prev.filter((id) => id !== eventId);
      AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_EVENTS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        loading,
        consentGiven,
        giveConsent,
        revokeConsent,
        userLocation,
        setUserLocation,
        emergencyApps,
        updateEmergencyApps,
        userProfile,
        updateUserProfile,
        registeredEvents,
        registerForEvent,
        unregisterFromEvent,
        events,
        activeEvent,
        restrictionActive,
        allowedApps,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
