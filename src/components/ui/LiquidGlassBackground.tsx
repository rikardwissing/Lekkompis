import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

export function LiquidGlassBackground({ children }: PropsWithChildren) {
  return (
    <LinearGradient colors={[colors.backgroundTop, colors.background, colors.backgroundBottom]} end={{ x: 0.9, y: 1 }} style={styles.root}>
      <LinearGradient colors={['rgba(123, 209, 255, 0.20)', 'rgba(123, 209, 255, 0)']} end={{ x: 0.7, y: 0.9 }} style={styles.blobTop} />
      <LinearGradient colors={['rgba(158, 139, 255, 0.24)', 'rgba(158, 139, 255, 0)']} end={{ x: 1, y: 1 }} style={styles.blobBottom} />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  blobTop: {
    position: 'absolute',
    top: -140,
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 320,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -180,
    left: -120,
    width: 360,
    height: 360,
    borderRadius: 360,
  },
});
