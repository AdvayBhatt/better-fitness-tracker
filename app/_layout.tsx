import { WorkoutProvider } from "@/context/WorkoutContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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

      </Stack>

    </WorkoutProvider>
  );
}