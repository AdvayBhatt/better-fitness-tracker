import AsyncStorage from "@react-native-async-storage/async-storage";


const ACTIVE_WORKOUT_KEY = "active_workout";


export async function saveActiveWorkout(
  session: unknown
) {
  await AsyncStorage.setItem(
    ACTIVE_WORKOUT_KEY,
    JSON.stringify(session)
  );
}


export async function getActiveWorkout() {
  const data =
    await AsyncStorage.getItem(
      ACTIVE_WORKOUT_KEY
    );

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}


export async function clearActiveWorkout() {
  await AsyncStorage.removeItem(
    ACTIVE_WORKOUT_KEY
  );
}