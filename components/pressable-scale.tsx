import * as Haptics from "expo-haptics";
import { type ReactNode, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type PressableScaleProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
};

function triggerHaptic() {
  if (Platform.OS === "web") return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // haptics are best effort and safe to ignore when unavailable
  }
}

export function PressableScale({
  style,
  scaleTo = 0.96,
  haptic = true,
  onPressIn,
  onPress,
  children,
  ...rest
}: PressableScaleProps) {

  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: Platform.OS !== "web",
      speed: 40,
      bounciness: 6,
    }).start();
  }

  return (
    <Pressable
      onPressIn={(e) => {
        animateTo(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={() => animateTo(1)}
      onPress={(e) => {
        if (haptic) triggerHaptic();
        onPress?.(e);
      }}
      {...rest}
    >
      <Animated.View
        style={[
          { transform: [{ scale }] },
          style,
        ]}
      >
        {children as ReactNode}
      </Animated.View>
    </Pressable>
  );
}
