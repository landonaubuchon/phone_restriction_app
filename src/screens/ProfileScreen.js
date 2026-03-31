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
import { useAppContext } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const {
    consentGiven,
    giveConsent,
    revokeConsent,
    userProfile,
    updateUserProfile,
    emergencyApps,
    registeredEvents,
    events,
  } = useAppContext();

  const [editMode, setEditMode] = useState(false);
  const [draftName, setDraftName] = useState(userProfile.name);
  const [draftEmail, setDraftEmail] = useState(userProfile.email);

  const handleSaveProfile = async () => {
    if (!draftName.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    await updateUserProfile({ name: draftName.trim(), email: draftEmail.trim() });
    setEditMode(false);
    Alert.alert('Saved', 'Profile updated successfully.');
  };

  const handleToggleConsent = () => {
    if (consentGiven) {
      Alert.alert(
        'Revoke Consent',
        'Revoking consent will disable phone restrictions at events. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Revoke', style: 'destructive', onPress: revokeConsent },
        ]
      );
    } else {
      Alert.alert(
        'Enable BUZR',
        'By enabling BUZR, you consent to phone restrictions at registered events.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: giveConsent },
        ]
      );
    }
  };

  const myEvents = registeredEvents
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.name ? userProfile.name[0].toUpperCase() : '?'}
            </Text>
          </View>
          {!editMode ? (
            <>
              <Text style={styles.profileName}>{userProfile.name || 'Set your name'}</Text>
              <Text style={styles.profileEmail}>{userProfile.email || 'No email set'}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Full name"
                placeholderTextColor="#475569"
              />
              <TextInput
                style={styles.input}
                value={draftEmail}
                onChangeText={setDraftEmail}
                placeholder="Email address"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setDraftName(userProfile.name);
                    setDraftEmail(userProfile.email);
                    setEditMode(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* BUZR Consent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BUZR Status</Text>
          <View style={styles.consentRow}>
            <View>
              <Text style={styles.consentLabel}>Restrictions Consent</Text>
              <Text style={styles.consentStatus}>
                {consentGiven ? '✅ Enabled' : '❌ Disabled'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.consentToggle, consentGiven && styles.consentToggleActive]}
              onPress={handleToggleConsent}
            >
              <Text style={styles.consentToggleText}>
                {consentGiven ? 'Revoke' : 'Enable'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.consentNote}>
            {consentGiven
              ? 'Phone restrictions are active for registered events.'
              : 'Enable to allow BUZR to manage phone access at events.'}
          </Text>
        </View>

        {/* Initiatives */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.initiativesRow}
            onPress={() => navigation.navigate('Initiatives')}
            activeOpacity={0.75}
          >
            <View style={styles.initiativesLeft}>
              <Text style={styles.initiativesIcon}>🏆</Text>
              <View>
                <Text style={styles.initiativesTitle}>My Initiatives</Text>
                <Text style={styles.initiativesSub}>Rewards for using BUZR Focus Mode</Text>
              </View>
            </View>
            <Text style={styles.eventRowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Apps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Apps</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmergencyApps')}>
              <Text style={styles.manageLink}>Manage →</Text>
            </TouchableOpacity>
          </View>
          {(emergencyApps || []).length === 0 ? (
            <Text style={styles.emptyText}>No emergency apps configured.</Text>
          ) : (
            (emergencyApps || []).map((app, i) => (
              <View key={i} style={styles.tagRow}>
                <Text style={styles.tag}>📱 {app}</Text>
              </View>
            ))
          )}
        </View>

        {/* Registered Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Events ({myEvents.length})</Text>
          {myEvents.length === 0 ? (
            <Text style={styles.emptyText}>No events registered yet.</Text>
          ) : (
            myEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventRow}
                onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
              >
                <View>
                  <Text style={styles.eventRowName}>{event.name}</Text>
                  <Text style={styles.eventRowVenue}>{event.venue}</Text>
                </View>
                <Text style={styles.eventRowArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* About */}
        <View style={[styles.section, styles.aboutSection]}>
          <Text style={styles.sectionTitle}>About BUZR</Text>
          <Text style={styles.aboutText}>Version 1.0.0</Text>
          <Text style={styles.aboutBody}>
            BUZR helps venues and ticketing services create better live experiences by
            temporarily restricting non-essential phone functions. Emergency features are always
            available.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { padding: 16, paddingBottom: 48 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  profileName: { fontSize: 22, fontWeight: '700', color: '#F1F5F9', marginBottom: 2 },
  profileEmail: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6D28D9',
  },
  editButtonText: { color: '#A78BFA', fontWeight: '600', fontSize: 14 },
  editForm: { width: '100%', gap: 10, marginTop: 8 },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F1F5F9',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  editActions: { flexDirection: 'row', gap: 10 },
  saveButton: {
    flex: 1,
    backgroundColor: '#6D28D9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700' },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#94A3B8' },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginBottom: 12 },
  manageLink: { color: '#818CF8', fontSize: 13, fontWeight: '600' },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  consentLabel: { fontSize: 14, color: '#CBD5E1', marginBottom: 2 },
  consentStatus: { fontSize: 13, color: '#94A3B8' },
  consentToggle: {
    marginLeft: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#6D28D9',
  },
  consentToggleActive: { backgroundColor: '#DC2626' },
  consentToggleText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  consentNote: { fontSize: 12, color: '#475569', lineHeight: 18 },
  emptyText: { fontSize: 13, color: '#475569', fontStyle: 'italic' },
  tagRow: { marginBottom: 6 },
  tag: {
    backgroundColor: '#0F172A',
    color: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  eventRowName: { fontSize: 14, fontWeight: '600', color: '#F1F5F9' },
  eventRowVenue: { fontSize: 12, color: '#64748B', marginTop: 1 },
  eventRowArrow: { marginLeft: 'auto', color: '#64748B', fontSize: 22 },
  aboutSection: { backgroundColor: '#1E293B' },
  aboutText: { fontSize: 12, color: '#64748B', marginBottom: 6, marginTop: -8 },
  aboutBody: { fontSize: 13, color: '#94A3B8', lineHeight: 19 },
  initiativesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initiativesLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  initiativesIcon: { fontSize: 28 },
  initiativesTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginBottom: 2 },
  initiativesSub: { fontSize: 12, color: '#64748B' },
});
