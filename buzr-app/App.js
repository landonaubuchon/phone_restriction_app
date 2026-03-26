import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { VenueProvider } from './src/context/VenueContext';
import HomeScreen from './src/screens/HomeScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import AdminMapScreen from './src/screens/AdminMapScreen';
import LockStatusScreen from './src/screens/LockStatusScreen';
import BuzrLogo from './src/components/BuzrLogo';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <VenueProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#6C3FE8',
            headerTitleStyle: { fontWeight: '800' },
            // Centered BUZR logo in the header
            headerTitle: () => <BuzrLogo size="small" showText={false} />,
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: '#F5F3FF' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Contacts" component={ContactsScreen} />
          <Stack.Screen name="Messages" component={MessagesScreen} />
          <Stack.Screen name="AdminMap" component={AdminMapScreen} options={{ title: 'Admin Map' }} />
          <Stack.Screen name="LockStatus" component={LockStatusScreen} options={{ title: 'Lock Status' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </VenueProvider>
  );
}


