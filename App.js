// App.js
import React, { useEffect, useRef } from 'react';
import { Linking, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RandomMoviesScreen from './src/screens/RandomMoviesScreen';
import GameScreen from './src/screens/GameScreen';
import DailyChallengeScreen from './src/screens/DailyChallengeScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import AccountOverviewScreen from './src/screens/AccountOverviewScreen';
import CompletedConnectionsScreen from './src/screens/CompletedConnectionsScreen';
import ConnectionPathScreen from './src/screens/ConnectionPathScreen';
import FavoriteActorsScreen from './src/screens/FavoriteActorsScreen';
import ActorDetailScreen from './src/screens/ActorDetailScreen';
import MovieDetailScreen from './src/screens/MovieDetailScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import DeepLinkService from './src/services/DeepLinkService';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef(null);
  const isNavigationReady = useRef(false);
  const pendingDeepLink = useRef(null);

  const handleDeepLink = async (url) => {
    const parsed = DeepLinkService.parseDeepLink(url);
    if (!parsed) {
      return;
    }

    // If navigation isn't ready yet, queue it for later
    if (!isNavigationReady.current) {
      pendingDeepLink.current = url;
      return;
    }

    const { movieIdA, movieIdB } = parsed;

    Alert.alert('🎯 Challenge Received!', "Loading your friend's challenge...");

    const [movieA, movieB] = await Promise.all([
      DeepLinkService.fetchMovieById(movieIdA),
      DeepLinkService.fetchMovieById(movieIdB),
    ]);

    if (!movieA || !movieB) {
      Alert.alert('Error', 'Could not load the challenge movies. Please try again.');
      return;
    }

    navigationRef.current?.navigate('GameScreen', { movieA, movieB });
  };

  const onNavigationReady = () => {
    isNavigationReady.current = true;
    // Process any deep link that arrived before navigation was ready
    if (pendingDeepLink.current) {
      const url = pendingDeepLink.current;
      pendingDeepLink.current = null;
      handleDeepLink(url);
    }
  };

  useEffect(() => {
    // Listen for links while app is open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Handle link that opened the app from cold start
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription.remove();
  }, []);
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
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
            name="DailyChallengeScreen"
            component={DailyChallengeScreen}
            options={{
              title: 'Daily Challenge',
              headerShown: false,
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
    </ErrorBoundary>
  );
}
