const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Forces Swift 5 language mode on all CocoaPods targets.
// Prevents "weak must be a mutable variable" errors from pods that haven't
// been updated for Swift 6's stricter concurrency rules.
module.exports = function withSwiftVersion(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf-8');

      const injection = `
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |build_config|
      build_config.build_settings['SWIFT_VERSION'] = '5.0'
    end
  end
`;

      // Inject into existing post_install block, or append a new one
      if (podfile.includes('post_install do |installer|')) {
        podfile = podfile.replace(
          'post_install do |installer|',
          `post_install do |installer|\n${injection}`,
        );
      } else {
        podfile += `\npost_install do |installer|\n${injection}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};
