import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompletedWorkout } from "./workoutHistory";


const STORAGE_KEY = "workoutHistory";


export async function saveWorkout(
  workout: CompletedWorkout
){

  try {

    const existing =
      await AsyncStorage.getItem(STORAGE_KEY);


    const workouts: CompletedWorkout[] =
      existing
        ? JSON.parse(existing)
        : [];


    workouts.push(workout);


    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(workouts)
    );
 

  } catch(error){

    console.log(
      "Error saving workout:",
      error
    );

  }

}



export async function getWorkouts(): Promise<CompletedWorkout[]>{

  try {

    const existing =
    await AsyncStorage.getItem(STORAGE_KEY);


    const workouts = existing
    ? JSON.parse(existing)
    : [];



    return workouts;


  } catch(error){

    console.log(
      "Error loading workouts:",
      error
    );

    return [];

  }

}



export async function deleteWorkout(
  workoutId: string
){
  try {

    const workouts =
      await getWorkouts();

    const updated =
      workouts.filter(
        workout =>
          workout.id !== workoutId
      );


    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );


  } catch(error){

    console.log(
      "Error deleting workout:",
      error
    );

  }
}



export async function deleteAllWorkouts(){

  try {

    await AsyncStorage.removeItem(
      STORAGE_KEY
    );

  } catch(error){

    console.log(
      "Error deleting all workouts:",
      error
    );

  }

}



export async function clearAllWorkouts(): Promise<void>{

  try {

    await AsyncStorage.removeItem(
      STORAGE_KEY
    );


  } catch(error){

    console.log(
      "Error clearing workouts:",
      error
    );

  }

}