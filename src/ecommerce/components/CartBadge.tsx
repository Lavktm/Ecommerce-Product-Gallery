import React, { useCallback, useEffect, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useCartStore, useFlyStore } from '../store'
import { colors, spacing, radii, typography } from '../theme'
import { SPRING_SNAPPY } from '../animations'

interface Props {
  onPress?: () => void
  tintColor?: string
}

export const CartBadge: React.FC<Props> = React.memo(({ onPress, tintColor = colors.textPrimary }) => {
  const cartCount = useCartStore((s) => s.cartCount)
  const setCartIconPosition = useFlyStore((s) => s.setCartIconPosition)
  const prevCount = useRef(cartCount)
  const iconRef = useRef<View>(null)
  const badgeScale = useSharedValue(1)

  // Measure cart icon position for fly-to-cart
  const measurePosition = useCallback(() => {
    iconRef.current?.measureInWindow((x, y, width, height) => {
      if (x !== undefined) {
        setCartIconPosition({ x: x + width / 2, y: y + height / 2 })
      }
    })
  }, [setCartIconPosition])

  useEffect(() => {
    // Bounce badge when count increases
    if (cartCount > prevCount.current) {
      badgeScale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 400 }),
        withSpring(1, SPRING_SNAPPY),
      )
    }
    prevCount.current = cartCount
  }, [cartCount])

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }))

  return (
    <Pressable onPress={onPress} hitSlop={12}>
      <View ref={iconRef} onLayout={measurePosition} style={styles.container}>
        <Text style={[styles.icon, { color: tintColor }]}>🛒</Text>
        {cartCount > 0 && (
          <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
            <Text style={styles.badgeText}>
              {cartCount > 99 ? '99+' : cartCount}
            </Text>
          </Animated.View>
        )}
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.cartBadge,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    ...typography.small,
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 10,
  },
})
