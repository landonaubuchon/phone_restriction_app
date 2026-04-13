import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useEntranceAnimation from '../hooks/useEntranceAnimation';
import AnimatedPressCard from '../components/AnimatedPressCard';

const SAMPLE_THREADS = [
  {
    id: '1',
    name: 'Mom',
    lastMessage: 'Have a great time at the show! 🎉',
    time: '6:12 PM',
    unread: 1,
  },
  {
    id: '2',
    name: 'Jake',
    lastMessage: 'Meet at the gate in 10 mins',
    time: '5:58 PM',
    unread: 0,
  },
  {
    id: '3',
    name: 'Event Staff',
    lastMessage: 'Your section is Row C, Seats 14-15.',
    time: '4:30 PM',
    unread: 0,
  },
];

const PINNED_CONTACTS = [
  { id: 'p1', name: 'Sarah K.', initials: 'SK', role: 'Event buddy', phone: '', color: '#EF4444' },
  { id: 'p2', name: 'Venue Staff', initials: 'VS', role: 'Row C · Seats 14-15', phone: '', color: '#F59E0B' },
  { id: 'p3', name: 'Emergency', initials: '🚨', role: '911 — always available', phone: '911', color: '#22C55E' },
];

function ThreadItem({ thread, onPress }) {
  return (
    <TouchableOpacity style={styles.thread} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.threadAvatar}>
        <Text style={styles.threadAvatarText}>{thread.name[0]}</Text>
      </View>
      <View style={styles.threadContent}>
        <View style={styles.threadHeader}>
          <Text style={styles.threadName}>{thread.name}</Text>
          <Text style={styles.threadTime}>{thread.time}</Text>
        </View>
        <Text style={styles.threadPreview} numberOfLines={1}>
          {thread.lastMessage}
        </Text>
      </View>
      {thread.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{thread.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const [newNumber, setNewNumber] = useState('');

  // Entrance animation
  const headerAnim  = useEntranceAnimation({ delay: 0,   fromY: -16, duration: 360 });
  const inputAnim   = useEntranceAnimation({ delay: 100, fromY: 16,  duration: 360 });
  const listAnim    = useEntranceAnimation({ delay: 200, fromY: 20,  duration: 400 });
  const bottomAnim  = useEntranceAnimation({ delay: 300, fromY: 16,  duration: 360 });

  useEffect(() => {
    headerAnim.start();
    inputAnim.start();
    listAnim.start();
    bottomAnim.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSMS = async (to = '') => {
    const url = `sms:${to}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Unable to Open Messages',
        'Your device does not support opening the Messages app from here.'
      );
    }
  };

  const handleNewMessage = async () => {
    const number = newNumber.replace(/[^0-9+]/g, '');
    if (!number) {
      Alert.alert('No Number', 'Enter a phone number to start a new message.');
      return;
    }
    await openSMS(number);
    setNewNumber('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header — slide down */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerAnim.opacity, transform: [{ translateY: headerAnim.translateY }] },
          ]}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#3B82F6" />
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.newMsgButton}
            onPress={() => openSMS('')}
            accessibilityLabel="New message"
          >
            <Ionicons name="create-outline" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </Animated.View>

        {/* New Message Row — slide up */}
        <Animated.View
          style={[
            styles.newMessageBar,
            { opacity: inputAnim.opacity, transform: [{ translateY: inputAnim.translateY }] },
          ]}
        >
          <TextInput
            style={styles.numberInput}
            placeholder="Phone number or name"
            placeholderTextColor="#475569"
            value={newNumber}
            onChangeText={setNewNumber}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleNewMessage}
          />
          <TouchableOpacity
            style={styles.sendNewButton}
            onPress={handleNewMessage}
            accessibilityLabel="Open new message"
          >
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Thread List — slide up staggered */}
        <Animated.View
          style={{ flex: 1, opacity: listAnim.opacity, transform: [{ translateY: listAnim.translateY }] }}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          <Text style={styles.sectionLabel}>Recent</Text>
          {SAMPLE_THREADS.map((thread) => (
            <AnimatedPressCard
              key={thread.id}
              style={styles.thread}
              onPress={() => openSMS('')}
              scaleTo={0.98}
            >
              <View style={styles.threadAvatar}>
                <Text style={styles.threadAvatarText}>{thread.name[0]}</Text>
              </View>
              <View style={styles.threadContent}>
                <View style={styles.threadHeader}>
                  <Text style={styles.threadName}>{thread.name}</Text>
                  <Text style={styles.threadTime}>{thread.time}</Text>
                </View>
                <Text style={styles.threadPreview} numberOfLines={1}>
                  {thread.lastMessage}
                </Text>
              </View>
              {thread.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{thread.unread}</Text>
                </View>
              )}
            </AnimatedPressCard>
          ))}

          {/* Divider + pinned contacts section — fills blank space */}
          <Text style={styles.sectionLabel}>Pinned Contacts</Text>
          {PINNED_CONTACTS.map((c) => (
            <AnimatedPressCard
              key={c.id}
              style={styles.pinnedRow}
              onPress={() => openSMS(c.phone)}
              scaleTo={0.97}
            >
              <View style={[styles.pinnedAvatar, { backgroundColor: c.color + '33' }]}>
                <Text style={[styles.pinnedAvatarText, { color: c.color }]}>{c.initials}</Text>
              </View>
              <View style={styles.threadContent}>
                <Text style={styles.threadName}>{c.name}</Text>
                <Text style={styles.threadPreview}>{c.role}</Text>
              </View>
              <Ionicons name="call-outline" size={18} color="#3F3F5A" />
            </AnimatedPressCard>
          ))}
          </ScrollView>
        </Animated.View>

        {/* Footer note — fade in last */}
        <Animated.Text
          style={[
            styles.accessNote,
            { opacity: bottomAnim.opacity },
          ]}
        >
          Always available — even during event restrictions.
        </Animated.Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  newMsgButton: {
    padding: 6,
  },
  newMessageBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  numberInput: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F1F5F9',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1E1E2E',
  },
  sendNewButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadList: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3F3F5A',
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  thread: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0F0F1A',
    gap: 14,
  },
  threadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1E3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#818CF8',
  },
  threadContent: { flex: 1 },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  threadName: { fontSize: 15, fontWeight: '700', color: '#F1F5F9' },
  threadTime: { fontSize: 11, color: '#3F3F5A' },
  threadPreview: { fontSize: 13, color: '#475569' },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  accessNote: {
    fontSize: 11,
    color: '#3F3F5A',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  // Pinned contacts
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#0F0F1A',
    gap: 14,
  },
  pinnedAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
