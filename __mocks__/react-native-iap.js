// Mock for react-native-iap
export const initConnection = jest.fn(() => Promise.resolve(true));
export const endConnection = jest.fn(() => Promise.resolve());
export const getSubscriptions = jest.fn(() => Promise.resolve([]));
export const requestSubscription = jest.fn(() => Promise.resolve());
export const purchaseErrorListener = jest.fn(() => ({ remove: jest.fn() }));
export const purchaseUpdatedListener = jest.fn(() => ({ remove: jest.fn() }));
export const finishTransaction = jest.fn(() => Promise.resolve());
export const getAvailablePurchases = jest.fn(() => Promise.resolve([]));

export default {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  purchaseErrorListener,
  purchaseUpdatedListener,
  finishTransaction,
  getAvailablePurchases,
};
