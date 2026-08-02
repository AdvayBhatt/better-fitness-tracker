import { Exercise } from "@/types/exercise";

type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export const workouts: Workout[] = [
  {
    id: "push",
    name: "Push",
    exercises: [
      {
        id: "bench-press",
        name: "Dumbbell Bench Press",
        category: "Chest",
        type: "strength",
        sets: 3,
        reps: 10,
        weight: 12.5,
      },
      {
        id: "shoulder-press",
        name: "Overhead Shoulder Press",
        category: "Shoulders",
        type: "strength",
        sets: 3,
        reps: 8,
        weight: 10,
      },
      {
        id: "lateral-raise",
        name: "Dumbbell Lateral Raises",
        category: "Shoulders",
        type: "strength",
        sets: 3,
        reps: 8,
        weight: 10,
      },
    ],
  },

  {
    id: "pull",
    name: "Pull",
    exercises: [
      {
        id: "lat-pulldown",
        name: "Lat Pulldown",
        category: "Back",
        type: "strength",
        sets: 3,
        reps: 10,
        weight: 25,
      },
      {
        id: "curl",
        name: "Bicep Curl",
        category: "Biceps",
        type: "strength",
        sets: 3,
        reps: 10,
        weight: 10,
      },
    ],
  },

  {
    id: "legs",
    name: "Legs",
    exercises: [],
  },

  {
    id: "cardio",
    name: "Cardio",
    exercises: [],
  },
];