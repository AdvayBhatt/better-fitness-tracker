import { Platform } from "react-native";

import { mfbLiveWorkouts } from "./mfbLiveState";
import { navigationRef } from "./navRef";

// Bridges this app to the mockup-feedback review tool's optional nav API.
// The tool's iframe wrapper looks for window.mfbGotoNavItem,
// window.mfbGetNavListItems, and window.mfbGetPageDefinitions on the page it
// serves, uses the first two to show a "Shortcuts" panel that jumps straight
// to a screen, and the third to auto-seed its own left "PAGES" sidebar so
// every screen shows up as a distinct, clickable page instead of just the
// one uploaded index.html. See that tool's design/developer_guide.md section
// 4 for the full contract, this file implements the app side of it, nothing
// else needs to change in that tool for this to work.
//
// Every screen in this app is covered here, not just the three tabs, that
// mirrors C:\AdvayRepos\health-next-steps\mobile\src\services\navList.ts, the
// reference implementation of this same contract, which enumerates every
// screen down to individual survey questions rather than just top-level
// destinations. The point of the feature is letting a reviewer reach any
// screen directly instead of clicking through several intermediate steps.
//
// Screens parameterized by a specific workout or exercise (WorkoutSplit,
// WorkoutSession, EditWorkout, AddExercise, EditExercise) get exactly one
// representative nav entry each, not one per actual split or exercise. Every
// split renders the identical WorkoutSplit template with different data, and
// splits/exercises are user-created content with no upper bound, unlike
// health-next-steps' survey questions and enrollment steps, which are
// enumerated in full there because each one is a genuinely different screen
// and the set is fixed by the study design, never growing with usage. One
// example is enough to review a template, a pin covers feedback on a
// specific instance, that's what pins are for. See this file's git history
// for the earlier one-per-instance version and why it was reverted.
//
// The representative instance is picked live off mfbLiveWorkouts (see
// mfbLiveState.ts) each time the tool calls one of these functions, since
// exercise instance ids are generated at runtime, not a snapshot taken once
// at startup. Its id is used only to know where to navigate, the nav/page id
// exposed to the tool is a fixed, generic string ("workout-split", not
// "split-push"), matching a PageMarker id that's the same fixed string
// regardless of which actual split is showing (see screens/WorkoutSplitScreen
// .tsx etc.), so page detection still works correctly if a reviewer reaches a
// non-representative split by clicking through the app instead of using the
// nav shortcut.
//
// Web only, on native this file is inert, none of the window functions are
// assigned and MOCKUP_NAV_READY is never sent.

type MfbNavItem = {
  id: string;
  name: string;
  label: string;
  emoji: string;
};

type MfbPageDefinition = {
  id: string;
  name: string;
  xpath: string;
  description?: string;
};

type NavEntry = MfbNavItem & {
  description?: string;
  goto: () => void;
};

function navigateIfReady(action: () => void) {
  if (navigationRef.isReady()) {
    action();
  }
}

// Always-present destinations, independent of workout data.
function staticEntries(): NavEntry[] {
  return [
    {
      id: "onboarding",
      name: "Onboarding",
      label: "Onboarding",
      emoji: "👋",
      description: "First-run profile setup flow",
      goto: () =>
        navigateIfReady(() => navigationRef.navigate("Onboarding")),
    },
    {
      id: "workout",
      name: "Workout",
      label: "Workout",
      emoji: "🏋️",
      goto: () =>
        navigateIfReady(() =>
          navigationRef.navigate("Tabs", { screen: "workout" })
        ),
    },
    {
      id: "progress",
      name: "Progress",
      label: "Progress",
      emoji: "📈",
      goto: () =>
        navigateIfReady(() =>
          navigationRef.navigate("Tabs", { screen: "progress" })
        ),
    },
    {
      id: "settings",
      name: "Settings",
      label: "Settings",
      emoji: "⚙️",
      goto: () =>
        navigateIfReady(() =>
          navigationRef.navigate("Tabs", { screen: "settings" })
        ),
    },
  ];
}

