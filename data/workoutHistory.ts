export type CompletedExercise = {

  exerciseName:string;

  category:string;

  type:"strength" | "cardio";


  totalDuration:number;


  time?:number;

  miles?:number;

  resistance?:number;

  incline?:number;


  sets:{
    weight:number;
    reps:number;
    duration:number;
  }[];

};

export type CompletedWorkout = {
  id: string;
  workoutId: string;
  workoutName: string;
  split?: string;
  date: string;
  duration: number;
  exercises: CompletedExercise[];
};

