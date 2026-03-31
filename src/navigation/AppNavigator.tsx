// ============================================================
// SyncUs - App Navigator
// ============================================================

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {RootStackParamList} from '../types';
import {useAuth} from '../hooks/useAuth';
import {Colors} from '../constants/theme';

// Auth Screens
import {LoginScreen} from '../screens/LoginScreen';
import {SignUpScreen} from '../screens/SignUpScreen';
import {OnboardingScreen} from '../screens/OnboardingScreen';

import {LobbyScreen} from '../screens/LobbyScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {CreateRoomScreen} from '../screens/CreateRoomScreen';
import {JoinRoomScreen} from '../screens/JoinRoomScreen';
import {WaitingRoomScreen} from '../screens/WaitingRoomScreen';
import {QuizScreen} from '../screens/QuizScreen';
import {ResultScreen} from '../screens/ResultScreen';
import {SummaryScreen} from '../screens/SummaryScreen';
import {HistoryScreen} from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: {backgroundColor: Colors.background},
  animation: 'slide_from_right' as const,
};

export const AppNavigator: React.FC = () => {
  const {user, isOnboarded, loading} = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!user ? (
        // --- Auth Flow ---
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : !isOnboarded ? (
        // --- Onboarding Flow ---
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        // --- Main App Flow ---
        <>
          <Stack.Screen name="Lobby" component={LobbyScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
          <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
          <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Summary" component={SummaryScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
