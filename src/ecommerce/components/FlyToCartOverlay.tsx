import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  cancelAnimation,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { useFlyStore, useCartStore } from '../store'
import { FLY_DURATION } from '../animations'

/**
 * Renders an absolute overlay that animates a small product thumbnail
 * from its source position (near the Add-to-Cart button) towards the
 * cart icon in the header. Uses Reanimated shared values running
 * entirely on the UI thread for 60 FPS.
 */
export const FlyToCartOverlay: React.FC = () => {
  const payload = useFlyStore((s) => s.payload)
  const cartIconPos = useFlyStore((s) => s.cartIconPosition)
  const clear = useFlyStore((s) => s.clear)

  if (!payload || !cartIconPos) return null

  return (
    <FlyingImage
      imageUri={payload.imageUri}
      startX={payload.startX}
      startY={payload.startY}
      endX={cartIconPos.x}
      endY={cartIconPos.y}
      onComplete={clear}
    />
  )
}

const FlyingImage: React.FC<{
  imageUri: string
  startX: number
  startY: number
  endX: number
  endY: number
  onComplete: () => void
}> = ({ imageUri, startX, startY, endX, endY, onComplete }) => {
  const progress = useSharedValue(0)
  const opacity = useSharedValue(1)

  useEffect(() => {
    // Animate along a curved path
    progress.value = withTiming(1, {
      duration: FLY_DURATION,
      easing: Easing.inOut(Easing.cubic),
    })

    // Fade out near the end
    opacity.value = withDelay(
      FLY_DURATION * 0.7,
      withTiming(0, { duration: FLY_DURATION * 0.3 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)()
        }
      }),
    )

    return () => {
      cancelAnimation(progress)
      cancelAnimation(opacity)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value

    // Bezier-like curve: quadratic interpolation with a high control point
    const controlX = (startX + endX) / 2
    const controlY = Math.min(startY, endY) - 120 // arc above both points

    // Quadratic bezier: P = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY

    const scale = interpolate(t, [0, 0.3, 1], [1, 1.1, 0.3])
    const rotate = interpolate(t, [0, 1], [0, 360])

    return {
      position: 'absolute' as const,
      left: x - 25,
      top: y - 25,
      opacity: opacity.value,
      transform: [
        { scale } as const,
        { rotate: `${rotate}deg` } as const,
      ],
    } as any
  })

  return (
    <Animated.Image
      source={{ uri: imageUri }}
      style={[styles.flyingImage, animatedStyle]}
      resizeMode="cover"
    />
  )
}

const styles = StyleSheet.create({
  flyingImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
})
