import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { WorkoutSessionProvider } from "@/context/WorkoutSessionContext";
import { getOnboardingComplete } from "@/data/settingsStorage";
import { installMfbNavBridge } from "@/navigation/mfbBridge";
import { navigationRef } from "@/navigation/navRef";
import RootNavigator from "@/navigation/RootNavigator";
import type { RootStackParamList } from "@/navigation/types";

function RootGate() {

  const { colorScheme } = useTheme();

  const [booting, setBooting] = useState(true);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>("Tabs");

  useEffect(() => {
    async function decide() {
      const complete = await getOnboardingComplete();
      setInitialRoute(complete ? "Tabs" : "Onboarding");
      setBooting(false);
    }
    decide();
  }, []);

  if (booting) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme].tint}
        />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={installMfbNavBridge}
    >
      <RootNavigator initialRouteName={initialRoute} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <SafeAreaProvider>

        <ThemeProvider>

          <WorkoutProvider>

            <WorkoutSessionProvider>

              <RootGate />

            </WorkoutSessionProvider>

          </WorkoutProvider>

        </ThemeProvider>

      </SafeAreaProvider>

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
