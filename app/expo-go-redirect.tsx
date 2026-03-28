import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, View } from 'react-native';

const getTargetFromWindow = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project');
  const groupId = params.get('group');

  if (projectId && groupId) {
    return `exp://u.expo.dev/${projectId}/group/${groupId}`;
  }

  return null;
};

export default function ExpoGoRedirectScreen() {
  const target = useMemo(() => getTargetFromWindow(), []);

  useEffect(() => {
    if (!target || typeof window === 'undefined') {
      return;
    }

    if (Platform.OS === 'web') {
      window.location.replace(target);
      return;
    }

    void Linking.openURL(target);
  }, [target]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" />
      <Text style={styles.title}>Opening Expo Go preview…</Text>
      {target ? (
        <>
          <Text style={styles.subtitle}>If nothing happens, go back and try again.</Text>
          <Text selectable style={styles.linkText}>{target}</Text>
        </>
      ) : (
        <Text style={styles.subtitle}>Missing preview parameters.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  linkText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#444',
  },
});