// One representative entry per per-workout screen template, picked from
// whichever workout currently happens to be first, not one entry per actual
// workout or exercise. See the file comment above for why.
function dynamicEntries(): NavEntry[] {
  const workouts = mfbLiveWorkouts.current;
  if (workouts.length === 0) return [];

  const entries: NavEntry[] = [];
  const exampleWorkout = workouts[0];

  entries.push({
    id: "workout-split",
    name: "Workout Split",
    label: "Workout Split",
    emoji: "📋",
    description: `Workout split detail (example: ${exampleWorkout.name})`,
    goto: () =>
      navigateIfReady(() =>
        navigationRef.navigate("WorkoutSplit", { split: exampleWorkout.id })
      ),
  });

  entries.push({
    id: "workout-session",
    name: "Workout Session",
    label: "Workout Session",
    emoji: "⏱️",
    description: `Active workout session, set-by-set tracking (example: ${exampleWorkout.name})`,
    goto: () =>
      navigateIfReady(() =>
        navigationRef.navigate("WorkoutSession", { split: exampleWorkout.id })
      ),
  });

  entries.push({
    id: "edit-workout",
    name: "Edit Workout",
    label: "Edit Workout",
    emoji: "✏️",
    description: `Edit a workout split's exercise list (example: ${exampleWorkout.name})`,
    goto: () =>
      navigateIfReady(() =>
        navigationRef.navigate("EditWorkout", { split: exampleWorkout.id })
      ),
  });

  entries.push({
    id: "add-exercise",
    name: "Add Exercise",
    label: "Add Exercise",
    emoji: "➕",
    description: `Add a new exercise to a workout split (example: ${exampleWorkout.name})`,
    goto: () =>
      navigateIfReady(() =>
        navigationRef.navigate("AddExercise", { split: exampleWorkout.id })
      ),
  });

  // Needs a workout that actually has an exercise in it, the first workout
  // alone might be empty (Legs/Cardio start with none), so this searches
  // rather than assuming exampleWorkout qualifies.
  const workoutWithExercise = workouts.find((w) => w.exercises.length > 0);
  const exampleExercise = workoutWithExercise?.exercises[0];

  if (workoutWithExercise && exampleExercise) {
    entries.push({
      id: "edit-exercise",
      name: "Edit Exercise",
      label: "Edit Exercise",
      emoji: "🔧",
      description: `Edit a single exercise's sets, reps, or weight (example: ${exampleExercise.name})`,
      goto: () =>
        navigateIfReady(() =>
          navigationRef.navigate("EditExercise", {
            id: exampleExercise.instanceId,
            workoutId: workoutWithExercise.id,
          })
        ),
    });
  }

  return entries;
}

function allEntries(): NavEntry[] {
  return [...staticEntries(), ...dynamicEntries()];
}

let installed = false;

export function installMfbNavBridge() {
  if (Platform.OS !== "web") return;
  if (typeof window === "undefined") return;
  if (installed) return;
  installed = true;

  (window as any).mfbGetNavListItems = (): MfbNavItem[] =>
    allEntries().map(({ goto: _goto, description: _description, ...item }) => item);

  (window as any).mfbGotoNavItem = (id: string) => {
    const entry = allEntries().find((e) => e.id === id);
    entry?.goto();
  };

  // Each id/name pair here must match the id/name passed to that screen's
  // <PageMarker>, the marker div PageMarker renders is what this xpath
  // resolves to, and it's only present in the DOM while that screen is
  // actually focused (see components/PageMarker.web.tsx), that's what makes
  // page detection and the nav highlight track the real active screen.
  (window as any).mfbGetPageDefinitions = (): MfbPageDefinition[] =>
    allEntries().map(({ id, name, description }) => ({
      id,
      name,
      xpath: `//div[@id='${id}'][@mfb-page-name='${name}']`,
      ...(description !== undefined ? { description } : {}),
    }));

  // The tool's own serve route puts this page inside an iframe on its own
  // origin, this app has no reliable way to know that origin ahead of time,
  // "*" matches the tool's own postMessage usage for the same reason.
  window.parent?.postMessage({ type: "MOCKUP_NAV_READY" }, "*");
}
