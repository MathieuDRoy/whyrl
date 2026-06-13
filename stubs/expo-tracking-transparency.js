// Stub for web — expo-tracking-transparency calls requireNativeModule at import time,
// which throws on web. metro.config.js redirects this import to here when bundling for web.
const granted = { granted: true, expires: 'never', canAskAgain: true, status: 'granted' };

module.exports = {
  requestTrackingPermissionsAsync: async () => granted,
  getTrackingPermissionsAsync: async () => granted,
  getAdvertisingId: () => null,
  isAvailable: () => false,
  useTrackingPermissions: () => [granted, async () => granted],
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
};
