import React, { useCallback, createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '../context/AuthProvider';
import { SyncProvider } from '../context/SyncProvider';
import { CalendarScreen } from '../screens/CalendarScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { CycleHistoryScreen } from '../screens/CycleHistoryScreen';
import { CycleDetailScreen } from '../screens/CycleDetailScreen';
import { DailyEntryScreen } from '../screens/DailyEntryScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { EngineDemoScreen } from '../screens/EngineDemoScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AuthScreen } from '../screens/AuthScreen';

export type RootStackParamList = {
  Calendar: undefined;
  Timeline: undefined;
  CycleHistory: undefined;
  CycleDetail: { cycleNumber: number };
  DailyEntry: { date: string; existingEntry?: boolean };
  Help: undefined;
  Settings: undefined;
  Auth: undefined;
  EngineDemo: undefined;
};

const ONBOARDING_KEY = 'well_within_onboarding_done';
const ONBOARDING_KEY_LEGACY = 'holistic_cycle_onboarding_done';
const Stack = createNativeStackNavigator<RootStackParamList>();

type OnboardingContextValue = { resetOnboarding: () => void };
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useResetOnboarding(): OnboardingContextValue | null {
  return useContext(OnboardingContext);
}

WebBrowser.maybeCompleteAuthSession();

export function AppNavigator(): JSX.Element {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      if (val === 'true') {
        setShowOnboarding(false);
        return;
      }
      AsyncStorage.getItem(ONBOARDING_KEY_LEGACY).then((legacyVal) => {
        if (legacyVal === 'true') {
          AsyncStorage.setItem(ONBOARDING_KEY, 'true');
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      });
    });
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    void AsyncStorage.removeItem(ONBOARDING_KEY).then(() => AsyncStorage.removeItem(ONBOARDING_KEY_LEGACY));
    setShowOnboarding(true);
  }, []);

  if (showOnboarding === null) return <></>;

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <AuthProvider>
    <SyncProvider>
    <OnboardingContext.Provider value={{ resetOnboarding }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Calendar">
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{ title: 'Timeline' }}
        />
        <Stack.Screen
          name="CycleHistory"
          component={CycleHistoryScreen}
          options={{ title: 'Cycle History' }}
        />
        <Stack.Screen
          name="CycleDetail"
          component={CycleDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DailyEntry"
          component={DailyEntryScreen}
          options={{
            title: 'New Entry',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={{ title: 'Understanding Your Chart' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ title: 'Sign in with email' }}
        />
        <Stack.Screen
          name="EngineDemo"
          component={EngineDemoScreen}
          options={{ title: 'Engine Demo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </OnboardingContext.Provider>
    </SyncProvider>
    </AuthProvider>
  );
}
