// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RandomMoviesScreen from './src/screens/RandomMoviesScreen';
import GameScreen from './src/screens/GameScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import AccountOverviewScreen from './src/screens/AccountOverviewScreen';
import CompletedConnectionsScreen from './src/screens/CompletedConnectionsScreen';
import ConnectionPathScreen from './src/screens/ConnectionPathScreen';
import SubscriptionService from './src/services/SubscriptionService';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize subscription service when app starts
    const initializeSubscriptions = async () => {
      try {
        await SubscriptionService.initializeIAP();
        // Check subscription status on app start
        await SubscriptionService.checkSubscriptionStatus();
      } catch (error) {
        console.error('Failed to initialize subscriptions:', error);
      }
    };

    initializeSubscriptions();

    // Cleanup when app is closed
    return () => {
      SubscriptionService.cleanup();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RandomMoviesScreen">
        <Stack.Screen name="RandomMoviesScreen" component={RandomMoviesScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="WatchlistScreen" component={WatchlistScreen} />
        <Stack.Screen name="CompletedConnectionsScreen" component={CompletedConnectionsScreen} />
        <Stack.Screen name="ConnectionPathScreen" component={ConnectionPathScreen} />
        <Stack.Screen name="AccountOverviewScreen" component={AccountOverviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
