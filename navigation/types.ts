import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  workout: undefined;
  progress: undefined;
  settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  WorkoutSplit: { split: string };
  WorkoutSession: { split?: string } | undefined;
  EditWorkout: { split: string };
  EditExercise: { id: string; workoutId: string };
  AddExercise: { split: string };
};
