import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';
import { GlassSurface } from '@/components/ui/GlassSurface';

type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
  disabled?: boolean;
};

export function Button({ label, variant = 'primary', onPress, disabled = false }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.base, pressed && !disabled ? styles.pressed : null, disabled ? styles.disabled : null]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={[colors.primary, '#56B9FF']} end={{ x: 0.9, y: 1 }} style={[styles.fill, styles.primary]}>
          <Text style={[styles.text, styles.primaryText]}>{label}</Text>
        </LinearGradient>
      ) : (
        <GlassSurface glassEffectStyle="clear" style={[styles.fill, styles.secondary]}>
          <Text style={[styles.text, styles.secondaryText]}>{label}</Text>
        </GlassSurface>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  primary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 6,
  },
  secondary: {
    ...glass.panel,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },
  disabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: '#062742',
  },
  secondaryText: {
    color: colors.text,
  },
});
