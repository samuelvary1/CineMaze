import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLACEHOLDER = 'https://via.placeholder.com/150x225?text=No+Image';

const CompletedConnectionsScreen = ({ navigation }) => {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('completedConnections');
        const saved = jsonValue != null ? JSON.parse(jsonValue) : [];
        setConnections(saved);
      } catch (e) {
        Alert.alert('Error', 'Failed to load completed connections.');
      }
    };

    const unsubscribe = navigation.addListener('focus', loadConnections);
    return unsubscribe;
  }, [navigation]);

  const renderCard = (connection) => {
    return (
      <TouchableOpacity
        key={connection.id}
        style={styles.card}
        onPress={() =>
          navigation.navigate('ConnectionPathScreen', {
            connection,
          })
        }
      >
        <View style={styles.row}>
          <Image
            source={{
              uri: connection.movieA?.posterPath || PLACEHOLDER,
            }}
            style={styles.poster}
          />
          <Text style={styles.arrow}>→</Text>
          <Image
            source={{
              uri: connection.movieB?.posterPath || PLACEHOLDER,
            }}
            style={styles.poster}
          />
        </View>
        <Text style={styles.pathLength}>Moves: {connection.path?.length || 0}</Text>
        <Text style={styles.timestamp}>
          Saved: {new Date(connection.timestamp).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Completed Connections</Text>
      {connections.length === 0 ? (
        <Text style={styles.empty}>You haven't finished any games yet.</Text>
      ) : (
        connections.map(renderCard)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#B8DDF0', // Powder blue background
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2C3E50',
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#2C3E50',
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poster: {
    width: 90,
    height: 135,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  arrow: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#2C3E50',
  },
  pathLength: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timestamp: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});

export default CompletedConnectionsScreen;
