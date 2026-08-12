# Migrating fitness-tracker off Expo Router onto React Navigation

Read this whole file before touching any code. It is the full context for one task, replace Expo Router (file-based routing) with plain React Navigation, so this app's web export behaves like a known-working sibling project when embedded in a third-party review tool.

## Why

This app currently uses Expo Router. On web, Expo Router performs a client-side check on every load and navigation, comparing the browser's current URL against a route table built purely from the `app/` directory's file names. A separate review tool this app gets uploaded into serves every page at a URL shaped like `/api/serve/<project-id>/<file>.html`, a project-id prefix plus a literal `.html` extension. That shape can never match Expo Router's route table, so the tool always shows Expo Router's own "Unmatched Route" screen instead of the app.

A sibling project (not in this repo, referenced only for its pattern) does not use Expo Router at all. It uses `@react-navigation/native-stack` directly, with a hand-written navigator and in-memory navigation state, no URL parsing, no route table, nothing to mismatch. It works correctly in the same review tool for exactly that reason.

Full root-cause writeup, with source-level evidence, already exists in this repo at `MOCKUP_TOOL_COMPATIBILITY.md`. Read it if any of the above needs more detail.

## Goal

Remove `expo-router` entirely. Rebuild the same screens, same UI, same behavior, on `@react-navigation/native` plus `@react-navigation/native-stack` plus `@react-navigation/bottom-tabs`. This is a navigation-layer migration only. Do not change UI, styling, or business logic in the process, only how screens are registered and how navigation between them happens.

Success is not "the app builds." Success is running `npx expo export -p web`, uploading the resulting `dist/` output into the review tool, and confirming no "Unmatched Route" screen appears when navigating through every tab and screen.

## Dependencies

Already present in `package.json` (pulled in transitively by Expo Router today, keep them, they are exactly what is needed):

```
@react-navigation/native ^7.1.8
@react-navigation/bottom-tabs ^7.4.0
@react-navigation/elements ^2.6.3
react-native-screens ~4.16.0
react-native-safe-area-context ~5.6.0
react-native-gesture-handler ~2.28.0
```

Need to add: `@react-navigation/native-stack` (not currently a direct dependency).

Need to remove: `expo-router`. Also remove the `"expo-router"` entry from the `plugins` array in `app.json`, and change `"main": "expo-router/entry"` in `package.json` to point at a new hand-written entry file (see Entry point below). Check whether `expo-linking` is still needed for anything else in the app before removing it, it may be, do not remove blindly.

## Current route inventory

Everything below was confirmed directly from the current `app/` directory and a full-repo grep for every Expo Router import and call site, this is the complete navigation graph, not a partial sample.

**`app/_layout.tsx`**, root layout. Wraps `SafeAreaProvider` > `ThemeProvider` > `WorkoutProvider` > `WorkoutSessionProvider` around an Expo Router `Stack` with three screens, `(tabs)` (headerShown false), `workout/[split]` (headerShown false), `workout/session` (headerShown false). This provider nesting must be preserved exactly, only the `Stack` at the center gets replaced.

**`app/(tabs)/_layout.tsx`**, tab layout. Already an Expo Router `Tabs` component, which is itself a thin wrapper around `@react-navigation/bottom-tabs`, so this file converts almost one for one into a plain `createBottomTabNavigator`. Three tabs, `workout`, `progress`, `settings`. Custom `tabBarButton={HapticTab}`, tab bar colors pulled from `useTheme()`. Preserve all of this as-is.

**`app/index.tsx`**, redirect only, `<Redirect href="/(tabs)/workout" />`. In React Navigation there is no separate redirect screen needed at all, just set the tab navigator's initial route to `workout` directly.

**`app/(tabs)/workout.tsx`**, main list screen, four navigation call sites.
- `router.push("/workout/session")`, no params.
- `router.push({ pathname: "/workout/[split]", params: { split: workout.id } })`.
- `router.push({ pathname: "/edit-workout/[split]", params: { split: workout.id } })`, two separate call sites in this file (roughly lines 154 and 232), same shape both times.

