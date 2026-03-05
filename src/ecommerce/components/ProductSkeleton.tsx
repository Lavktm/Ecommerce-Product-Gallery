import React, { useEffect } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
  withDelay,
} from 'react-native-reanimated'
import { colors, spacing, radii, CARD_WIDTH, CARD_IMAGE_HEIGHT, SCREEN_WIDTH } from '../theme'

// ── Shimmer bone ──────────────────────────────────────────────────
interface BoneProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: ViewStyle
  delay?: number
}

const SkeletonBone: React.FC<BoneProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
  delay = 0,
}) => {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    )

    // Cancel the infinite loop when the bone unmounts
    return () => {
      cancelAnimation(opacity)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }) as any)

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.skeleton,
        },
        animatedStyle,
        style,
      ]}
    />
  )
}

// ── Single card skeleton ──────────────────────────────────────────
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
  const baseDelay = index * 80 // stagger cards

  return (
    <View style={styles.card}>
      {/* Image placeholder */}
      <SkeletonBone
        width={CARD_WIDTH - 2}
        height={CARD_IMAGE_HEIGHT}
        borderRadius={radii.lg}
        delay={baseDelay}
      />
      {/* Brand */}
      <SkeletonBone
        width={60}
        height={10}
        style={{ marginTop: spacing.md, marginLeft: spacing.sm }}
        delay={baseDelay + 50}
      />
      {/* Title line 1 */}
      <SkeletonBone
        width={CARD_WIDTH - 24}
        height={12}
        style={{ marginTop: spacing.sm, marginLeft: spacing.sm }}
        delay={baseDelay + 100}
      />
      {/* Title line 2 */}
      <SkeletonBone
        width={CARD_WIDTH - 48}
        height={12}
        style={{ marginTop: 6, marginLeft: spacing.sm }}
        delay={baseDelay + 150}
      />
      {/* Rating */}
      <SkeletonBone
        width={80}
        height={10}
        style={{ marginTop: spacing.sm, marginLeft: spacing.sm }}
        delay={baseDelay + 200}
      />
      {/* Price */}
      <SkeletonBone
        width={70}
        height={16}
        style={{ marginTop: spacing.sm, marginLeft: spacing.sm, marginBottom: spacing.md }}
        delay={baseDelay + 250}
      />
    </View>
  )
}

// ── Full skeleton screen ──────────────────────────────────────────
export const ProductSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Search bar skeleton */}
    <View style={styles.searchSkeleton}>
      <SkeletonBone
        width={SCREEN_WIDTH - spacing.lg * 2}
        height={44}
        borderRadius={radii.lg}
        delay={0}
      />
    </View>

    {/* Category chips skeleton */}
    <View style={styles.categorySkeleton}>
      {[60, 85, 65, 70, 60].map((w, i) => (
        <SkeletonBone
          key={i}
          width={w}
          height={32}
          borderRadius={radii.full}
          style={{ marginRight: spacing.sm }}
          delay={i * 60}
        />
      ))}
    </View>

    {/* Grid skeleton */}
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </View>
  </View>
)

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  searchSkeleton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  categorySkeleton: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
})
