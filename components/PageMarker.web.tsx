import { useIsFocused } from "@react-navigation/native";

// Web only (Metro picks this file over PageMarker.tsx for web builds). Renders a
// hidden marker div, present in the DOM only while this screen is actually
// focused, that the mockup-feedback review tool uses to detect which screen is
// currently showing and drive its left "PAGES" sidebar / nav shortcut highlight.
//
// Why this has to be focus-gated, not just always-rendered:
// @react-navigation/bottom-tabs keeps every visited tab's screen mounted once
// loaded (it does not unmount on blur), and on web, react-native-screens'
// display:none toggling for inactive screens is a no-op unless enableScreens()
// has been called, which this app does not do. Left unconditional, the marker
// for every tab you have ever visited would sit in the DOM at once, and the
// review tool always resolves the first-defined match, so the highlight would
// get stuck on whichever tab was visited first and never move. Returning null
// while unfocused removes the element from the DOM entirely, so only the
// screen actually on screen ever has a matching marker.
//
// See @/navigation/mfbBridge.ts for the id/name values this must match, and
// C:\AdvayRepos\health-next-steps\mobile\src\components\PageMarker.web.tsx for
// the reference implementation this mirrors (that app uses a plain stack
// navigator with navigationRef.reset(), which unmounts prior screens on its
// own, so it doesn't need the focus check this one does).

declare module "react" {
  interface HTMLAttributes<T> {
    "mfb-page-name"?: string;
    "mfb-page-description"?: string;
  }
}

type Props = {
  id: string;
  name: string;
  description?: string;
};

export default function PageMarker({ id, name, description }: Props) {
  const isFocused = useIsFocused();

  if (!isFocused) return null;

  return (
    <div
      id={id}
      mfb-page-name={name}
      mfb-page-description={description}
      style={{ display: "none" }}
    />
  );
}
