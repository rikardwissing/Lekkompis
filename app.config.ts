import type { ExpoConfig } from 'expo/config';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Lekkompis';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const config: ExpoConfig = {
  name: 'Lekkompis',
  slug: 'lekkompis',
  scheme: 'lekkompis',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  platforms: ['ios', 'web'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lekkompis.app',
  },
  plugins: ['expo-router'],
  web: {
    bundler: 'metro',
    output: 'static',
  },
  experiments: {
    typedRoutes: true,
    baseUrl: isGitHubPages ? `/${repository}` : undefined,
  },
};

export default config;
