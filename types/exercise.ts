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