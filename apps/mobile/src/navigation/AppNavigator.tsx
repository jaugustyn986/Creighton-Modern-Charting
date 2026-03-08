import React, { useCallback, createContext, useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarScreen } from '../screens/CalendarScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { CycleHistoryScreen } from '../screens/CycleHistoryScreen';
import { CycleDetailScreen } from '../screens/CycleDetailScreen';
import { DailyEntryScreen } from '../screens/DailyEntryScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { EngineDemoScreen } from '../screens/EngineDemoScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

export type RootStackParamList = {
  Calendar: undefined;
  Timeline: undefined;
  CycleHistory: undefined;
  CycleDetail: { cycleNumber: number };
  DailyEntry: { date: string; existingEntry?: boolean };
  Help: undefined;
  EngineDemo: undefined;
};

const ONBOARDING_KEY = 'holistic_cycle_onboarding_done';
const Stack = createNativeStackNavigator<RootStackParamList>();

type OnboardingContextValue = { resetOnboarding: () => void };
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useResetOnboarding(): OnboardingContextValue | null {
  return useContext(OnboardingContext);
}

export function AppNavigator(): JSX.Element {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setShowOnboarding(val !== 'true');
    });
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    AsyncStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  }, []);

  if (showOnboarding === null) return <></>;

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
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
          options={{ title: 'Cycle Detail' }}
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
          name="EngineDemo"
          component={EngineDemoScreen}
          options={{ title: 'Engine Demo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </OnboardingContext.Provider>
  );
}
