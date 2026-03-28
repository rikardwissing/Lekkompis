import { PropsWithChildren, type ComponentType } from 'react';
import { Platform, StyleProp, View, ViewProps, ViewStyle } from 'react-native';

type GlassEffectModule = {
  GlassView: ComponentType<
    PropsWithChildren<
      ViewProps & {
        glassEffectStyle?: 'clear' | 'regular' | 'none';
        tintColor?: string;
      }
    >
  >;
  isGlassEffectAPIAvailable?: () => boolean;
  isLiquidGlassAvailable?: () => boolean;
};

let cachedModule: GlassEffectModule | null | undefined;

const getGlassModule = () => {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  if (Platform.OS !== 'ios' && Platform.OS !== 'tvos') {
    cachedModule = null;
    return cachedModule;
  }

  try {
    cachedModule = require('expo-glass-effect') as GlassEffectModule;
  } catch {
    cachedModule = null;
  }

  return cachedModule;
};

export function GlassSurface({
  children,
  glassEffectStyle = 'regular',
  style,
  tintColor,
  ...props
}: PropsWithChildren<
  ViewProps & {
    glassEffectStyle?: 'clear' | 'regular' | 'none';
    style?: StyleProp<ViewStyle>;
    tintColor?: string;
  }
>) {
  const module = getGlassModule();
  const canUseGlass = Boolean(
    module?.GlassView
      && (module.isGlassEffectAPIAvailable?.() ?? module.isLiquidGlassAvailable?.() ?? true)
  );

  if (!canUseGlass || !module) {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  const GlassView = module.GlassView;

  return (
    <GlassView glassEffectStyle={glassEffectStyle} style={style} tintColor={tintColor} {...props}>
      {children}
    </GlassView>
  );
}
