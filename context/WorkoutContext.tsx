import { workouts as initialWorkouts } from "@/data/workouts";
import { mfbLiveWorkouts } from "@/navigation/mfbLiveState";
import { createContext, useContext, useEffect, useState } from "react";


export type StrengthExercise = {
  instanceId: string;
  id: string;
  name: string;
  category: string;
  type: "strength";
  sets: number;
  reps: number;
  weight: number;
};


export type CardioExercise = {
  instanceId: string;
  id: string;
  name: string;
  category: string;
  type: "cardio";
  time: number;
  miles: number;
  resistance: number;
  incline: number;
};


export type Exercise =
  | StrengthExercise
  | CardioExercise;



export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
};



function generateInstanceId() {

  return (
    Date.now().toString() +
    Math.random().toString(36).substring(2, 9)
  );

}



function addInstanceIds(
  workouts: any[]
): Workout[] {

  return workouts.map(workout => ({
    ...workout,

    exercises: workout.exercises.map(
      (exercise:any) => ({
        ...exercise,

        instanceId:
          exercise.instanceId ??
          generateInstanceId(),

      })
    ),

  }));

}



type WorkoutContextType = {
  workouts: Workout[];
  addWorkout: (workout:Workout) => void;
  deleteWorkout: (id:string) => void;
  updateWorkout: (updatedWorkout:Workout) => void;
};



const WorkoutContext =
  createContext<WorkoutContextType | null>(null);



export function WorkoutProvider({
  children,
}:{
  children:React.ReactNode;
}) {


  const [workouts,setWorkouts] =
    useState<Workout[]>(
      addInstanceIds(initialWorkouts)
    );

  // Keeps the mockup review tool's nav bridge (navigation/mfbBridge.ts) able
  // to see real, current exercise instance ids, it has no other way to read
  // this state, see navigation/mfbLiveState.ts for why.
  useEffect(() => {
    mfbLiveWorkouts.current = workouts;
  }, [workouts]);



  function addWorkout(workout: Workout) {

  setWorkouts(prev => [
    ...prev,
    {
      ...workout,
      exercises: workout.exercises.map(exercise => ({
        ...exercise,
        instanceId: exercise.instanceId ?? Date.now().toString(),
      })),
    },
  ]);

}



  function deleteWorkout(id:string){

    setWorkouts(prev =>
      prev.filter(
        workout => workout.id !== id
      )
    );

  }



  function updateWorkout(
    updatedWorkout:Workout
  ){

    setWorkouts(prev =>
      prev.map(workout =>
        workout.id === updatedWorkout.id
          ? updatedWorkout
          : workout
      )
    );

  }



  return (

    <WorkoutContext.Provider
      value={{
        workouts,
        addWorkout,
        deleteWorkout,
        updateWorkout,
      }}
    >

      {children}

    </WorkoutContext.Provider>

  );

}



export function useWorkouts(){

  const context =
    useContext(WorkoutContext);


  if(!context){

    throw new Error(
      "useWorkouts must be used inside WorkoutProvider"
    );

  }


  return context;

}