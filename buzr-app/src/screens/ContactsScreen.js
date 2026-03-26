import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import * as Contacts from 'expo-contacts';

const PURPLE = '#6C3FE8';

export default function ContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestAndLoad = useCallback(async () => {
    // Step 1 – show BUZR's own consent dialog so the user understands why.
    Alert.alert(
      'Import Contacts',
      'BUZR would like to access your contacts so you can quickly message ' +
        'and connect with people at your venue. Your contacts will only be ' +
        'used within BUZR and will never be shared with third parties.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Allow',
          onPress: async () => {
            setLoading(true);
            try {
              // Step 2 – request OS-level permission
              const { status } = await Contacts.requestPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(
                  'Permission Denied',
                  'BUZR needs contacts permission to show your contacts. ' +
                    'Please enable it in Settings → BUZR → Contacts.',
                );
                return;
              }
              setPermissionGranted(true);

              // Step 3 – load all contacts
              const { data } = await Contacts.getContactsAsync({
                fields: [
                  Contacts.Fields.FirstName,
                  Contacts.Fields.LastName,
                  Contacts.Fields.PhoneNumbers,
                  Contacts.Fields.Image,
                ],
                sort: Contacts.SortTypes.FirstName,
              });
              setContacts(data);
            } catch (err) {
              Alert.alert('Error', 'Unable to load contacts: ' + err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }, []);

  const filtered = contacts.filter((c) => {
    const full = `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase();
    return full.includes(query.toLowerCase());
  });

  const openMessage = useCallback(
    (contact) => {
      const phone = contact.phoneNumbers?.[0]?.number;
      navigation.navigate('Messages', { recipient: { name: `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim(), phone } });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Contacts</Text>

      {!permissionGranted ? (
        <View style={styles.center}>
          <Text style={styles.blurb}>
            Import your contacts to quickly message friends at the venue.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={requestAndLoad}>
            <Text style={styles.btnText}>Import Contacts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.search}
            placeholder="Search contacts…"
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
          />
          {loading ? (
            <ActivityIndicator size="large" color={PURPLE} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <ContactRow contact={item} onMessage={() => openMessage(item)} />
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>No contacts found.</Text>
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

function ContactRow({ contact, onMessage }) {
  const name = `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || 'Unknown';
  const phone = contact.phoneNumbers?.[0]?.number ?? '';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{name}</Text>
        {phone ? <Text style={styles.rowPhone}>{phone}</Text> : null}
      </View>
      <TouchableOpacity style={styles.msgBtn} onPress={onMessage}>
        <Text style={styles.msgBtnText}>Message</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  blurb: { fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  btn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  search: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#222' },
  rowPhone: { fontSize: 13, color: '#888', marginTop: 2 },
  msgBtn: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  msgBtnText: { color: PURPLE, fontWeight: '700', fontSize: 13 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 48, fontSize: 15 },
});
