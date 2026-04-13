/**
 * Utility functions for event restriction logic.
 */

export const BUFFER_MINUTES = 30;

/**
 * Extra metres added to proximityRadiusMeters when comparing against Haversine
 * distance. Absorbs floating-point rounding at the exact boundary edge so a
 * user standing right at the radius limit is correctly included.
 */
export const PROXIMITY_TOLERANCE_METERS = 1;

/**
 * Returns true if the current time is within the event window
 * (including the 30-minute buffer after the event ends).
 */
export function isEventActive(event) {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const bufferedEnd = new Date(end.getTime() + BUFFER_MINUTES * 60 * 1000);
  return now >= start && now <= bufferedEnd;
}

/**
 * Returns true if the current time is within 30 minutes before the event starts
 * (pre-event proximity window).
 */
export function isEventUpcoming(event) {
  const now = new Date();
  const start = new Date(event.startTime);
  const thirtyMinBefore = new Date(start.getTime() - BUFFER_MINUTES * 60 * 1000);
  return now >= thirtyMinBefore && now < start;
}

/**
 * Returns the number of seconds remaining until the event starts.
 * Returns 0 if the event has already started.
 */
export function secondsUntilStart(event) {
  const now = new Date();
  const start = new Date(event.startTime);
  const diff = Math.max(0, Math.floor((start - now) / 1000));
  return diff;
}

/**
 * Returns the number of seconds remaining until the event ends
 * (including the 30-minute buffer).
 */
export function secondsUntilEnd(event) {
  const now = new Date();
  const end = new Date(event.endTime);
  const bufferedEnd = new Date(end.getTime() + BUFFER_MINUTES * 60 * 1000);
  const diff = Math.max(0, Math.floor((bufferedEnd - now) / 1000));
  return diff;
}

/**
 * Formats seconds into HH:MM:SS string.
 */
export function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Formats seconds into HH:MM string (hours and minutes only).
 * Used by the shot clock display.
 */
export function formatHoursMinutes(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculates the distance in meters between two lat/lon coordinates
 * using the Haversine formula.
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Returns true if the user's location is within the event's proximity radius.
 * A 1-metre tolerance is added to absorb Haversine floating-point rounding and
 * the minor approximation difference between the moveNorth helper and the
 * Haversine formula — so a user at the exact boundary edge is correctly included.
 */
export function isWithinProximity(userLat, userLon, event) {
  const distance = getDistanceMeters(userLat, userLon, event.latitude, event.longitude);
  return distance <= event.proximityRadiusMeters + PROXIMITY_TOLERANCE_METERS;
}

/**
 * Determines whether restrictions should be active for an event.
 *
 * Activation priority (first match wins):
 *  1. Ticket-activated: user scanned their ticket at the gate. The venue has
 *     confirmed they are inside, so GPS proximity is not required.
 *  2. GPS inside building radius: user is within the venue's tight
 *     building-footprint radius AND the event time window is open.
 *  3. Time-only fallback: GPS is unavailable (null). Applies restrictions
 *     for the duration of the time window as a conservative fallback.
 *
 * @param {object}  event           - Event data object
 * @param {number|null} userLat     - User latitude, or null if unavailable
 * @param {number|null} userLon     - User longitude, or null if unavailable
 * @param {boolean} [ticketActivated=false] - True when the user has scanned
 *   their ticket at the venue gate (confirmed inside).
 */
export function shouldRestrictionsBeActive(event, userLat, userLon, ticketActivated = false) {
  const timeActive = isEventActive(event) || isEventUpcoming(event);
  if (!timeActive) return false;

  // Ticket scan confirms the user is inside — no GPS check needed.
  if (ticketActivated) return true;

  // GPS-based proximity check.
  if (userLat == null || userLon == null) return timeActive; // fallback: time only
  return isWithinProximity(userLat, userLon, event);
}

/**
 * Returns the list of allowed apps for an event, merging base allowed apps
 * with user-configured emergency apps.
 */
export function getAllowedApps(event, emergencyApps = []) {
  const base = event.allowedApps || [];
  const merged = [...new Set([...base, ...emergencyApps])];
  return merged;
}

/**
 * Formats an ISO date string to a readable time (e.g. "7:30 PM").
 */
export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats an ISO date string to a readable date (e.g. "Mon, Feb 23").
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
