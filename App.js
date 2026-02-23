import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useAppContext } from './src/context/AppContext';

// Screens — base function tabs
import ShotClockScreen from './src/screens/ShotClockScreen';
import CameraScreen from './src/screens/CameraScreen';
import PhoneScreen from './src/screens/PhoneScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import TicketScreen from './src/screens/TicketScreen';

// Screens — stack (modals / detail views)
import WelcomeScreen from './src/screens/WelcomeScreen';
import FlashlightScreen from './src/screens/FlashlightScreen';
import EventListScreen from './src/screens/EventListScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import RestrictionScreen from './src/screens/RestrictionScreen';
import EmergencyAppsScreen from './src/screens/EmergencyAppsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab icon map ─────────────────────────────────────────────────────────────
//  BUZR    → home/lock icon — the shot clock home screen
//  Camera  → camera-outline silhouette — 15-min per-event timer
//  Phone   → call-outline silhouette of a phone — always available
//  Messages→ chatbubble-outline text bubble — always available
//  Ticket  → ticket-outline — access to your event ticket
function tabIcon(routeName, focused) {
  const map = {
    BUZR:     focused ? 'lock-closed'        : 'lock-closed-outline',
    Camera:   focused ? 'camera'             : 'camera-outline',
    Phone:    focused ? 'call'               : 'call-outline',
    Messages: focused ? 'chatbubble'         : 'chatbubble-outline',
    Ticket:   focused ? 'ticket'             : 'ticket-outline',
  };
  return map[routeName] ?? 'ellipse-outline';
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={tabIcon(route.name, focused)} size={size} color={color} />
        ),
      })}
    >
      {/* ① BUZR — shot clock home screen; centered BUZR branding with event countdown */}
      <Tab.Screen name="BUZR" component={ShotClockScreen} options={{ tabBarLabel: 'BUZR' }} />

      {/* ② Camera — silhouette camera icon; 15-minute per-event usage limit */}
      <Tab.Screen name="Camera" component={CameraScreen} options={{ tabBarLabel: 'Camera' }} />

      {/* ③ Phone — silhouette of a phone; dial pad that opens native phone dialer */}
      <Tab.Screen name="Phone" component={PhoneScreen} options={{ tabBarLabel: 'Phone' }} />

      {/* ④ Messages — text bubble icon; opens native Messages app for SMS */}
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: 'Messages' }} />

      {/* ⑤ Ticket — access to your registered event ticket with barcode */}
      <Tab.Screen name="Ticket" component={TicketScreen} options={{ tabBarLabel: 'Ticket' }} />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
function RootNavigator() {
  const { loading, consentGiven } = useAppContext();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={consentGiven ? 'Home' : 'Welcome'}
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F1F5F9',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    >
      {/* Onboarding consent screen */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />

      {/* Main app — bottom tab navigator */}
      <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />

      {/* Stack screens accessible from within the app */}
      <Stack.Screen name="EventList" component={EventListScreen} options={{ title: 'Events' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
      <Stack.Screen name="Restriction" component={RestrictionScreen} options={{ title: 'Active Restrictions' }} />
      <Stack.Screen name="EmergencyApps" component={EmergencyAppsScreen} options={{ title: 'Emergency Apps' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Flashlight" component={FlashlightScreen} options={{ title: 'Flashlight' }} />
    </Stack.Navigator>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
