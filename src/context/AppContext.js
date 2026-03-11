import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  TICKET_ACTIVATED: 'ticket_activated', // { [eventId]: true }
  CUSTOM_EVENTS: 'custom_events',        // admin-created simulated events
};

export const CAMERA_LIMIT_SECONDS = 15 * 60; // 15 minutes per event

/** How often (ms) the restriction engine re-evaluates while the app is idle. */
const RESTRICTION_CHECK_INTERVAL_MS = 10_000;

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
  // Admin: custom simulated events created at runtime (persisted)
  const [customEvents, setCustomEvents] = useState([]);
  // Admin: GPS override — simulates the user being at a specific coordinate
  const [simulatedLocation, setSimulatedLocation] = useState(null);
  // Admin: restriction override — null=auto, true=force ON, false=force OFF
  const [restrictionOverride, setRestrictionOverride] = useState(null);
  // cameraUsage: { [eventId]: secondsUsed }
  const [cameraUsage, setCameraUsage] = useState({});
  // ticketActivated: { [eventId]: true } — set when user scans ticket at gate.
  // Once activated, restrictions trigger immediately without GPS proximity.
  const [ticketActivated, setTicketActivated] = useState({});
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

  // Merged event list: built-in sample events + admin-created custom events
  const events = useMemo(() => [...SAMPLE_EVENTS, ...customEvents], [customEvents]);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [consent, eApps, profile, regEvents, camUsage, ticketAct, custEvts] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CONSENT_GIVEN),
          AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_APPS),
          AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_EVENTS),
          AsyncStorage.getItem(STORAGE_KEYS.CAMERA_USAGE),
          AsyncStorage.getItem(STORAGE_KEYS.TICKET_ACTIVATED),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS),
        ]);
        if (consent === 'true') setConsentGiven(true);
        if (eApps) setEmergencyApps(JSON.parse(eApps));
        if (profile) setUserProfile(JSON.parse(profile));
        if (regEvents) setRegisteredEvents(JSON.parse(regEvents));
        if (camUsage) setCameraUsage(JSON.parse(camUsage));
        if (ticketAct) setTicketActivated(JSON.parse(ticketAct));
        if (custEvts) setCustomEvents(JSON.parse(custEvts));
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
      // Admin GPS override takes precedence over real device location
      const effectiveLoc = simulatedLocation ?? userLocation;
      const lat = effectiveLoc?.latitude ?? null;
      const lon = effectiveLoc?.longitude ?? null;

      // Collect ALL currently active events for registered IDs
      const active = registeredEvents
        .map((id) => events.find((e) => e.id === id))
        .filter(Boolean)
        .filter((event) => {
          const isTicketActivated = !!ticketActivated[event.id];
          return shouldRestrictionsBeActive(event, lat, lon, isTicketActivated);
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
      // Admin restriction override (force ON/OFF) takes precedence over auto-evaluation.
      // null = normal auto mode.
      setRestrictionActive(restrictionOverride !== null ? restrictionOverride : !!found);
      if (found) {
        setAllowedApps(getAllowedApps(found, emergencyApps));
      }
    };

    evaluate(); // run immediately on state change
    const tick = setInterval(evaluate, RESTRICTION_CHECK_INTERVAL_MS); // re-evaluate while idle
    return () => clearInterval(tick);
  }, [consentGiven, registeredEvents, events, userLocation, emergencyApps, ticketActivated, simulatedLocation, restrictionOverride]);

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

  /** Mark a ticket as activated (scanned at gate). Restrictions activate immediately. */
  const activateTicket = useCallback(async (eventId) => {
    setTicketActivated((prev) => {
      const updated = { ...prev, [eventId]: true };
      AsyncStorage.setItem(STORAGE_KEYS.TICKET_ACTIVATED, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  /** Deactivate a ticket (e.g. user exits venue for an emergency). */
  const deactivateTicket = useCallback(async (eventId) => {
    setTicketActivated((prev) => {
      const updated = { ...prev, [eventId]: false };
      AsyncStorage.setItem(STORAGE_KEYS.TICKET_ACTIVATED, JSON.stringify(updated)).catch(() => {});
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

  /** [Admin] Add a custom simulated event and persist it. */
  const addCustomEvent = useCallback((event) => {
    setCustomEvents((prev) => {
      const updated = [...prev, event];
      AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  /** [Admin] Remove a custom simulated event by ID. */
  const removeCustomEvent = useCallback((eventId) => {
    setCustomEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    // Also unregister and deactivate ticket for the removed event
    setRegisteredEvents((prev) => {
      const updated = prev.filter((id) => id !== eventId);
      AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_EVENTS, JSON.stringify(updated)).catch(() => {});
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
        customEvents,
        addCustomEvent,
        removeCustomEvent,
        activeEvent,
        restrictionActive,
        allowedApps,
        cameraUsage,
        updateCameraUsage,
        CAMERA_LIMIT_SECONDS,
        ticketActivated,
        activateTicket,
        deactivateTicket,
        notifications,
        addNotification,
        clearNotification,
        // Admin controls
        simulatedLocation,
        setSimulatedLocation,
        restrictionOverride,
        setRestrictionOverride,
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
