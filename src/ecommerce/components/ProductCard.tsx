import React, { useCallback, useEffect, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated'
import { Product } from '../types'
import { SourceRect } from '../navigation/AppNavigator'
import { colors, spacing, radii, typography, CARD_WIDTH, CARD_IMAGE_HEIGHT, shadows } from '../theme'
import { staggerDelay, SPRING_SNAPPY } from '../animations'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface Props {
  product: Product
  index: number
  onPress: (product: Product, sourceRect: SourceRect) => void
}

const StarRating: React.FC<{ rating: number; count: number }> = React.memo(({ rating, count }) => (
  <View style={styles.ratingRow}>
    <Text style={styles.starIcon}>★</Text>
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    <Text style={styles.reviewCount}>({count})</Text>
  </View>
))

export const ProductCard: React.FC<Props> = React.memo(({ product, index, onPress }) => {
  const imageRef = useRef<View>(null)
  const scale = useSharedValue(1)
  // Manual stagger fade-in (safe for FlatList recycling — no entering/exiting)
  const entryOpacity = useSharedValue(0)
  const entryTranslateY = useSharedValue(20)

  useEffect(() => {
    entryOpacity.value = withDelay(
      staggerDelay(index),
      withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }),
    )
    entryTranslateY.value = withDelay(
      staggerDelay(index),
      withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }),
    )
    return () => {
      cancelAnimation(entryOpacity)
      cancelAnimation(entryTranslateY)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: entryTranslateY.value },
    ],
    opacity: entryOpacity.value,
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, SPRING_SNAPPY)
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_SNAPPY)
  }, [])

  const handlePress = useCallback(() => {
    imageRef.current?.measureInWindow((x, y, width, height) => {
      onPress(product, { x, y, width, height })
    })
  }, [onPress, product])

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, animatedStyle]}
    >
        {/* Product Image */}
        <View ref={imageRef} collapsable={false} style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: product.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Discount badge */}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}

          {/* Express badge */}
          {product.isExpress && (
            <View style={styles.expressBadge}>
              <Text style={styles.expressText}>express</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.info}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          <StarRating rating={product.rating} count={product.reviewCount} />

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              <Text style={styles.currency}>SAR </Text>
              {product.price.toLocaleString()}
            </Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                {product.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>
        </View>
    </AnimatedPressable>
  )
})

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.discount,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  discountText: {
    ...typography.small,
    color: colors.textInverse,
    fontWeight: '700',
  },
  expressBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.expressGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  expressText: {
    ...typography.small,
    color: colors.textInverse,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  info: {
    padding: spacing.sm,
    paddingTop: spacing.md,
  },
  brand: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 2,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  starIcon: {
    fontSize: 12,
    color: colors.star,
    marginRight: 2,
  },
  ratingText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    marginRight: 3,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  price: {
    ...typography.priceSmall,
    color: colors.textPrimary,
  },
  currency: {
    ...typography.caption,
    fontWeight: '600',
  },
  originalPrice: {
    ...typography.caption,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
})
