import { Stack } from 'expo-router';
import { CardioProfileProvider } from '../context/CardioProfileContext';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <CardioProfileProvider>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </CardioProfileProvider>
  );
}

