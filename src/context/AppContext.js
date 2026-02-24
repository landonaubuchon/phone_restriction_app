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
  CAMERA_USAGE: 'camera_usage',
};

export const CAMERA_LIMIT_SECONDS = 15 * 60; // 15 minutes per event

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
  // cameraUsage: { [eventId]: secondsUsed }
  const [cameraUsage, setCameraUsage] = useState({});
  // notifications: per-tab alert counts/flags.
  // Initial values are seeded with demo data so the notification system is
  // visible on first launch. In production these would start at 0/false and
  // be incremented by real push-notification or event callbacks.
  const [notifications, setNotifications] = useState({
    phone: 2,      // 2 missed calls (demo)
    messages: 3,   // 3 unread messages (demo)
    ticket: true,  // ticket alert, e.g. gate change (demo)
    camera: false,
  });

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [consent, eApps, profile, regEvents, camUsage] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CONSENT_GIVEN),
          AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_APPS),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_EVENTS),
          AsyncStorage.getItem(STORAGE_KEYS.CAMERA_USAGE),
        ]);
        if (consent === 'true') setConsentGiven(true);
        if (eApps) setEmergencyApps(JSON.parse(eApps));
        if (profile) setUserProfile(JSON.parse(profile));
        if (regEvents) setRegisteredEvents(JSON.parse(regEvents));
        if (camUsage) setCameraUsage(JSON.parse(camUsage));
      } catch (e) {
        // Ignore storage errors
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Evaluate active restrictions whenever relevant state changes,
  // AND on a 10-second tick so restrictions activate/deactivate when events
  // start or end while the app is idle (without any user-triggered state change).
  useEffect(() => {
    const evaluate = () => {
      if (!consentGiven) {
        setRestrictionActive(false);
        setActiveEvent(null);
        return;
      }
      // Collect ALL currently active events for registered IDs
      const active = registeredEvents
        .map((id) => events.find((e) => e.id === id))
        .filter(Boolean)
        .filter((event) => {
          const lat = userLocation?.latitude ?? null;
          const lon = userLocation?.longitude ?? null;
          return shouldRestrictionsBeActive(event, lat, lon);
        });

      // Pick the most-recently-started event so the venue the user is
      // currently AT takes precedence over an older registration.
      // This also prevents registration order from changing the allowed-app list.
      let found = null;
      if (active.length > 0) {
        found = active.reduce((latest, ev) =>
          new Date(ev.startTime) > new Date(latest.startTime) ? ev : latest
        );
      }

      setActiveEvent(found);
      setRestrictionActive(!!found);
      if (found) {
        setAllowedApps(getAllowedApps(found, emergencyApps));
      }
    };

    evaluate(); // run immediately on state change
    const tick = setInterval(evaluate, 10_000); // re-evaluate every 10 s while idle
    return () => clearInterval(tick);
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

  const updateCameraUsage = useCallback(async (eventId, additionalSeconds) => {
    setCameraUsage((prev) => {
      const current = prev[eventId] ?? 0;
      const updated = { ...prev, [eventId]: current + additionalSeconds };
      // Persist outside the setState callback to avoid potential race conditions
      AsyncStorage.setItem(STORAGE_KEYS.CAMERA_USAGE, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  /** Increment or set a notification for a given tab category. */
  const addNotification = useCallback((type) => {
    setNotifications((prev) => {
      if (type === 'phone') return { ...prev, phone: prev.phone + 1 };
      if (type === 'messages') return { ...prev, messages: prev.messages + 1 };
      if (type === 'ticket') return { ...prev, ticket: true };
      if (type === 'camera') return { ...prev, camera: true };
      return prev;
    });
  }, []);

  /** Clear the notification for a given tab category. */
  const clearNotification = useCallback((type) => {
    setNotifications((prev) => {
      if (type === 'phone') return { ...prev, phone: 0 };
      if (type === 'messages') return { ...prev, messages: 0 };
      if (type === 'ticket') return { ...prev, ticket: false };
      if (type === 'camera') return { ...prev, camera: false };
      return prev;
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
        cameraUsage,
        updateCameraUsage,
        CAMERA_LIMIT_SECONDS,
        notifications,
        addNotification,
        clearNotification,
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