**`app/(tabs)/progress.tsx`**, leaf screen, no navigation calls at all, only reads context data.

**`app/(tabs)/settings.tsx`**, leaf screen, no navigation calls at all.

**`app/workout/[split].tsx`**, reads `split` via `useLocalSearchParams()`. Calls `router.back()`. Calls `router.replace(\`/workout/session?split=${split}\`)` after starting a workout, this is a query-string-style param pass, in React Navigation this becomes a typed params object, `{ split }`.

**`app/workout/session.tsx`**, reads `split` via `useLocalSearchParams()`. Calls `router.back()`. Calls `router.replace("/progress")` when a session finishes (View Progress button on the completion modal). Calls `router.replace("/")` when a session is discarded (Discard confirm), which today falls through the root redirect back to the workout tab, in the new navigator this should go straight to the tab navigator's workout tab, not to a redirect screen.

**`app/edit-workout/[split].tsx`**, reads `split` via `useLocalSearchParams<{ split: string }>()`. Calls `router.push({ pathname: "/edit-exercise/[id]", params: { id: exercise.instanceId, workoutId: currentWorkout.id } })`. Calls `router.back()`.

**`app/edit-exercise/[id].tsx`**, reads `id` and `workoutId` via `useLocalSearchParams()`. Calls `router.back()`. **Contains a pre-existing bug**, several `useState` calls are placed after an early conditional `return`, a rules-of-hooks violation. It has not caused a visible crash because `WorkoutContext` loads its data synchronously, so hook call counts never actually change between renders, but it is a real latent bug. Fix it while this file is being rewritten anyway, move every hook above any early return.

**`app/add-exercise/[split].tsx`**, reads `split` via `useLocalSearchParams()`. **Confirmed unreachable**, a full-repo grep for any `push`, `Link`, or navigation call targeting `add-exercise` found zero call sites anywhere. This screen is dead code today. It has the same rules-of-hooks bug as `edit-exercise/[id].tsx`, a `useState` at the top, an early `if (!workout) return (...)`, then another `useState` after that return. Ask the user whether to keep this screen wired into the new navigator as unused-for-now, or drop it entirely, do not silently delete it without asking first.

## Suggested target structure

Not mandatory, but a reasonable shape, mirrors the sibling project's pattern of one hand-written navigator file plus a typed param list.

```
navigation/
  RootNavigator.tsx     stack navigator, screens Tabs, WorkoutSplit, WorkoutSession, EditWorkout, EditExercise, (AddExercise if kept)
  TabNavigator.tsx       bottom tab navigator, screens Workout, Progress, Settings
  types.ts                RootStackParamList and TabParamList, one params entry per screen per the inventory above
```

Screens keep their existing component code and business logic, they move out of `app/` (which is only special because Expo Router treats it that way) into a plain directory such as `screens/`, and switch from `useLocalSearchParams()` / the `router` import to `useRoute()` / `useNavigation()` from `@react-navigation/native`, or typed screen props if using `NativeStackScreenProps`.

## Entry point

Expo Router's `"main": "expo-router/entry"` needs to be replaced with a plain entry file, for example `index.ts`, that calls `registerRootComponent(App)`, where `App` renders the same provider stack `app/_layout.tsx` has today (`SafeAreaProvider`, `ThemeProvider`, `WorkoutProvider`, `WorkoutSessionProvider`) wrapped around `NavigationContainer` wrapped around `RootNavigator`.

## What must not change

Screen UI and JSX, styling, and all logic inside `context/WorkoutContext.tsx` and `context/WorkoutSessionContext.tsx`. This is a navigation-layer migration only, not a rewrite of the app.

## How to verify the migration actually worked

Building and running the app locally is necessary but not sufficient. The actual bug being fixed only shows up in the web export served from an arbitrary URL. After the migration, run `npx expo export -p web`, then upload the `dist/` output into the review tool (this repo's `MOCKUP_TOOL_COMPATIBILITY.md` and the review tool's own `admin_instructions.md` describe exactly how), and click through every tab and every screen. No "Unmatched Route" screen should ever appear. Also re-check the two hooks-order fixes render correctly once their early-return branches are actually reachable.
