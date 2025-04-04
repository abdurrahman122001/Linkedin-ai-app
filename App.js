import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screen components (make sure these are implemented for React Native)
import Home from './screens/Home';
//import EditScheduledPost from './pages/home/EditScheduledPost';
//import BillingDetails from './pages/home/BillingDetails';
//import Welcome from './pages/home/Welcome';
//import CarouselMaker from './pages/home/CarouselMaker';
import LoginForm from './screens/Login'
const Stack = createNativeStackNavigator();

// AuthStack for public routes (when user is NOT authenticated)
function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginForm} />
      {/* If CarouselMaker is accessible publicly, include it here */}
    </Stack.Navigator>
  );
}

// AppStack for protected routes (when user IS authenticated)
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{ title: 'LinkedIn AI' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check if token exists and is valid (using AsyncStorage)
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const expiry = await AsyncStorage.getItem("tokenExpiry");

      if (!token || !expiry) {
        setUserToken(null);
      } else {
        if (Date.now() > parseInt(expiry, 10)) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("tokenExpiry");
          setUserToken(null);
        } else {
          setUserToken(token);
        }
      }
    } catch (error) {
      console.error(error);
      setUserToken(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
