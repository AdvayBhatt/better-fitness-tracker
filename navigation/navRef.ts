import { createNavigationContainerRef } from "@react-navigation/native";

import type { RootStackParamList } from "./types";

// A ref to the navigation container, usable outside of any screen component.
// The mockup tool bridge (mfbBridge.ts) needs this to drive navigation from
// window-level functions the tool calls, not from a component's own props.
export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();
