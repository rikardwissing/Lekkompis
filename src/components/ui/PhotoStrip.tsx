import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type PhotoStripProps = {
  photos: string[];
  size?: number;
};

export function PhotoStrip({ photos, size = 96 }: PhotoStripProps) {
  const frames = photos.map((photo, index) => (
    <View key={`${photo}-${index}`} style={[styles.frame, { width: size, height: size, borderRadius: 24 }]}>
      <Image source={{ uri: photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
    </View>
  ));

  if (photos.length <= 1) {
    return <View style={[styles.staticRow, { minHeight: size }]}>{frames}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={[styles.scrollRow, { height: size }]}
    >
      {frames}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRow: {
    alignSelf: 'flex-start',
    flexGrow: 0,
  },
  staticRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  row: {
    gap: spacing.md,
    alignItems: 'center',
  },
  frame: {
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
});
