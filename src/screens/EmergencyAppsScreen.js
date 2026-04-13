import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { F } from '../theme/fonts';

const PRESET_EMERGENCY_APPS = [
  { name: 'Glucose Monitor', icon: '🩸', category: 'Medical',      hasSimulation: true  },
  { name: 'Insulin',         icon: '💉', category: 'Medical',      hasSimulation: true  },
  { name: 'Heart Monitor',   icon: '❤️‍🩹', category: 'Medical',   hasSimulation: true  },
  { name: 'Maps',            icon: '🗺️', category: 'Safety',       hasSimulation: true  },
  { name: 'Wallet',          icon: '💳', category: 'Convenience',  hasSimulation: true  },
];

export default function EmergencyAppsScreen({ navigation }) {
  const { emergencyApps, updateEmergencyApps } = useAppContext();
  const [customApp, setCustomApp] = useState('');

  const toggleApp = (appName) => {
    const current = emergencyApps || [];
    if (current.includes(appName)) {
      updateEmergencyApps(current.filter((a) => a !== appName));
    } else {
      updateEmergencyApps([...current, appName]);
    }
  };

  const addCustomApp = () => {
    const trimmed = customApp.trim();
    if (!trimmed) return;
    const current = emergencyApps || [];
    if (current.includes(trimmed)) {
      Alert.alert('Already Added', `"${trimmed}" is already in your emergency apps list.`);
      return;
    }
    if (current.length >= 10) {
      Alert.alert('Limit Reached', 'You can add up to 10 emergency apps.');
      return;
    }
    updateEmergencyApps([...current, trimmed]);
    setCustomApp('');
  };

  const removeCustomApp = (appName) => {
    const isPreset = PRESET_EMERGENCY_APPS.some((a) => a.name === appName);
    if (isPreset) return;
    Alert.alert(
      'Remove App',
      `Remove "${appName}" from emergency apps?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => toggleApp(appName) },
      ]
    );
  };

  const customApps = (emergencyApps || []).filter(
    (a) => !PRESET_EMERGENCY_APPS.some((p) => p.name === a)
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Info banner */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🏥</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { fontFamily: F.black }]}>Emergency App Access</Text>
            <Text style={styles.infoBody}>
              Select apps that must remain accessible for medical or safety reasons.
              Tap <Text style={styles.betaLinkText}>View Beta Data</Text> on
              any enabled app to see simulated live readings.
            </Text>
          </View>
        </View>

        {/* Preset Apps */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: F.black }]}>
            Medical &amp; Safety Apps
          </Text>
          {PRESET_EMERGENCY_APPS.map((app) => {
            const isEnabled = (emergencyApps || []).includes(app.name);
            return (
              <View key={app.name} style={styles.appRow}>
                <Text style={styles.appIcon}>{app.icon}</Text>
                <View style={styles.appInfo}>
                  <Text style={[styles.appName, { fontFamily: F.semiBold }]}>{app.name}</Text>
                  <Text style={styles.appCategory}>{app.category}</Text>
                </View>

                {/* Beta simulation button — only when app is enabled */}
                {isEnabled && app.hasSimulation && (
                  <TouchableOpacity
                    style={styles.betaBtn}
                    onPress={() => navigation.navigate('SimulatedApp', { appName: app.name })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="pulse" size={12} color="#818CF8" />
                    <Text style={[styles.betaBtnText, { fontFamily: F.regular }]}>Beta</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => toggleApp(app.name)} activeOpacity={0.8}>
                  <View style={[styles.toggle, isEnabled && styles.toggleOn]}>
                    <View style={[styles.toggleThumb, isEnabled && styles.toggleThumbOn]} />
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Custom Apps */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: F.black }]}>Custom Emergency Apps</Text>
          <Text style={styles.sectionSubtitle}>
            Add any specific app by name. Our team will review your request.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="App name (e.g. MySugarApp)"
              placeholderTextColor="#475569"
              value={customApp}
              onChangeText={setCustomApp}
              onSubmitEditing={addCustomApp}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={addCustomApp}>
              <Text style={[styles.addButtonText, { fontFamily: F.semiBold }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {customApps.length === 0 ? (
            <Text style={styles.emptyCustomText}>No custom apps added yet.</Text>
          ) : (
            customApps.map((app) => (
              <TouchableOpacity
                key={app}
                style={styles.customAppRow}
                onLongPress={() => removeCustomApp(app)}
                activeOpacity={0.8}
              >
                <Text style={styles.customAppIcon}>📱</Text>
                <Text style={styles.customAppName}>{app}</Text>
                <TouchableOpacity onPress={() => removeCustomApp(app)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.legalNote}>
          <Text style={styles.legalNoteText}>
            ⚖️ Emergency app allowances are subject to review. All medical necessity requests will
            be approved. False submissions may result in account suspension.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 16, paddingBottom: 48 },
  infoBox: {
    backgroundColor: '#1E3A5F',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoIcon: { fontSize: 28 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 16, color: '#BFDBFE', marginBottom: 4, fontFamily: undefined },
  infoBody: { fontSize: 13, color: '#93C5FD', lineHeight: 19 },
  betaLinkText: { color: '#818CF8', fontWeight: '700' },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 14, lineHeight: 19 },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
    gap: 12,
  },
  appIcon: { fontSize: 24 },
  appInfo: { flex: 1 },
  appName: { fontSize: 15, color: '#F1F5F9' },
  appCategory: { fontSize: 12, color: '#64748B', marginTop: 1 },
  // Beta simulation button
  betaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E1033',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#818CF855',
    marginRight: 8,
  },
  betaBtnText: { fontSize: 11, color: '#818CF8' },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: '#6D28D9' },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#94A3B8',
  },
  toggleThumbOn: {
    backgroundColor: '#FFFFFF',
    marginLeft: 'auto',
  },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F1F5F9',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emptyCustomText: { color: '#475569', fontSize: 13, fontStyle: 'italic' },
  customAppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
    gap: 12,
  },
  customAppIcon: { fontSize: 22 },
  customAppName: { flex: 1, fontSize: 15, color: '#F1F5F9', fontWeight: '500' },
  removeText: { color: '#F87171', fontSize: 18, fontWeight: '700', padding: 4 },
  legalNote: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#475569',
  },
  legalNoteText: { fontSize: 12, color: '#64748B', lineHeight: 18 },
});
