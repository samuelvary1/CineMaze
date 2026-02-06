import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RandomMoviesScreen from '../src/screens/RandomMoviesScreen';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('RandomMoviesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  test('renders correctly with all features available', async () => {
    const { getByText } = render(<RandomMoviesScreen />);

    await waitFor(() => {
      expect(getByText('CineMaze')).toBeTruthy();
    });
  });
});
