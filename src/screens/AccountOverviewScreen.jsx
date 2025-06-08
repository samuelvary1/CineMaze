import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const AccountOverviewScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 Account Overview</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RandomMoviesScreen')}
      >
        <Text style={styles.buttonText}>🎯 Start New Game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('WatchlistScreen')}
      >
        <Text style={styles.buttonText}>📋 View Watchlist</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CompletedConnectionsScreen')}
      >
        <Text style={styles.buttonText}>🧩 View Completed Connections</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AccountOverviewScreen;
