import React, {
  memo,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import { Extrapolation, interpolate } from 'react-native-reanimated'
import { colors, spacing, radii, typography, SCREEN_WIDTH, CAROUSEL_HEIGHT } from '../theme'

interface Props {
  images: string[]
  // 1) hide hero overlay (your existing use)
  onScrollStart?: () => void
  // 2) let parent disable vertical ScrollView while dragging
  onDragStateChange?: (dragging: boolean) => void
}

/** ---- ClubCarousel-style pagination via imperative ref ---- */
interface IImageCarouselPaginationRef {
  setActiveIndex: (index: number) => void
}

const ImageCarouselPagination = memo(
  forwardRef(({ count }: { count: number }, ref: Ref<IImageCarouselPaginationRef>) => {
    const [activeIndex, setActiveIndex] = useState(0)
    useImperativeHandle(ref, () => ({ setActiveIndex }))

    if (!count) return null

    return (
      <View style={styles.pagination}>
        <View style={styles.paginationLine} />
        {new Array(count).fill(0).map((_, index) => {
          const isActive = activeIndex === index || activeIndex - count === index
          if (isActive) {
            return (
              <View key={index} style={styles.activeDot}>
                <Text style={styles.activeDotText}>{`${index + 1}/${count}`}</Text>
              </View>
            )
          }
          return <View key={index} style={styles.inactiveDot} />
        })}
        <View style={styles.paginationLine} />
      </View>
    )
  }),
)

ImageCarouselPagination.displayName = 'ImageCarouselPagination'

/** ---- ClubCarousel-like animation curve ---- */
const clubLikeAnimationStyle = (value: number) => {
  'worklet'
  const rotateY = interpolate(value, [-2, -1, 0, 1, 2], [60, 40, 0, -40, -60], Extrapolation.CLAMP)
  const scale = interpolate(value, [-1, 0, 1], [0.5, 1, 0.5], Extrapolation.CLAMP)
  const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0], Extrapolation.CLAMP)
  const zIndex = Math.round(interpolate(value, [-1, 0, 1], [0, 100, 0], Extrapolation.CLAMP))
  const translateX = interpolate(value, [-1, 0, 1], [-SCREEN_WIDTH * 0.8, 0, SCREEN_WIDTH * 0.8], Extrapolation.CLAMP)

  return {
    transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }, { scale }, { translateX }],
    opacity,
    zIndex,
  }
}

export const ImageCarousel: React.FC<Props> = memo(({ images, onScrollStart, onDragStateChange }) => {
  const carouselRef = useRef<ICarouselInstance>(null)
  const paginationRef = useRef<IImageCarouselPaginationRef>(null)

  const hasNotifiedFirstScroll = useRef(false)
  const lastRoundedIndex = useRef(0)

  // Prefetch helps avoid decode hitch during swipe
  useEffect(() => {
    images.forEach((uri) => {
      Image.prefetch(uri).catch(() => {})
    })
  }, [images])

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: item }}
          style={styles.image}
          resizeMode="contain"
          // Android default fade-in can feel like “stutter” on first draw
          fadeDuration={Platform.OS === 'android' ? 0 : undefined}
          onError={(e) => {
        console.log('IMG_ERROR', item, e.nativeEvent?.error)
      }}
        />
      </View>
    ),
    [],
  )

  const handleProgressChange = useCallback((_: number, absoluteProgress: number) => {
    // ClubCarousel approach: update pagination based on rounded progress
    const nextIndex = Math.round(absoluteProgress)
    if (nextIndex !== lastRoundedIndex.current) {
      lastRoundedIndex.current = nextIndex
      paginationRef.current?.setActiveIndex(nextIndex)
    }

    // First swipe => tell parent to hide hero overlay
    if (!hasNotifiedFirstScroll.current && Math.abs(absoluteProgress) > 0.05) {
      hasNotifiedFirstScroll.current = true
      onScrollStart?.()
    }
  }, [onScrollStart])

  const handleScrollStart = useCallback(() => {
    onDragStateChange?.(true)
  }, [onDragStateChange])

  const handleScrollEnd = useCallback(() => {
    onDragStateChange?.(false)
  }, [onDragStateChange])

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={images}
        renderItem={renderItem}
        width={SCREEN_WIDTH}
        // v4+ recommends sizing via style instead of height prop :contentReference[oaicite:3]{index=3}
        style={styles.carousel}
        loop={false}
        customAnimation={clubLikeAnimationStyle}

        // Make swipe feel less “twitchy” + more controlled :contentReference[oaicite:4]{index=4}
        //pagingEnabled={true}
        maxScrollDistancePerSwipe={SCREEN_WIDTH * 1.1}
        snapEnabled
        minScrollDistancePerSwipe={15}
        withAnimation={{ type: 'spring', config: { damping: 18, stiffness: 180, mass: 0.9 } }}

        onProgressChange={handleProgressChange}
        onScrollStart={handleScrollStart}
        onScrollEnd={handleScrollEnd}

        // ✅ Key fix for nested vertical ScrollView (v4+)
        // In v3, replace this with panGestureHandlerProps (see note below). :contentReference[oaicite:5]{index=5}
        onConfigurePanGesture={(gesture) => {
          'worklet'
          gesture.activeOffsetX([-10, 10])
          gesture.failOffsetY([-10, 10])
        }}
      />

      <ImageCarouselPagination ref={paginationRef} count={images.length} />
    </View>
  )
})

ImageCarousel.displayName = 'ImageCarousel'

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  carousel: {
    height: CAROUSEL_HEIGHT,
    backgroundColor: colors.surface,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,

    // Helps 3D transforms stay smooth on some Android devices
    renderToHardwareTextureAndroid: true,
    shouldRasterizeIOS: true,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  paginationLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotText: {
    ...typography.small,
    color: colors.textInverse,
    fontWeight: '700',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
})