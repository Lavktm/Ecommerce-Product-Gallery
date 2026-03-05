export default ({ config }) => ({
  ...config,
  name: 'ECommerceGallery',
  slug: 'ecommerce-gallery',
  version: '1.0.0',
  orientation: 'portrait',
  icon: undefined,
  splash: {
    backgroundColor: '#FEF3C7',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.example.ecommercegallery',
  },
  android: {
    package: 'com.example.ecommercegallery',
    edgeToEdgeEnabled: true,
  },
  plugins: [
    'expo-font',
  ],
})
