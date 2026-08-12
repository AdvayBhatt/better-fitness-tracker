import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  ActiveWorkoutExercise,
  ActiveWorkoutSession,
} from "@/types/workoutSession";

import {
  clearActiveWorkout,
  getActiveWorkout,
  saveActiveWorkout,
} from "@/data/activeWorkoutStorage";

import { saveWorkout } from "@/data/workoutStorage";

import {
  CompletedWorkout,
} from "@/data/workoutHistory";


type WorkoutSessionContextType = {
  activeWorkout: ActiveWorkoutSession | null;

  loadingActiveWorkout: boolean;

  sessionWorkout: any;

  currentExerciseIndex: number;

  startWorkout: (workout: any) => Promise<void>;

  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    updates: {
      weight?: number;
      reps?: number;
      completed?: boolean;
      duration?: number;
    }
  ) => ActiveWorkoutSession | null;

  updateTimer: (
    updates: {
      elapsedSeconds?: number;
      currentExerciseDuration?: number;
      currentSetDuration?: number;
      currentExerciseIndex?: number;
    }
  ) => void;

  finishWorkout: () => Promise<void>;

  cancelWorkout: () => Promise<void>;
};


const WorkoutSessionContext =
  createContext<WorkoutSessionContextType | undefined>(undefined);





export function WorkoutSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {


const [activeWorkout, setActiveWorkout] =
  useState<ActiveWorkoutSession | null>(null);

const [loadingActiveWorkout, setLoadingActiveWorkout] =
  useState(true);

const currentExerciseIndex =
  activeWorkout?.currentExerciseIndex ?? 0;
  



  const sessionWorkout = activeWorkout
    ? {
        id: activeWorkout.workoutId,

        name: activeWorkout.workoutName,

        exercises:
          activeWorkout.exercises.map(
            exercise => ({
              id: exercise.id,

              instanceId:
                exercise.instanceId,

              name:
                exercise.name,

              category:
                exercise.category,

              type:
                exercise.type,

              sets:
                exercise.sets.length,

              reps:
                exercise.sets[0]?.reps ?? 0,

              weight:
                exercise.sets[0]?.weight ?? 0,
            })
          ),
      }
    : null;



  useEffect(() => {

  async function loadWorkout() {

    const saved =
      await getActiveWorkout();

    if (saved) {
    setActiveWorkout(saved);
    }

    setLoadingActiveWorkout(false);

  }


  loadWorkout();

}, []);




  async function startWorkout(workout: any) {

   const session: ActiveWorkoutSession = {
        id: Date.now().toString(),

        currentExerciseIndex: 0,

        workoutId: workout.id,

        workoutName: workout.name,

        startTime: Date.now(),

        elapsedSeconds: 0,

        currentExerciseDuration: 0,

        currentSetDuration: 0,

        

      exercises:
        workout.exercises.map(
          (exercise: any): ActiveWorkoutExercise => ({

            instanceId:
              exercise.instanceId,

            id:
              exercise.id,

            name:
              exercise.name,

            category:
              exercise.category,

            type:
              exercise.type,

            time:
            exercise.time,

            miles:
            exercise.miles,

            resistance:
            exercise.resistance,

            incline:
            exercise.incline,

            sets:
                exercise.type === "strength"

                    ? Array.from(
                        {
                        length: exercise.sets,
                        },
                        () => ({
                        weight: exercise.weight,
                        reps: exercise.reps,
                        completed:false,
                        duration:0,
                        })
                    )

                    : [
                        {
                        completed:false,
                        duration:0,
                        }
                    ],

          })
        ),

    };



    setActiveWorkout(session);

    await saveActiveWorkout(session);

  }




 function updateSet(
  exerciseIndex: number,
  setIndex: number,
  updates: {
      weight?: number;
      reps?: number;
      completed?: boolean;
      duration?: number;
  }
) {

  if (!activeWorkout) return null;


  const updated: ActiveWorkoutSession = {
    ...activeWorkout,

    exercises:
      activeWorkout.exercises.map(
        (exercise, eIndex) => {

          if (eIndex !== exerciseIndex) {
            return exercise;
          }


          return {
            ...exercise,

            sets:
              exercise.sets.map(
                (set, sIndex) => {

                  if (sIndex !== setIndex) {
                    return set;
                  }

                  return {
                    ...set,
                    ...updates,
                  };

                }
              ),

          };

        }
      ),

  };


  setActiveWorkout(updated);

  saveActiveWorkout(updated);

  return updated;
}

function updateTimer(
  updates: {
    elapsedSeconds?: number;
    currentExerciseDuration?: number;
    currentSetDuration?: number;
    currentExerciseIndex?: number;
  }
) {

  setActiveWorkout(prev => {

    if (!prev) return prev;


    const updated = {
      ...prev,
      ...updates,
    };


    saveActiveWorkout(updated);


    return updated;

  });

}



  async function finishWorkout() {

    if (!activeWorkout) return;



   const completedWorkout: CompletedWorkout = {

  
  id: activeWorkout.id,

  workoutId: activeWorkout.workoutId,

  workoutName: activeWorkout.workoutName,

  date: new Date().toISOString(),

  duration: activeWorkout.elapsedSeconds,


  exercises:

  activeWorkout.exercises.map(
    exercise => ({

      exerciseName:
        exercise.name,

      category:
        exercise.category,

      type:
        exercise.type,

      time: exercise.time,

        miles: exercise.miles,

        resistance: exercise.resistance,

        incline: exercise.incline,

      totalDuration:
        exercise.sets
          .filter(
            set => set.completed
          )
          .reduce(
            (sum, set) =>
              sum + set.duration,
            0
          ),

      sets:
        exercise.sets
          .filter(
            set => set.completed
          )
          .map(
            set => ({
              weight:
                set.weight ?? 0,

              reps:
                set.reps ?? 0,

              duration:
                set.duration,
            })
          ),

    })
  ),

};

    
    console.log(
    "SAVING COMPLETED WORKOUT:",
    JSON.stringify(
      completedWorkout,
      null,
      2
    )
  );

    await saveWorkout(
      completedWorkout
    );


    setActiveWorkout(null);

    await clearActiveWorkout();

    console.log("FINISHED WORKOUT - ACTIVE WORKOUT CLEARED");
    console.log("activeWorkout should now be null");

  }





  async function cancelWorkout() {

  setActiveWorkout(null);

  await clearActiveWorkout();

}





  return (

    <WorkoutSessionContext.Provider

  value={{

    activeWorkout,

    sessionWorkout,

    currentExerciseIndex,

    startWorkout,

    loadingActiveWorkout,


    updateSet,

    updateTimer,

    finishWorkout,

    cancelWorkout,

  }}

>

      {children}

    </WorkoutSessionContext.Provider>

  );

}





export function useWorkoutSession() {

  const context =
    useContext(
      WorkoutSessionContext
    );


  if (!context) {

    throw new Error(
      "useWorkoutSession must be used inside WorkoutSessionProvider"
    );

  }


  return context;

}