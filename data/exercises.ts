import { Exercise } from "@/types/exercise";

export const exercises: Exercise[] = [
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

  {
    id: "elliptical",
    name: "Elliptical",
    category: "Cardio",
    type: "cardio",
    time: 30,
    miles: 3,
    resistance: 8,
    incline: 5,
  },
];