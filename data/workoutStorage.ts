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