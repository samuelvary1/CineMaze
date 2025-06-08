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
            path: connection.path,
            start: connection.start,
            target: connection.target,
            timestamp: connection.timestamp,
          })
        }
      >
        <View style={styles.row}>
          <Image
            source={{ uri: connection.start.posterPath || PLACEHOLDER }}
            style={styles.poster}
          />
          <Text style={styles.arrow}>➡️</Text>
          <Image
            source={{ uri: connection.target.posterPath || PLACEHOLDER }}
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Completed Connections</Text>
      {connections.length === 0 ? (
        <Text style={styles.empty}>You haven’t finished any games yet.</Text>
      ) : (
        connections.map(renderCard)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  empty: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  card: {
    width: '100%',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
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
  },
  pathLength: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});

export default CompletedConnectionsScreen;
