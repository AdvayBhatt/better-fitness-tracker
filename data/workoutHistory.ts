export type CompletedExercise = {
  exerciseName: string;
  totalDuration: number;
  sets: {
    weight: number;
    reps: number;
    duration: number;
  }[];
};

export type CompletedWorkout = {
  id: string;
  workoutName: string;
  date: string;
  duration: number;
  exercises: CompletedExercise[];
};

