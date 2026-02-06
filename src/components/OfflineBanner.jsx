import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useOnlineStatus from '../hooks/useOnlineStatus';

const OfflineBanner = () => {
  const { isOnline, recheckNow } = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📡 No internet connection</Text>
      <TouchableOpacity onPress={recheckNow} style={styles.retry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  retry: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default OfflineBanner;
