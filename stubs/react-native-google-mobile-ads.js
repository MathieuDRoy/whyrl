// Stub for web — react-native-google-mobile-ads is native-only.
// metro.config.js redirects this import to here when bundling for web.
const noop = () => {};

const MobileAds = () => ({
  initialize: async () => {},
  setRequestConfiguration: async () => {},
});

const BannerAd = () => null;
const BannerAdSize = { MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE', BANNER: 'BANNER' };
const TestIds = { BANNER: 'test-banner' };

module.exports = MobileAds;
module.exports.default = MobileAds;
module.exports.BannerAd = BannerAd;
module.exports.BannerAdSize = BannerAdSize;
module.exports.TestIds = TestIds;
module.exports.MaxAdContentRating = {};
module.exports.AdEventType = {};
