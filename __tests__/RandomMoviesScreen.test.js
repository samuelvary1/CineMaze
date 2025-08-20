import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RandomMoviesScreen from '../src/screens/RandomMoviesScreen';
import SubscriptionService from '../src/services/SubscriptionService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock SubscriptionService
jest.mock('../src/services/SubscriptionService');

describe('RandomMoviesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  test('renders correctly for free user', async () => {
    SubscriptionService.getSubscriptionInfo.mockResolvedValue({
      tier: 'free',
      playsRemaining: 1,
      isActive: false,
    });

    const { getByText } = render(<RandomMoviesScreen />);

    await waitFor(() => {
      expect(getByText('🎬 CineMaze')).toBeTruthy();
      expect(getByText(/Free/)).toBeTruthy();
    });
  });

  test('shows paywall when free user exceeds daily limit', async () => {
    SubscriptionService.canPlay.mockResolvedValue(false);
    SubscriptionService.getSubscriptionInfo.mockResolvedValue({
      tier: 'free',
      playsRemaining: 0,
      isActive: false,
    });

    const { getByText } = render(<RandomMoviesScreen />);

    await waitFor(() => {
      const startButton = getByText(/Start Game/);
      fireEvent.press(startButton);
    });

    // Should show paywall modal
    await waitFor(() => {
      expect(getByText(/Premium Feature/)).toBeTruthy();
    });
  });

  test('allows unlimited games for premium user', async () => {
    SubscriptionService.canPlay.mockResolvedValue(true);
    SubscriptionService.getSubscriptionInfo.mockResolvedValue({
      tier: 'premium',
      playsRemaining: 'Unlimited',
      isActive: true,
    });

    const { getByText } = render(<RandomMoviesScreen />);

    await waitFor(() => {
      expect(getByText(/Premium/)).toBeTruthy();
      expect(getByText(/Unlimited/)).toBeTruthy();
    });
  });
});
