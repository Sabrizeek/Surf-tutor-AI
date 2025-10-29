import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CardioScreen from '../screens/CardioScreen';
import ARSeaDrillScreen from '../screens/ARSeaDrillScreen';
import ARCoachingScreen from '../screens/ARCoachingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HelpScreen from '../screens/HelpScreen';
import { AuthContext } from '../auth/AuthContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        {!user ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={ARSeaDrillScreen} />
            <Stack.Screen name="Cardio" component={CardioScreen} />
            <Stack.Screen name="ARCoaching" component={ARCoachingScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
