import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '@/theme/colors';

const IOS_PREVIEW_WIDTH = 393;
const IOS_PREVIEW_HEIGHT = 852;

export function DevicePreview({ children }: PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const canFrame = isWeb && width > 480;

  if (!canFrame) {
    return <>{children}</>;
  }

  const scale = Math.min((width - 48) / IOS_PREVIEW_WIDTH, (height - 48) / IOS_PREVIEW_HEIGHT, 1);

  return (
    <View style={styles.outer}>
      <View
        style={[
          styles.frame,
          {
            width: IOS_PREVIEW_WIDTH * scale,
            height: IOS_PREVIEW_HEIGHT * scale,
          },
        ]}
      >
        <View style={[styles.inner, { transform: [{ scale }], width: IOS_PREVIEW_WIDTH, height: IOS_PREVIEW_HEIGHT }]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#0A1220',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  frame: {
    borderRadius: 42,
    padding: 10,
    backgroundColor: '#06090F',
    shadowColor: 'rgba(0,0,0,0.18)',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 14,
  },
  inner: {
    overflow: 'hidden',
    borderRadius: 32,
    backgroundColor: colors.background,
    transformOrigin: 'top left' as never,
  },
});
