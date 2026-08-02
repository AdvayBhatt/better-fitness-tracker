export type ActiveWorkoutSet = {
  weight?: number;
  reps?: number;

  completed: boolean;

  duration: number;
};


export type ActiveWorkoutExercise = {
  instanceId: string;

  id: string;

  name: string;

  category: string;

  type: "strength" | "cardio";

  sets: ActiveWorkoutSet[];

  // cardio fields
  time?: number;
  miles?: number;
  resistance?: number;
  incline?: number;
};


export type ActiveWorkoutSession = {
  id: string;

  workoutId: string;

  workoutName: string;

  startTime: number;

  elapsedSeconds: number;

  currentExerciseDuration: number;

  currentSetDuration: number;

  currentExerciseIndex: number;

  exercises: ActiveWorkoutExercise[];
};