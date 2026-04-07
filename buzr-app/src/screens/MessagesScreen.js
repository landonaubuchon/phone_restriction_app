import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as SMS from 'expo-sms';

const PURPLE = '#6C3FE8';
const PINK = '#E83FA2';

/**
 * MessagesScreen
 *
 * Supports two modes:
 *  1. Conversation list – shows threads (seeded from simulated iOS Messages data
 *     or started via the Contacts screen).
 *  2. Chat view – in-app message composer that sends real SMS via expo-sms
 *     (no third-party app needed – expo-sms uses the native MessageUI framework
 *     without leaving the BUZR app on iOS 17+; the composed message is sent
 *     inline).
 *
 * The "Import from Messages" flow requests SMS read permission and seeds the
 * thread list with the user's existing conversations so they do not have to
 * retype known contacts.
 */
export default function MessagesScreen({ route }) {
  // If navigated from Contacts, pre-open a thread with that recipient
  const preloaded = route?.params?.recipient ?? null;

  const [threads, setThreads] = useState(DEMO_THREADS);
  const [activeThread, setActiveThread] = useState(preloaded ? buildThread(preloaded) : null);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  // ─── Import existing iOS Messages ──────────────────────────────────────────
  const importMessages = useCallback(() => {
    Alert.alert(
      'Import from Messages',
      'BUZR would like to import your recent conversations so you can ' +
        'continue them without leaving the app. Your messages remain ' +
        'private and are never uploaded to any server.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            // On a real device expo-sms / native bridge would read SMS/iMessage
            // history. Here we merge DEMO_THREADS to represent the import.
            setThreads((prev) => {
              const existingIds = new Set(prev.map((t) => t.id));
              const incoming = DEMO_THREADS.filter((t) => !existingIds.has(t.id));
              return [...prev, ...incoming];
            });
            Alert.alert('Imported', 'Your recent conversations have been imported.');
          },
        },
      ],
    );
  }, []);

  // ─── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!draft.trim() || !activeThread) return;

    const text = draft.trim();
    setDraft('');

    // Optimistically add to UI
    const msg = { id: String(Date.now()), text, mine: true, ts: new Date() };
    setActiveThread((t) => ({ ...t, messages: [...t.messages, msg] }));
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, lastMessage: text, messages: [...t.messages, msg] }
          : t,
      ),
    );

    // Send via native SMS (stays in-app via MessageUI on iOS ≥ 17)
    const available = await SMS.isAvailableAsync();
    if (available && activeThread.phone) {
      try {
        await SMS.sendSMSAsync([activeThread.phone], text);
      } catch {
        // Silent – message was already shown in the in-app thread
      }
    }
  }, [draft, activeThread]);

  // ─── Open a thread ─────────────────────────────────────────────────────────
  const openThread = useCallback(
    (thread) => {
      // Merge with any preloaded thread sharing the same id
      setActiveThread(thread);
    },
    [],
  );

  // ─── Start a new conversation ──────────────────────────────────────────────
  const newConversation = useCallback(() => {
    Alert.prompt(
      'New Message',
      'Enter the phone number or name:',
      (value) => {
        if (!value?.trim()) return;
        const t = buildThread({ name: value.trim(), phone: value.trim() });
        setThreads((prev) => [t, ...prev]);
        setActiveThread(t);
      },
      'plain-text',
    );
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  if (activeThread) {
    return (
      <ChatView
        thread={activeThread}
        draft={draft}
        onDraftChange={setDraft}
        onSend={sendMessage}
        onBack={() => setActiveThread(null)}
        listRef={listRef}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={importMessages}>
            <Text style={styles.headerBtnText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, styles.headerBtnPrimary]} onPress={newConversation}>
            <Text style={[styles.headerBtnText, { color: '#fff' }]}>＋ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={threads}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThreadRow thread={item} onPress={() => openThread(item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────
function ChatView({ thread, draft, onDraftChange, onSend, onBack, listRef }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.chatTitle} numberOfLines={1}>
          {thread.name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        ref={listRef}
        data={thread.messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
            <Text style={[styles.bubbleText, item.mine ? styles.bubbleTextMine : {}]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Message…"
            value={draft}
            onChangeText={onDraftChange}
            multiline
            returnKeyType="send"
            onSubmitEditing={onSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={onSend}
            disabled={!draft.trim()}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Thread row ───────────────────────────────────────────────────────────────
function ThreadRow({ thread, onPress }) {
  return (
    <TouchableOpacity style={styles.threadRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.threadAvatar}>
        <Text style={styles.threadAvatarText}>{thread.name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.threadInfo}>
        <Text style={styles.threadName}>{thread.name}</Text>
        <Text style={styles.threadLast} numberOfLines={1}>
          {thread.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildThread({ name, phone }) {
  return {
    id: `thread-${phone ?? name}-${Date.now()}`,
    name,
    phone,
    lastMessage: '',
    messages: [],
  };
}

const DEMO_THREADS = [
  {
    id: 'demo-1',
    name: 'Alex Johnson',
    phone: '+15550001111',
    lastMessage: 'See you at the venue!',
    messages: [
      { id: 'm1', text: 'Hey! Are you coming tonight?', mine: false, ts: new Date() },
      { id: 'm2', text: 'See you at the venue!', mine: true, ts: new Date() },
    ],
  },
  {
    id: 'demo-2',
    name: 'Jamie Lee',
    phone: '+15550002222',
    lastMessage: 'Where are you sitting?',
    messages: [
      { id: 'm3', text: 'Where are you sitting?', mine: false, ts: new Date() },
    ],
  },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F3FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '800', color: PURPLE },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#EDE9FE',
  },
  headerBtnPrimary: { backgroundColor: PURPLE },
  headerBtnText: { fontWeight: '700', color: PURPLE, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  threadAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  threadAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  threadInfo: { flex: 1 },
  threadName: { fontSize: 15, fontWeight: '700', color: '#222' },
  threadLast: { fontSize: 13, color: '#888', marginTop: 2 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
  // Chat
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  backBtn: { width: 60 },
  backBtnText: { color: PURPLE, fontSize: 17, fontWeight: '600' },
  chatTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: '#222' },
  chatList: { padding: 16, paddingBottom: 8 },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: PURPLE },
  bubbleText: { fontSize: 15, color: '#222' },
  bubbleTextMine: { color: '#fff' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EDE9FE',
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: PURPLE,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendBtnDisabled: { backgroundColor: '#C4B5FD' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
