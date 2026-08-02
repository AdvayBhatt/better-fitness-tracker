import { ThemeProvider } from "@/context/ThemeContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>

      <ThemeProvider>

        <WorkoutProvider>

          <Stack>

            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="workout/[split]"
              options={{
                title: "",
                headerShown: false,
              }}
            />

            <Stack.Screen
              name="workout/session"
              options={{
                title: "",
                headerShown: false,
              }}
            />

          </Stack>

        </WorkoutProvider>

      </ThemeProvider>

    </SafeAreaProvider>
  );
}