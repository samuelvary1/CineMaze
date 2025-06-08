import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const ConnectionPathScreen = ({ route }) => {
  const { path, start, target } = route.params;

  // Find the shared node where paths meet
  const targetId = target.id;
  const targetType = target.title ? 'movie' : 'actor';

  // Split the path into left, shared, and right
  const targetIndex = path.findIndex(
    (node) => node.data.id === targetId && node.type === targetType,
  );

  const leftBranch = path.slice(0, targetIndex);
  const sharedNode = path[targetIndex];
  const rightBranch = path.slice(targetIndex + 1);

  const renderNode = (node, index, label) => (
    <View key={`${node.data.id}-${index}`} style={styles.nodeCard}>
      <Text style={styles.step}>{label}</Text>
      <Image
        source={{ uri: node.type === 'movie' ? node.data.posterPath : node.data.profilePath }}
        style={styles.image}
      />
      <Text style={styles.nodeTitle}>
        {node.type === 'movie' ? node.data.title : node.data.name}
      </Text>
      <Text style={styles.subText}>{node.type === 'movie' ? '🎬 Movie' : '🧑 Actor'}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧭 Connection Path</Text>

      <View style={styles.splitContainer}>
        <View style={styles.branch}>
          <Text style={styles.branchLabel}>🔵 Path from {start.title || start.name}</Text>
          {leftBranch.map((node, idx) => renderNode(node, idx, `Step ${idx + 1}`))}
        </View>

        <View style={styles.sharedContainer}>
          <Text style={styles.sharedLabel}>🎯 Shared Connection</Text>
          {renderNode(sharedNode, 'shared', 'Matched')}
        </View>

        <View style={styles.branch}>
          <Text style={styles.branchLabel}>🟢 Path from {target.title || target.name}</Text>
          {rightBranch.map((node, idx) =>
            renderNode(node, idx, `Step ${leftBranch.length + 2 + idx}`),
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  splitContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  branch: {
    marginBottom: 30,
  },
  branchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  sharedContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sharedLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 10,
  },
  nodeCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  step: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  nodeTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  subText: {
    fontSize: 13,
    color: '#777',
  },
  image: {
    width: 130,
    height: 195,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
});

export default ConnectionPathScreen;
