import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type PhotoStripProps = {
  photos: string[];
  size?: number;
};

export function PhotoStrip({ photos, size = 96 }: PhotoStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {photos.map((photo, index) => (
        <View key={`${photo}-${index}`} style={[styles.frame, { width: size, height: size, borderRadius: 24 }]}>
          <Image source={{ uri: photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.md,
  },
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
});
