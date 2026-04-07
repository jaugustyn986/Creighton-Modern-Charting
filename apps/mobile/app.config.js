const buildProfile = process.env.EAS_BUILD_PROFILE || 'production';

const variant = {
  development: {
    name: 'Well Within Dev',
    bundleIdentifier: 'com.wellwithin.app.dev',
  },
  preview: {
    name: 'Well Within Preview',
    bundleIdentifier: 'com.wellwithin.app.preview',
  },
  production: {
    name: 'Well Within',
    bundleIdentifier: 'com.wellwithin.app',
  },
}[buildProfile];

module.exports = {
  expo: {
    name: variant.name,
    slug: 'modern-creighton',
    version: '0.1.0',
    icon: './assets/icon-1024.png',
    orientation: 'portrait',
    platforms: ['ios', 'web'],
    web: {
      bundler: 'metro',
      output: 'single',
    },
    splash: {
      image: './assets/icon-1024.png',
      resizeMode: 'contain',
      backgroundColor: '#F6F3EF',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: variant.bundleIdentifier,
      buildNumber: '1',
      config: {
        usesNonExemptEncryption: false,
      },
    },
    scheme: 'wellwithin',
    extra: {
      eas: {
        projectId: '9bec1077-74cd-4054-a6ee-d4a6511a7d0a',
      },
    },
    owner: 'jaugustyn986',
  },
};
