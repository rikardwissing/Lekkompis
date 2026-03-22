import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: number;
};

export function Avatar({ name, imageUrl, size = 56 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primarySoft,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  initials: {
    color: colors.primary,
    fontWeight: '700',
  },
});
