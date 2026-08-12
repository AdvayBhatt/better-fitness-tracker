# Why fitness-tracker breaks in Mockup Feedback, and why health-next-steps does not

## Summary

fitness-tracker uses Expo Router (file-based routing, an `app/` directory, `"main": "expo-router/entry"`). health-next-steps does not use Expo Router at all, it uses plain React Navigation (`@react-navigation/native-stack`, a `src/navigation/RootNavigator.tsx`, `"main": "index.ts"`). That is the entire difference that matters here. It is not an app.config.js setting, both apps end up with the same `web.output: "single"` and `experiments.baseUrl` values, that combination was tried against fitness-tracker directly and still failed.

## Root cause

Expo Router's web build performs a client-side check on load and on every navigation, comparing the browser's current URL against its own internal table of known routes (things like `/workout`, `/progress`, generated from the `app/` folder structure). If the current URL does not match one of those clean, extension-less routes, Expo Router renders its own built-in "Unmatched Route" screen, overwriting whatever was already correctly displayed.

Mockup Feedback serves every uploaded file at its literal filename, under a per-project prefix, for example `/api/serve/<project-id>/workout.html`. That URL has both a project-specific prefix and a literal `.html` extension. Expo Router's route table never contains anything shaped like that, no matter what `baseUrl` is configured to, so the match always fails once the page hydrates.

React Navigation, which health-next-steps uses, does not do this. It tracks the current screen in its own in-memory state (`navigationRef`), not by parsing and matching the browser's URL against a route table. So there is nothing for Mockup Feedback's file-path-based serving URL to break.

## What was tried against fitness-tracker, and why each attempt failed

1. `baseUrl` set to the relative value `"./"`, with `web.output: "static"` (one HTML file per route). Fixed asset loading (JS bundle, images) but not navigation, since nested routes needed a deeper relative path than a single `"./"` provides, and the Unmatched Route problem was still present on top of that for any page reached via a redirect or in-app navigation.

2. `web.output` switched to `"single"` (one `index.html` for the whole app, matching how health-next-steps is configured), `baseUrl` still `"./"`. This is the exact configuration health-next-steps uses. It still failed, the Unmatched Route screen displayed `http://localhost:3000/index.html`, meaning even a single, correctly loaded file still fails Expo Router's own client-side route check.

3. `web.output: "single"`, `baseUrl` set to the exact absolute serving path (`/api/serve/<project-id>`) instead of a relative value. Still failed, this time showing `http://localhost:3000/api/serve/<project-id>/index.html` as the unmatched URL.

Across all three, the JS bundle and assets loaded correctly by the end. The failure is specifically Expo Router's own client-side route-matching logic, not a broken asset path.

## Direct evidence

Exported route list from fitness-tracker (`npx expo export -p web`), Expo Router's own known routes, no `.html`, no prefix:

```
/ (index)
/workout
/progress
/settings
...
```

Actual iframe URL Mockup Feedback loads it at (from `ViewerClient.tsx`):

```js
const iframeSrc = `/api/serve/${projectId}/${currentPage.file_path}`;
```

Resulting in addresses like:

```
/api/serve/7bc04f54-b339-49c2-b316-b863fca700b0/workout.html
```

Which do not match anything in Expo Router's route list above, hence Unmatched Route.

## Recommendation

This is not fixable from the uploaded app's side, Expo Router's web route-matching does not have a documented escape hatch for being served at an arbitrary, filename-preserving URL. Two real options:

- Have Mockup Feedback strip `.html` (and ideally the project-id prefix) from the URL it actually puts in the browser's address bar when serving a mockup page, so what Expo Router sees matches one of its known routes. This is the structural fix, and would make any Expo Router app work, not just this one.
- Document Expo Router (file-based routing) as a known incompatibility separate from plain React Navigation-based Expo apps, since health-next-steps' approach is what actually makes it work today, not anything specific to Expo/React Native as a category.
