import type { ExpoConfig } from 'expo/config';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Lekkompis';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const config: ExpoConfig = {
  name: 'Lekkompis',
  slug: 'lekkompis',
  owner: 'rikardw',
  scheme: 'lekkompis',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  platforms: ['ios', 'web'],
  runtimeVersion: {
    policy: 'appVersion',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lekkompis.app',
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
  plugins: ['expo-router'],
  updates: {
    url: 'https://u.expo.dev/7bad3ed1-6bdb-4a56-9c0c-099b13725408',
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  extra: {
    eas: {
      projectId: '7bad3ed1-6bdb-4a56-9c0c-099b13725408',
    },
  },
  experiments: {
    typedRoutes: true,
    baseUrl: isGitHubPages ? `/${repository}` : undefined,
  },
};

export default config;
