import { PressableScale } from "@/components/pressable-scale";
import { ThemedText } from "@/components/themed-text";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "solid" | "outline" | "danger";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "solid",
  disabled = false,
  style,
}: PrimaryButtonProps) {

  const { colorScheme } = useTheme();
  const tint = Colors[colorScheme].tint;

  const backgroundColor =
    variant === "danger"
      ? "#c0392b"
      : variant === "outline"
      ? "transparent"
      : tint;

  const textColor =
    variant === "outline"
      ? tint
      : "#ffffff";

  return (
    <PressableScale
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        onPress();
      }}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor: tint,
          borderWidth: variant === "outline" ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <ThemedText
        style={[styles.label, { color: textColor }]}
      >
        {label}
      </ThemedText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
