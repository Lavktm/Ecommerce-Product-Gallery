import {
  Easing,
  WithTimingConfig,
  WithSpringConfig,
} from 'react-native-reanimated'

/** Shared spring config for interactive animations */
export const SPRING_CONFIG: WithSpringConfig = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
}

/** Snappy spring for buttons / micro-interactions */
export const SPRING_SNAPPY: WithSpringConfig = {
  damping: 14,
  stiffness: 300,
  mass: 0.6,
}

/** Gentle spring for large transitions */
export const SPRING_GENTLE: WithSpringConfig = {
  damping: 20,
  stiffness: 120,
  mass: 1,
}

/** Standard timing config with ease-out */
export const TIMING_EASE_OUT: WithTimingConfig = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
}

/** Fast timing for micro interactions */
export const TIMING_FAST: WithTimingConfig = {
  duration: 150,
  easing: Easing.out(Easing.quad),
}

/** Slow timing for larger transitions */
export const TIMING_SLOW: WithTimingConfig = {
  duration: 500,
  easing: Easing.out(Easing.cubic),
}

/** Fly-to-cart arc duration */
export const FLY_DURATION = 650

/** Stagger delay per item index for list entry animations */
export const staggerDelay = (index: number) => index * 60

/** Duration constants */
export const DURATION = {
  skeleton: 1500,
  splash: 2500,
  cartBounce: 400,
  flyToCart: FLY_DURATION,
  carouselSnap: 250,
  fadeIn: 300,
  stagger: 60,
} as const
