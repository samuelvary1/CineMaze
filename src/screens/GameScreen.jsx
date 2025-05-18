// src/screens/GameScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

const GameScreen = ({ route, navigation }) => {
  const { movieA, movieB } = route.params;

  const initialProgress = {
    path: [],
    currentNode: movieA,
    moves: 0,
    isConnected: false,
  };

  const [progress, setProgress] = useState(initialProgress);

  const navigateToNode = (newNode) => {
    const isTarget = newNode.id === movieB.id;
    setProgress((prev) => ({
      path: [...prev.path, newNode],
      currentNode: newNode,
      moves: prev.moves + 1,
      isConnected: isTarget,
    }));
  };

  useEffect(() => {
    if (progress.isConnected) {
      Alert.alert(`You connected the movies in ${progress.moves} moves!`);
    }
  }, [progress.isConnected, progress.moves]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🎯 Connect {movieA.title} to {movieB.title}
      </Text>

      <Text style={styles.text}>Current: {progress.currentNode.title}</Text>
      <Text style={styles.text}>Moves: {progress.moves}</Text>

      <Button
        title="Go to Next Node"
        onPress={() =>
          navigateToNode({
            id: movieB.id, // Simulate winning
            title: movieB.title,
            type: 'movie',
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  text: { fontSize: 18, marginBottom: 10 },
});

export default GameScreen;
