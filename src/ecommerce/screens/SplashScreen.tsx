import React, { useCallback, useEffect } from 'react'
import { StyleSheet, View, StatusBar } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  cancelAnimation,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { colors, SCREEN_WIDTH } from '../theme'
import { RootStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const logoScale = useSharedValue(0.3)
  const logoOpacity = useSharedValue(0)
  const logoRotate = useSharedValue(-15)
  const taglineOpacity = useSharedValue(0)
  const taglineTranslateY = useSharedValue(20)
  const progressWidth = useSharedValue(0)
  const progressOpacity = useSharedValue(0)
  const screenOpacity = useSharedValue(1)

  const navigateToGallery = useCallback(() => {
    navigation.replace('Gallery')
  }, [navigation])

  useEffect(() => {
    // Phase 1: Logo entrance (0 - 600ms)
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    logoScale.value = withSequence(
      withSpring(1.1, { damping: 12, stiffness: 200 }),
      withSpring(1, { damping: 14, stiffness: 180 }),
    )
    logoRotate.value = withSpring(0, { damping: 14, stiffness: 120 })

    // Phase 2: Tagline (400ms)
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 400 }))
    taglineTranslateY.value = withDelay(400, withSpring(0, { damping: 16, stiffness: 160 }))

    // Phase 3: Progress bar (600ms)
    progressOpacity.value = withDelay(600, withTiming(1, { duration: 200 }))
    progressWidth.value = withDelay(700, withTiming(1, {
      duration: 1400,
      easing: Easing.inOut(Easing.cubic),
    }))

    // Phase 4: Fade out and navigate (2300ms)
    screenOpacity.value = withDelay(2300, withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(navigateToGallery)()
      }
    }))

    // Cancel ALL animations when this screen unmounts (navigation.replace)
    return () => {
      cancelAnimation(logoScale)
      cancelAnimation(logoOpacity)
      cancelAnimation(logoRotate)
      cancelAnimation(taglineOpacity)
      cancelAnimation(taglineTranslateY)
      cancelAnimation(progressWidth)
      cancelAnimation(progressOpacity)
      cancelAnimation(screenOpacity)
    }
  }, [])

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value } as const,
        { rotate: `${logoRotate.value}deg` } as const,
      ],
    } as any
  })

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }))

  const progressContainerStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }))

  const progressBarStyle = useAnimatedStyle(() => ({
    width: interpolate(progressWidth.value, [0, 1], [0, SCREEN_WIDTH * 0.5]),
  }))

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }))

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoBg}>
            <Animated.Text style={styles.logoIcon}>🛍️</Animated.Text>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.brandName, logoStyle]}>
          NoonShop
        </Animated.Text>

        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Everything you need, delivered fast
        </Animated.Text>
      </View>

      <Animated.View style={[styles.progressContainer, progressContainerStyle]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.splashGradientStart,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBg: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 48,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  progressTrack: {
    width: SCREEN_WIDTH * 0.5,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
})
