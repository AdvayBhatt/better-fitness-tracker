import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AddExerciseScreen from "@/screens/AddExerciseScreen";
import EditExerciseScreen from "@/screens/EditExerciseScreen";
import EditWorkoutScreen from "@/screens/EditWorkoutScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import WorkoutSessionScreen from "@/screens/WorkoutSessionScreen";
import WorkoutSplitScreen from "@/screens/WorkoutSplitScreen";
import TabNavigator from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

type RootNavigatorProps = {
  initialRouteName: keyof RootStackParamList;
};

export default function RootNavigator({
  initialRouteName,
}: RootNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 250,
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          animation: "fade",
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{
          animation: "fade",
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="WorkoutSplit"
        component={WorkoutSplitScreen}
      />

      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
      />

      <Stack.Screen
        name="EditWorkout"
        component={EditWorkoutScreen}
      />

      <Stack.Screen
        name="EditExercise"
        component={EditExerciseScreen}
      />

      <Stack.Screen
        name="AddExercise"
        component={AddExerciseScreen}
      />
    </Stack.Navigator>
  );
}
