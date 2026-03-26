import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useVenue } from '../context/VenueContext';

const PURPLE = '#6C3FE8';
const PINK = '#E83FA2';

const DEFAULT_REGION = {
  latitude: 40.7505,    // Madison Square Garden, NYC
  longitude: -73.9934,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

/**
 * AdminMapScreen
 *
 * Allows the admin to:
 *  1. Long-press anywhere on the map to drop a venue pin.
 *  2. Adjust the proximity radius (metres) for the geofence.
 *  3. Set the camera animation duration (seconds) used when flying to the pin.
 *  4. Name the event and start it, which engages the BUZR lock.
 *  5. End the active event and release the lock.
 *  6. Re-fly the camera to the active pin at any time.
 */
export default function AdminMapScreen() {
  const { activeEvent, startEvent, endEvent } = useVenue();
  const mapRef = useRef(null);

  const [pendingPin, setPendingPin] = useState(null);          // { latitude, longitude }
  const [radiusMeters, setRadiusMeters] = useState(200);       // default 200 m
  const [cameraDuration, setCameraDuration] = useState(1.5);   // seconds (0.5 – 10)
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState('');

  // ── Animate the map camera to a coordinate ───────────────────────────────
  const flyToPin = useCallback(
    (coordinate, durationOverride) => {
      if (!mapRef.current || !coordinate) return;
      const ms = Math.round((durationOverride ?? cameraDuration) * 1000);
      mapRef.current.animateCamera(
        {
          center: coordinate,
          zoom: 16,
          altitude: 500,
          pitch: 45,
          heading: 0,
        },
        { duration: ms },
      );
    },
    [cameraDuration],
  );

  // ── Drop pin on long-press ───────────────────────────────────────────────
  const handleMapLongPress = useCallback(
    (e) => {
      if (activeEvent) {
        Alert.alert('Event Active', 'End the current event before placing a new pin.');
        return;
      }
      const { coordinate } = e.nativeEvent;
      setPendingPin(coordinate);
      // Fly camera to the new pin immediately
      flyToPin(coordinate);
    },
    [activeEvent, flyToPin],
  );

  // ── Open the "start event" modal ─────────────────────────────────────────
  const promptStartEvent = useCallback(() => {
    if (!pendingPin) {
      Alert.alert('No Pin', 'Long-press on the map to place a venue pin first.');
      return;
    }
    setEventName('');
    setShowModal(true);
  }, [pendingPin]);

  // ── Confirm & start event ─────────────────────────────────────────────────
  const confirmStart = useCallback(() => {
    const name = eventName.trim() || 'Venue Event';
    startEvent({
      id: String(Date.now()),
      name,
      latitude: pendingPin.latitude,
      longitude: pendingPin.longitude,
      radiusMeters,
    });
    setShowModal(false);
    // Fly camera to event pin with the configured animation duration
    flyToPin(pendingPin);
  }, [eventName, pendingPin, radiusMeters, startEvent, flyToPin]);

  // ── End active event ──────────────────────────────────────────────────────
  const handleEndEvent = useCallback(() => {
    Alert.alert(
      'End Event',
      `End "${activeEvent?.name}" and release the BUZR lock?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Event',
          style: 'destructive',
          onPress: () => {
            endEvent();
            setPendingPin(null);
          },
        },
      ],
    );
  }, [activeEvent, endEvent]);

  const displayPin = activeEvent
    ? { latitude: activeEvent.latitude, longitude: activeEvent.longitude }
    : pendingPin;

  const displayRadius = activeEvent ? activeEvent.radiusMeters : radiusMeters;

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Admin Map</Text>
      <Text style={styles.hint}>Long-press on the map to place a venue pin.</Text>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        onLongPress={handleMapLongPress}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton
      >
        {displayPin && (
          <>
            <Marker
              coordinate={displayPin}
              title={activeEvent?.name ?? 'Pending venue'}
              description={`Radius: ${displayRadius} m`}
              pinColor={activeEvent ? PINK : PURPLE}
            />
            <Circle
              center={displayPin}
              radius={displayRadius}
              strokeColor={activeEvent ? PINK : PURPLE}
              strokeWidth={2}
              fillColor={activeEvent ? 'rgba(232,63,162,0.15)' : 'rgba(108,63,232,0.15)'}
            />
          </>
        )}
      </MapView>

      {/* Controls panel */}
      <View style={styles.panel}>
        {/* Camera animation duration (always visible) */}
        <View style={styles.radiusRow}>
          <Text style={styles.radiusLabel}>
            Camera speed: {cameraDuration.toFixed(1)} s
          </Text>
          <View style={styles.radiusBtns}>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setCameraDuration((d) => Math.max(0.5, parseFloat((d - 0.5).toFixed(1))))}
            >
              <Text style={styles.radiusBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radiusBtn}
              onPress={() => setCameraDuration((d) => Math.min(10, parseFloat((d + 0.5).toFixed(1))))}
            >
              <Text style={styles.radiusBtnText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Radius slider simulation via ＋/－ buttons */}
        {!activeEvent && (
          <View style={styles.radiusRow}>
            <Text style={styles.radiusLabel}>Proximity radius: {radiusMeters} m</Text>
            <View style={styles.radiusBtns}>
              <TouchableOpacity
                style={styles.radiusBtn}
                onPress={() => setRadiusMeters((r) => Math.max(50, r - 50))}
              >
                <Text style={styles.radiusBtnText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radiusBtn}
                onPress={() => setRadiusMeters((r) => Math.min(5000, r + 50))}
              >
                <Text style={styles.radiusBtnText}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeEvent ? (
          <View style={styles.activeRow}>
            <Text style={styles.activeLabel}>🔒 {activeEvent.name}</Text>
            <TouchableOpacity
              style={styles.flyBtn}
              onPress={() => flyToPin({ latitude: activeEvent.latitude, longitude: activeEvent.longitude })}
            >
              <Text style={styles.flyBtnText}>📍 Fly</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endBtn} onPress={handleEndEvent}>
              <Text style={styles.endBtnText}>End Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.startBtn, !pendingPin && styles.startBtnDisabled]}
            onPress={promptStartEvent}
            disabled={!pendingPin}
          >
            <Text style={styles.startBtnText}>Start Event at Pin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Start Event Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Venue Event</Text>

            <Text style={styles.modalLabel}>Event name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. MSG Concert – Section A"
              value={eventName}
              onChangeText={setEventName}
              autoFocus
            />

            <Text style={styles.modalLabel}>
              Location: {pendingPin?.latitude.toFixed(5)}, {pendingPin?.longitude.toFixed(5)}
            </Text>
            <Text style={styles.modalLabel}>Radius: {radiusMeters} m</Text>
            <Text style={styles.modalLabel}>Camera flyover: {cameraDuration.toFixed(1)} s</Text>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmStart}>
                <Text style={styles.modalConfirmText}>Start & Lock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PURPLE,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 2,
  },
  hint: { fontSize: 13, color: '#888', marginHorizontal: 20, marginBottom: 8 },
  map: { flex: 1 },
  panel: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDE9FE',
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  radiusLabel: { fontSize: 14, color: '#555', fontWeight: '600' },
  radiusBtns: { flexDirection: 'row', gap: 8 },
  radiusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusBtnText: { fontSize: 20, color: PURPLE, fontWeight: '700', lineHeight: 24 },
  startBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startBtnDisabled: { backgroundColor: '#C4B5FD' },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  activeLabel: { fontSize: 15, fontWeight: '700', color: PINK, flex: 1 },
  flyBtn: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  flyBtnText: { color: PURPLE, fontWeight: '700', fontSize: 14 },
  endBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  endBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 14 },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: PURPLE, marginBottom: 16 },
  modalLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  modalInput: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCancelText: { fontWeight: '700', color: '#555' },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalConfirmText: { fontWeight: '700', color: '#fff' },
});
