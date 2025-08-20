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
import FavoriteActorsScreen from './src/screens/FavoriteActorsScreen';
import ActorDetailScreen from './src/screens/ActorDetailScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
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
      <Stack.Navigator
        initialRouteName="RandomMoviesScreen"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#B8DDF0',
          },
          headerTintColor: '#2C3E50',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="RandomMoviesScreen"
          component={RandomMoviesScreen}
          options={{
            title: 'CineMaze',
            headerShown: false, // Hide header since we have custom header in component
          }}
        />
        <Stack.Screen
          name="GameScreen"
          component={GameScreen}
          options={{
            title: 'Movie Connection Game',
            headerShown: false, // Hide header since we have custom header in component
          }}
        />
        <Stack.Screen
          name="WatchlistScreen"
          component={WatchlistScreen}
          options={{
            title: 'My Watchlist',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CompletedConnectionsScreen"
          component={CompletedConnectionsScreen}
          options={{ title: '', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="ConnectionPathScreen"
          component={ConnectionPathScreen}
          options={{ title: 'Connection Path' }}
        />
        <Stack.Screen
          name="AccountOverviewScreen"
          component={AccountOverviewScreen}
          options={{
            title: 'Account',
            headerShown: false, // Hide header since we have custom header in component
          }}
        />
        <Stack.Screen
          name="FavoriteActorsScreen"
          component={FavoriteActorsScreen}
          options={{
            title: 'Favorite Actors',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ActorDetailScreen"
          component={ActorDetailScreen}
          options={{
            title: 'Actor Details',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MovieDetailScreen"
          component={MovieDetailScreen}
          options={{
            title: 'Movie Details',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AchievementsScreen"
          component={AchievementsScreen}
          options={{
            title: 'Achievements',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
