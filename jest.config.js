module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-iap)/)',
  ],
  moduleNameMapper: {
    '^react-native-iap$': '<rootDir>/__mocks__/react-native-iap.js',
  },
};
