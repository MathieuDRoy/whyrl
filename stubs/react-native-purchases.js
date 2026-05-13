// Stub for web — react-native-purchases is native-only.
// metro.config.js redirects this import to here when bundling for web.
const noop = () => {};
const noopAsync = async () => {};
const emptyCustomerInfo = { entitlements: { active: {} } };

const Purchases = {
  configure: noop,
  logIn: async () => ({ customerInfo: emptyCustomerInfo, created: false }),
  logOut: async () => emptyCustomerInfo,
  getCustomerInfo: async () => emptyCustomerInfo,
  getOfferings: async () => ({ current: null, all: {} }),
  purchasePackage: async () => ({ customerInfo: emptyCustomerInfo, productIdentifier: '' }),
  restorePurchases: async () => emptyCustomerInfo,
  addCustomerInfoUpdateListener: noop,
  removeCustomerInfoUpdateListener: noop,
};

module.exports = Purchases;
module.exports.default = Purchases;
