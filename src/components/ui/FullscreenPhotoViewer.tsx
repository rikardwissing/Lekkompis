import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type FullscreenPhotoViewerProps = {
  photos: string[];
  initialIndex: number;
  onClose: () => void;
  visible: boolean;
};

export function FullscreenPhotoViewer({
  photos,
  initialIndex,
  onClose,
  visible,
}: FullscreenPhotoViewerProps) {
  const { height, width } = useWindowDimensions();
  const listRef = useRef<FlatList<string>>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken<string>> }) => {
      const nextIndex = viewableItems[0]?.index;

      if (typeof nextIndex === 'number') {
        setActiveIndex(nextIndex);
      }
    }
  ).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setActiveIndex(initialIndex);

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        animated: false,
        index: initialIndex,
      });
    });
  }, [initialIndex, visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <SafeAreaProvider>
          <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Close photos"
                accessibilityRole="button"
                hitSlop={12}
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : null]}
              >
                <Ionicons color={colors.surface} name="close" size={22} />
              </Pressable>
              <Text style={styles.counter}>
                {activeIndex + 1} / {photos.length}
              </Text>
              <View style={styles.topBarSpacer} />
            </View>

            <FlatList
              ref={listRef}
              data={photos}
              getItemLayout={(_, index) => ({
                index,
                length: width,
                offset: width * index,
              })}
              horizontal
              keyExtractor={(item, index) => `${item}-${index}`}
              onViewableItemsChanged={onViewableItemsChanged}
              pagingEnabled
              renderItem={({ item }) => (
                <View style={[styles.page, { width }]}>
                  <Image
                    resizeMode="contain"
                    source={{ uri: item }}
                    style={{
                      width: width - spacing.xl * 2,
                      height: height - 160,
                    }}
                  />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#101412',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  pressed: {
    opacity: 0.72,
  },
  counter: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
  },
  topBarSpacer: {
    width: 40,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
