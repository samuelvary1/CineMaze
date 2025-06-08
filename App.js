// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RandomMoviesScreen from './src/screens/RandomMoviesScreen';
import GameScreen from './src/screens/GameScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RandomMovies">
        <Stack.Screen name="RandomMovies" component={RandomMoviesScreen} />
        <Stack.Screen name="GameScreen" component={GameScreen} />
        <Stack.Screen name="WatchlistScreen" component={WatchlistScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
