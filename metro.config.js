const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-purchases') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'stubs/react-native-purchases.js'),
    };
  }
  if (platform === 'web' && moduleName === 'react-native-google-mobile-ads') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'stubs/react-native-google-mobile-ads.js'),
    };
  }
  if (platform === 'web' && moduleName === 'expo-tracking-transparency') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'stubs/expo-tracking-transparency.js'),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
