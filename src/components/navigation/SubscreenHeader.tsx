import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { glass } from '@/theme/glass';
import { GlassSurface } from '@/components/ui/GlassSurface';

type SubscreenHeaderProps = {
  fallbackHref: Href;
  title: string;
  titleOpacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
};

export function SubscreenHeader({ fallbackHref, title, titleOpacity }: SubscreenHeaderProps) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.titleWrap}>
        <Animated.Text numberOfLines={1} style={[styles.title, titleOpacity ? { opacity: titleOpacity } : null]}>
          {title}
        </Animated.Text>
      </View>
      <Pressable
        accessibilityLabel="Back"
        accessibilityRole="button"
        onPress={handleBack}
        style={({ pressed }) => [styles.backAction, pressed ? styles.pressed : null]}
      >
        <GlassSurface glassEffectStyle="clear" style={styles.backGlass}>
          <Ionicons color={colors.primary} name="chevron-back" size={20} />
        </GlassSurface>
      </Pressable>
      <View style={styles.rightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    position: 'absolute',
    left: 64,
    right: 64,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  backAction: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  backGlass: {
    flex: 1,
    borderRadius: radius.pill,
    ...glass.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: 42,
    height: 42,
  },
  pressed: {
    opacity: 0.84,
  },
});
