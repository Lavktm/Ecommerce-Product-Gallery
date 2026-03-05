import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SplashScreen } from '../screens/SplashScreen'
import { ProductGalleryScreen } from '../screens/ProductGalleryScreen'
import { ProductDetailScreen } from '../screens/ProductDetailScreen'

/** Rectangle describing a view's position on screen (from measureInWindow) */
export type SourceRect = { x: number; y: number; width: number; height: number }

export type RootStackParamList = {
  Splash: undefined
  Gallery: undefined
  Detail: { productId: string; sourceRect?: SourceRect }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export const AppNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Splash"
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      contentStyle: { backgroundColor: '#F5F0EA' },
    }}
  >
    <Stack.Screen
      name="Splash"
      component={SplashScreen}
      options={{ animation: 'none' }}
    />
    <Stack.Screen
      name="Gallery"
      component={ProductGalleryScreen}
      options={{ animation: 'fade_from_bottom' }}
    />
    <Stack.Screen
      name="Detail"
      component={ProductDetailScreen}
      options={{
        animation: 'fade',
        animationDuration: 150,
      }}
    />
  </Stack.Navigator>
)
