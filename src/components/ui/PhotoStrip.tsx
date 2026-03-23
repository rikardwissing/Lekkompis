import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { FullscreenPhotoViewer } from '@/components/ui/FullscreenPhotoViewer';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type PhotoStripProps = {
  photos: string[];
  size?: number;
};

export function PhotoStrip({ photos, size = 96 }: PhotoStripProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const frames = photos.map((photo, index) => (
    <Pressable
      accessibilityLabel={`Open photo ${index + 1} full screen`}
      accessibilityRole="button"
      key={`${photo}-${index}`}
      onPress={() => setViewerIndex(index)}
      style={({ pressed }) => [
        styles.frame,
        { width: size, height: size, borderRadius: 24 },
        pressed ? styles.pressed : null,
      ]}
    >
      <Image source={{ uri: photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
    </Pressable>
  ));

  if (photos.length <= 1) {
    return (
      <>
        <View style={[styles.staticRow, { minHeight: size }]}>{frames}</View>
        <FullscreenPhotoViewer
          initialIndex={viewerIndex ?? 0}
          onClose={() => setViewerIndex(null)}
          photos={photos}
          visible={viewerIndex !== null}
        />
      </>
    );
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={[styles.scrollRow, { height: size }]}
      >
        {frames}
      </ScrollView>
      <FullscreenPhotoViewer
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
        photos={photos}
        visible={viewerIndex !== null}
      />
    </>
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
  pressed: {
    opacity: 0.82,
  },
});
