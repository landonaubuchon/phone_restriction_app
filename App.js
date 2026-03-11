import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Oswald_700Bold,
  Oswald_600SemiBold,
  Oswald_400Regular,
} from '@expo-google-fonts/oswald';

import { AppProvider, useAppContext } from './src/context/AppContext';
import SimulatedAppScreen from './src/screens/SimulatedAppScreen';
import AdminScreen from './src/screens/AdminScreen';

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
import SimulationScreen from './src/screens/SimulationScreen';

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
  const { notifications, clearNotification } = useAppContext();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0F',
          borderTopColor: '#1E1E2E',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
        },
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#3F3F5A',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        tabBarBadgeStyle: {
          backgroundColor: '#EF4444',
          fontSize: 10,
          fontWeight: '700',
          minWidth: 18,
          height: 18,
          lineHeight: 18,
          borderRadius: 9,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={tabIcon(route.name, focused)} size={size} color={color} />
        ),
      })}
    >
      {/* ① BUZR — shot clock home screen */}
      <Tab.Screen
        name="BUZR"
        component={ShotClockScreen}
        options={{ tabBarLabel: 'BUZR' }}
      />

      {/* ② Camera — silhouette camera icon; 15-minute per-event usage limit */}
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
          tabBarBadge: notifications.camera ? '!' : undefined,
        }}
        listeners={{ tabPress: () => clearNotification('camera') }}
      />

      {/* ③ Phone — silhouette of a phone; shows missed call badge */}
      <Tab.Screen
        name="Phone"
        component={PhoneScreen}
        options={{
          tabBarLabel: 'Phone',
          tabBarBadge: notifications.phone > 0 ? notifications.phone : undefined,
        }}
        listeners={{ tabPress: () => clearNotification('phone') }}
      />

      {/* ④ Messages — text bubble; shows unread count badge */}
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarBadge: notifications.messages > 0 ? notifications.messages : undefined,
        }}
        listeners={{ tabPress: () => clearNotification('messages') }}
      />

      {/* ⑤ Ticket — shows alert dot if there's a ticket issue */}
      <Tab.Screen
        name="Ticket"
        component={TicketScreen}
        options={{
          tabBarLabel: 'Ticket',
          tabBarBadge: notifications.ticket ? '!' : undefined,
        }}
        listeners={{ tabPress: () => clearNotification('ticket') }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────
function RootNavigator() {
  const { loading, consentGiven } = useAppContext();

  if (loading) {
    return (
      <View style={appStyles.splash}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={consentGiven ? 'Home' : 'Welcome'}
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0F' },
        headerTintColor: '#F1F5F9',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#0A0A0F' },
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
      <Stack.Screen name="Simulation" component={SimulationScreen} options={{ title: 'Simulation' }} />
      <Stack.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          title: '⚙️ Admin Panel',
          headerStyle: { backgroundColor: '#0A0A0F' },
          headerTintColor: '#EF4444',
        }}
      />
      <Stack.Screen
        name="SimulatedApp"
        component={SimulatedAppScreen}
        options={({ route }) => ({ title: route.params?.appName ?? 'Emergency App' })}
      />
    </Stack.Navigator>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Oswald_700Bold,
    Oswald_600SemiBold,
    Oswald_400Regular,
  });

  // Block render until fonts are ready so no component ever receives an
  // unknown fontFamily reference.  fontError falls through to allow the app
  // to render with system-font fallback rather than hanging indefinitely.
  if (!fontsLoaded && !fontError) {
    return (
      <View style={appStyles.splash}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

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

const appStyles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
