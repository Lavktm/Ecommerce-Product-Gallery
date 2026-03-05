import React from 'react'
import { StyleSheet, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppNavigator } from './navigation/AppNavigator'
import { FlyToCartOverlay } from './components/FlyToCartOverlay'

/**
 * Root component for the Interactive E-Commerce Product Gallery.
 *
 * Architecture:
 * - Navigation: React Navigation (native-stack) with shared element hero transitions
 * - State: Zustand for cart management + fly-to-cart coordination
 * - Animations: react-native-reanimated v3 (all on UI thread via worklets)
 * - Carousel: react-native-reanimated-carousel with parallax effect
 */
export const ECommerceApp: React.FC = () => (
  <GestureHandlerRootView style={styles.root}>
    <NavigationContainer>
      <View style={styles.root}>
        <AppNavigator />
        {/* Global overlay for fly-to-cart animations */}
        <FlyToCartOverlay />
      </View>
    </NavigationContainer>
  </GestureHandlerRootView>
)

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
