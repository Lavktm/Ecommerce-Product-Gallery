import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, TextInput, View, StatusBar } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Product, Category } from '../types'
import { SourceRect } from '../navigation/AppNavigator'
import { products } from '../data'
import { ProductCard } from '../components/ProductCard'
import { ProductSkeleton } from '../components/ProductSkeleton'
import { CategoryFilter } from '../components/CategoryFilter'
import { CartBadge } from '../components/CartBadge'
import { colors, spacing, radii, typography, shadows, SCREEN_WIDTH, CARD_GAP } from '../theme'
import { DURATION } from '../animations'
import { RootStackParamList } from '../navigation/AppNavigator'

const headerBg = require('../assets/header-bg.png')

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>

export const ProductGalleryScreen: React.FC<Props> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Simulate network loading with skeleton
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), DURATION.skeleton)
    return () => clearTimeout(timer)
  }, [])

  const filteredProducts = useMemo(() => {
    let result = products
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    }
    return result
  }, [selectedCategory, searchQuery])

  const handleProductPress = useCallback(
    (product: Product, sourceRect: SourceRect) => {
      navigation.navigate('Detail', { productId: product.id, sourceRect })
    },
    [navigation],
  )

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard product={item} index={index} onPress={handleProductPress} />
    ),
    [handleProductPress],
  )

  const keyExtractor = useCallback((item: Product) => item.id, [])

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="What are you looking for?"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Categories */}
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>
    ),
    [selectedCategory, searchQuery],
  )

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ImageBackground source={headerBg} style={styles.header} resizeMode="cover">
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>NoonShop</Text>
            <CartBadge tintColor={colors.textInverse} />
          </View>
        </ImageBackground>
        <ProductSkeleton />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <ImageBackground source={headerBg} style={styles.header} resizeMode="cover">
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>NoonShop</Text>
          <CartBadge tintColor={colors.textInverse} />
        </View>
      </ImageBackground>

      <View style={styles.listContainer}>
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
            </View>
          }
          // Performance optimizations
          removeClippedSubviews
          maxToRenderPerBatch={8}
          initialNumToRender={6}
          windowSize={5}
          getItemLayout={undefined} // Variable height items
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    ...shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + spacing.xl, // safe area
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: -0.5,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  row: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
