import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
  interpolate,
  WithSpringConfig,
} from 'react-native-reanimated'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { products } from '../data'
import { ImageCarousel } from '../components/ImageCarousel'
import { CartBadge } from '../components/CartBadge'
import { useCartStore, useFlyStore } from '../store'
import { colors, spacing, radii, typography, shadows, SCREEN_WIDTH, BOTTOM_BAR_HEIGHT, CAROUSEL_HEIGHT } from '../theme'
import { SPRING_SNAPPY } from '../animations'
import { RootStackParamList } from '../navigation/AppNavigator'
import { Ionicons } from '@expo/vector-icons'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// ── Hero spring (near-critical damping for silky-smooth motion) ────
const HERO_SPRING: WithSpringConfig = { damping: 22, stiffness: 200, mass: 0.8 }

// ── Target hero rect (relative to screen) ────────────────────────
// Header height = spacing.xxxl + spacing.xl + spacing.md ≈ 32+20+12 = 64
const HEADER_H = 64
const TARGET = { x: 0, y: HEADER_H, width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>

export const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const product = products.find((p) => p.id === route.params.productId)!
  const sourceRect = route.params.sourceRect
  const addItem = useCartStore((s) => s.addItem)
  const triggerFly = useFlyStore((s) => s.trigger)
  const buttonRef = useRef<View>(null)
  const buttonScale = useSharedValue(1)
  const addedOpacity = useSharedValue(0)
  const [isCarouselDragging, setIsCarouselDragging] = useState(false)

  // ── Hero transition progress: 0 = card position, 1 = target position ──
  const heroProgress = useSharedValue(sourceRect ? 0 : 1)
  const heroOverlayOpacity = useSharedValue(sourceRect ? 1 : 0)

  // Manual entry animations (safe — cancel on unmount, no layout animations)
  const headerOpacity = useSharedValue(0)
  const headerTranslateY = useSharedValue(-16)
  const infoOpacity = useSharedValue(0)
  const infoTranslateY = useSharedValue(24)
  const bottomBarTranslateY = useSharedValue(40)
  const bottomBarOpacity = useSharedValue(0)

  useEffect(() => {
    const hasHero = !!sourceRect

    // ── Hero: spring from card rect → full-width display ──
    if (hasHero) {
      heroProgress.value = withSpring(1, HERO_SPRING)
      // Crossfade hero overlay to carousel (tight timing — hero settles ~350ms)
      heroOverlayOpacity.value = withDelay(300, withTiming(0, { duration: 200 }))
    }

    // ── Header: slide down with fade ──
    const headerDelay = hasHero ? 80 : 50
    headerOpacity.value = withDelay(headerDelay, withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) }))
    headerTranslateY.value = withDelay(headerDelay, withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) }))

    // ── Info section: slide up (overlaps with hero tail) ──
    const infoDelay = hasHero ? 200 : 80
    infoOpacity.value = withDelay(infoDelay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }))
    infoTranslateY.value = withDelay(infoDelay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }))

    // ── Bottom bar: slide up last ──
    const barDelay = infoDelay + 100
    bottomBarOpacity.value = withDelay(barDelay, withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }))
    bottomBarTranslateY.value = withDelay(barDelay, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }))

    return () => {
      cancelAnimation(heroProgress)
      cancelAnimation(heroOverlayOpacity)
      cancelAnimation(headerOpacity)
      cancelAnimation(headerTranslateY)
      cancelAnimation(infoOpacity)
      cancelAnimation(infoTranslateY)
      cancelAnimation(bottomBarTranslateY)
      cancelAnimation(bottomBarOpacity)
      cancelAnimation(buttonScale)
      cancelAnimation(addedOpacity)
    }
  }, [])

  // ── Hero animated style: interpolate from source card rect → target ──
  const heroAnimatedStyle = useAnimatedStyle(() => {
    if (!sourceRect) return { opacity: 0 } as any

    const t = heroProgress.value
    const left   = interpolate(t, [0, 1], [sourceRect.x, TARGET.x])
    const top    = interpolate(t, [0, 1], [sourceRect.y, TARGET.y])
    const width  = interpolate(t, [0, 1], [sourceRect.width, TARGET.width])
    const height = interpolate(t, [0, 1], [sourceRect.height, TARGET.height])
    const radius = interpolate(t, [0, 1], [radii.lg, 0])
    // Subtle "lift" — image scales up ~3% mid-flight, settles back to 1×
    const scale  = interpolate(t, [0, 0.35, 1], [1, 1.03, 1])

    return {
      position: 'absolute' as const,
      left,
      top,
      width,
      height,
      borderRadius: radius,
      overflow: 'hidden' as const,
      opacity: heroOverlayOpacity.value,
      transform: [{ scale }],
      zIndex: 100,
    } as any
  })

  // When user starts swiping carousel, hide the hero overlay
  const handleCarouselScroll = useCallback(() => {
    heroOverlayOpacity.value = withTiming(0, { duration: 200 })
  }, [])

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }))

  const infoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
    transform: [{ translateY: infoTranslateY.value }],
  }))

  const bottomBarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomBarOpacity.value,
    transform: [{ translateY: bottomBarTranslateY.value }],
  }))

  const handleAddToCart = useCallback(() => {
    // 1) Scale-down micro-interaction on button
    buttonScale.value = withSequence(
      withSpring(0.92, { damping: 10, stiffness: 400 }),
      withSpring(1, SPRING_SNAPPY),
    )

    // 2) Flash "Added!" text
    addedOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(1, { duration: 600 }),
      withTiming(0, { duration: 300 }),
    )

    // 3) Trigger fly-to-cart animation
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      triggerFly({
        imageUri: product.images[0],
        startX: x + width / 2,
        startY: y,
      })
    })

    // 4) Add to Zustand store
    addItem(product)
  }, [addItem, product, triggerFly])

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const addedTextStyle = useAnimatedStyle(() => ({
    opacity: addedOpacity.value,
  }))

  const savings = product.originalPrice - product.price

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Pressable onPress={navigation.goBack} hitSlop={12} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <CartBadge />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isCarouselDragging}
        bounces
      >
        {/* Image Carousel (sits at final position, visible once hero fades) */}
        <View style={styles.heroArea}>
          <ImageCarousel images={product.images} onScrollStart={handleCarouselScroll}  onDragStateChange={setIsCarouselDragging}/>
        </View>

        {/* Product Info */}
        <Animated.View
          style={[styles.infoContainer, infoAnimatedStyle]}
        >
          {/* Brand */}
          <Text style={styles.brand}>{product.brand}</Text>

          {/* Title */}
          <Text style={styles.title}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>({product.reviewCount.toLocaleString()} reviews)</Text>
          </View>

          {/* Price section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>SAR</Text>
              <Text style={styles.price}>{product.price.toLocaleString()}</Text>
              {product.originalPrice > product.price && (
                <Text style={styles.originalPrice}>
                  {product.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>
            {product.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}% OFF</Text>
              </View>
            )}
          </View>

          {savings > 0 && (
            <View
              style={styles.savingsBanner}
            >
              <Text style={styles.savingsText}>
                You save SAR {savings.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Express delivery */}
          {product.isExpress && (
            <View
              style={styles.expressRow}
            >
              <View style={styles.expressTag}>
                <Text style={styles.expressText}>express</Text>
              </View>
              <Text style={styles.deliveryText}>Get it by tomorrow</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionBody}>{product.description}</Text>
          </View>

          {/* Spacer for bottom bar */}
          <View style={{ height: BOTTOM_BAR_HEIGHT + spacing.lg }} />
        </Animated.View>
      </ScrollView>

      {/* ── Hero transition overlay (springs from card rect → hero area) ── */}
      {sourceRect && (
        <Animated.View style={heroAnimatedStyle} pointerEvents="none">
          <Animated.Image
            source={{ uri: product.images[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Bottom Add to Cart bar */}
      <Animated.View
        style={[styles.bottomBar, bottomBarAnimatedStyle]}
      >
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPrice}>
            SAR {product.price.toLocaleString()}
          </Text>
          {savings > 0 && (
            <Text style={styles.bottomSavings}>
              Saving SAR {savings.toLocaleString()}
            </Text>
          )}
        </View>

        <View ref={buttonRef} collapsable={false}>
          <AnimatedPressable
            onPress={handleAddToCart}
            style={[styles.addToCartButton, buttonAnimatedStyle]}
          >
            <Text style={styles.addToCartText}>ADD TO CART</Text>
          </AnimatedPressable>
        </View>

        {/* Added confirmation overlay */}
        <Animated.View style={[styles.addedOverlay, addedTextStyle]} pointerEvents="none">
          <Text style={styles.addedText}>✓ Added!</Text>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    zIndex: 10,
    ...shadows.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroArea: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    backgroundColor: colors.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  brand: {
    ...typography.bodyBold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.star,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
  },
  starIcon: {
    fontSize: 12,
    color: colors.textInverse,
    marginRight: 3,
  },
  ratingValue: {
    ...typography.captionBold,
    color: colors.textInverse,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  currency: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  price: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  originalPrice: {
    ...typography.body,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.discountBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  discountText: {
    ...typography.captionBold,
    color: colors.discount,
  },
  savingsBanner: {
    backgroundColor: colors.expressBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  savingsText: {
    ...typography.captionBold,
    color: colors.expressGreen,
  },
  expressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  expressTag: {
    backgroundColor: colors.expressGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  expressText: {
    ...typography.captionBold,
    color: colors.textInverse,
    fontStyle: 'italic',
  },
  deliveryText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  descriptionSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  descriptionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descriptionBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  // ─── Bottom Bar ────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...shadows.lg,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPrice: {
    ...typography.price,
    color: colors.textPrimary,
  },
  bottomSavings: {
    ...typography.caption,
    color: colors.expressGreen,
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    ...shadows.md,
  },
  addToCartText: {
    ...typography.bodyBold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  addedOverlay: {
    position: 'absolute',
    top: -28,
    right: spacing.lg,
    backgroundColor: colors.expressGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  addedText: {
    ...typography.captionBold,
    color: colors.textInverse,
  },
})
