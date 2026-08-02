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


type WorkoutSessionContextType = {
  activeWorkout: ActiveWorkoutSession | null;

  sessionWorkout: any;

  currentExerciseIndex: number;

  setCurrentExerciseIndex: React.Dispatch<
  React.SetStateAction<number>
>;

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
  ) => void;

  updateTimer: (
  updates: {
    elapsedSeconds?: number;
    currentExerciseDuration?: number;
    currentSetDuration?: number;
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


  const [
    currentExerciseIndex,
    setCurrentExerciseIndex,
  ] = useState(0);



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

    }


    loadWorkout();

  }, []);




  async function startWorkout(workout: any) {

   const session: ActiveWorkoutSession = {
        id: Date.now().toString(),

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

            sets:
                Array.from(
                    {
                    length:
                        exercise.sets ?? 1,
                    },
                    () => ({
                    weight:
                        exercise.weight,

                    reps:
                        exercise.reps,

                    completed:
                        false,

                    duration:
                        0,
                    })
                ),

          })
        ),

    };


    setCurrentExerciseIndex(0);

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
  ) 
  
  
  {

    if (!activeWorkout) return;


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

  }

function updateTimer(
  updates: {
    elapsedSeconds?: number;
    currentExerciseDuration?: number;
    currentSetDuration?: number;
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



    const completedWorkout = {

      id:
        activeWorkout.id,

      workoutName:
        activeWorkout.workoutName,

      date:
        new Date().toISOString(),

      duration:
        Math.floor(
          (Date.now() -
            activeWorkout.startTime) /
            60000
        ),


      exercises:
        activeWorkout.exercises.map(
          exercise => ({

            exerciseName:
              exercise.name,

            category:
              exercise.category,


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
                      0,
                  })
                ),


            totalDuration:
              0,

          })
        ),

    };



    await saveWorkout(
      completedWorkout
    );


    setActiveWorkout(null);

    setCurrentExerciseIndex(0);

    await clearActiveWorkout();

  }





  async function cancelWorkout() {

    setActiveWorkout(null);

    setCurrentExerciseIndex(0);

    await clearActiveWorkout();

  }





  return (

    <WorkoutSessionContext.Provider

  value={{

    activeWorkout,

    sessionWorkout,

    currentExerciseIndex,

    setCurrentExerciseIndex,

    startWorkout,

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