export type Exercise =
  | {
      id: string;
      name: string;
      category: string;
      type: "strength";
      sets: number;
      reps: number;
      weight: number;
    }
  | {
      id: string;
      name: string;
      category: string;
      type: "cardio";
      time: number;
      miles: number;
      resistance: number;
      incline: number;
    };

export type ActiveWorkoutSet = {
  weight?: number;
  reps?: number;
  completed: boolean;
};

export type ActiveWorkoutExercise = {
  exerciseId: string;
  name: string;
  category: string;
  type: "strength" | "cardio";

  sets: ActiveWorkoutSet[];

  // cardio fields if needed later
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

  exercises: ActiveWorkoutExercise[];
};