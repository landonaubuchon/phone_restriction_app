import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useAppContext } from './src/context/AppContext';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import RestrictionScreen from './src/screens/RestrictionScreen';
import EmergencyAppsScreen from './src/screens/EmergencyAppsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PhoneScreen from './src/screens/PhoneScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import FlashlightScreen from './src/screens/FlashlightScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab icon helper ──────────────────────────────────────────────────────────
function tabIcon(routeName, focused) {
  const icons = {
    Events:      focused ? 'calendar'          : 'calendar-outline',
    Phone:       focused ? 'call'              : 'call-outline',
    Flashlight:  focused ? 'flashlight'        : 'flashlight-outline',
    Messages:    focused ? 'chatbubble'        : 'chatbubble-outline',
    Profile:     focused ? 'person'            : 'person-outline',
  };
  return icons[routeName] ?? 'ellipse-outline';
}

// ─── Tab descriptions shown to users ─────────────────────────────────────────
//   Events    → browse & register for events
//   Phone     → silhouette of a phone  → make calls (always available)
//   Flashlight→ silhouette of a flashlight → torch utility (always available)
//   Messages  → text bubble            → send texts (always available)
//   Profile   → your account, consent, and emergency apps

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
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={tabIcon(route.name, focused)}
            size={size}
            color={color}
          />
        ),
      })}
    >
      {/* ① Events — browse upcoming events and register */}
      <Tab.Screen
        name="Events"
        component={HomeScreen}
        options={{ tabBarLabel: 'Events' }}
      />

      {/* ② Phone — silhouette of a phone; tap to open dial pad and make calls */}
      <Tab.Screen
        name="Phone"
        component={PhoneScreen}
        options={{ tabBarLabel: 'Phone' }}
      />

      {/* ③ Flashlight — silhouette of a flashlight; tap to toggle the torch */}
      <Tab.Screen
        name="Flashlight"
        component={FlashlightScreen}
        options={{ tabBarLabel: 'Flashlight' }}
      />

      {/* ④ Messages — text bubble icon; tap to open messages and send texts */}
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Messages' }}
      />

      {/* ⑤ Profile — manage your account, consent, and emergency apps */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Stack (handles onboarding + modal screens) ─────────────────────────
function RootNavigator() {
  const { loading, consentGiven } = useAppContext();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#A78BFA" />
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
      {/* Onboarding — shown to first-time users before consent */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />

      {/* Main app with bottom tabs */}
      <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />

      {/* Detail / modal screens pushed on top of tabs */}
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
      <Stack.Screen
        name="Restriction"
        component={RestrictionScreen}
        options={{ title: 'Active Restrictions' }}
      />
      <Stack.Screen
        name="EmergencyApps"
        component={EmergencyAppsScreen}
        options={{ title: 'Emergency Apps' }}
      />
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
