import type { Workout } from "@/context/WorkoutContext";

// A live mirror of WorkoutContext's workouts, readable from outside the React
// tree. mfbBridge.ts needs this because the review tool's nav functions live
// on window, called at arbitrary times by the tool itself, not by a component,
// so they can't call useWorkouts() directly. WorkoutContext keeps this in sync
// on every change (see the useEffect in its provider), this file only holds
// the box.
//
// Exercise instance ids are generated at runtime (Date.now() + random, see
// WorkoutContext's generateInstanceId), so a static, hardcoded nav item list
// can never be correct for anything below the workout-split level, the ids
// have to be read live, at the moment the tool actually asks for them.
export const mfbLiveWorkouts: { current: Workout[] } = { current: [] };
