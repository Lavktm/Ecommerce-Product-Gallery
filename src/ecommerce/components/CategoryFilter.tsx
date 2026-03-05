import React, { useCallback } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Category } from '../types'
import { categories } from '../data'
import { colors, spacing, radii, typography } from '../theme'
import { SPRING_SNAPPY } from '../animations'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface Props {
  selected: Category
  onSelect: (category: Category) => void
}

const CategoryChip: React.FC<{
  label: Category
  isActive: boolean
  onPress: () => void
}> = React.memo(({ label, isActive, onPress }) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.93, SPRING_SNAPPY)
  }, [])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_SNAPPY)
  }, [])

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chipWrapper, animatedStyle]}
    >
      {isActive ? (
        <LinearGradient
          colors={['#F87171', '#FB923C', '#FBBF24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chipGradient}
        >
          <Text style={[styles.chipText, styles.chipTextActive]}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.chipInactive}>
          <Text style={styles.chipText}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  )
})

export const CategoryFilter: React.FC<Props> = React.memo(({ selected, onSelect }) => (
  <View style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {categories.map((cat) => (
        <CategoryChip
          key={cat}
          label={cat as Category}
          isActive={selected === cat}
          onPress={() => onSelect(cat as Category)}
        />
      ))}
    </ScrollView>
  </View>
))

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chipWrapper: {
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  chipGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  chipInactive: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
})
