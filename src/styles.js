import { StyleSheet } from 'react-native';

export const nodeCardStyles = StyleSheet.create({
  nodeCard: {
    width: 160,
    alignItems: 'center',
    marginBottom: 20,
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  nodeTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subTitle: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
  },
  linkText: {
    color: '#007BFF',
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
  },
  watchlistButton: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
});
