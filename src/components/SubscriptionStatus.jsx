import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SubscriptionStatus = () => {
  return (
    <View style={[styles.statusBar, styles.freeBar]}>
      <View style={styles.statusContent}>
        <Text style={styles.tierText}>🎬 CineMaze</Text>
        <Text style={styles.playsText}>All features unlocked</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  freeBar: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4ECDC4',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tierText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#2c3e50',
  },
  playsText: {
    fontSize: 13,
    color: '#6c757d',
    marginRight: 8,
  },
  expiryText: {
    fontSize: 11,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  statusText: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    flex: 1,
  },
});

export default SubscriptionStatus;
