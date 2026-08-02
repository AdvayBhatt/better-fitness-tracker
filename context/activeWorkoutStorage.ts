import { ActiveWorkoutSession } from "@/types/workoutSession";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_WORKOUT_KEY = "activeWorkoutSession";

export async function saveActiveWorkout(
  session: ActiveWorkoutSession
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      ACTIVE_WORKOUT_KEY,
      JSON.stringify(session)
    );
  } catch (error) {
    console.error("Failed to save active workout:", error);
    throw error;
  }
}

export async function getActiveWorkout(): Promise<ActiveWorkoutSession | null> {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as ActiveWorkoutSession;
  } catch (error) {
    console.error("Failed to load active workout:", error);
    return null;
  }
}

export async function clearActiveWorkout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
  } catch (error) {
    console.error("Failed to clear active workout:", error);
    throw error;
  }
}