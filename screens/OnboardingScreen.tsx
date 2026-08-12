import PageMarker from "@/components/PageMarker";
import { PressableScale } from "@/components/pressable-scale";
import { PrimaryButton } from "@/components/primary-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  saveSettings,
  setOnboardingComplete,
  type AssignedSex,
  type UserSettings,
} from "@/data/settingsStorage";
import type { RootStackParamList } from "@/navigation/types";
import {
  sanitizeDecimal,
  sanitizeInteger,
  validateAge,
  validateBodyweight,
  validateHeight,
  validateName,
} from "@/utils/validation";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SEX_OPTIONS: { label: string; value: AssignedSex }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "unspecified" },
];

const TOTAL_STEPS = 6;

export default function OnboardingScreen() {

  const { colorScheme } = useTheme();
  const theme = Colors[colorScheme];

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Onboarding">>();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [assignedSex, setAssignedSex] = useState<AssignedSex>("unspecified");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [units, setUnits] = useState<"lbs" | "kg">("lbs");

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [step, fade]);

  // Returns an error message for the current step, or null when it can advance.
  function validateStep(): string | null {
    if (step === 1) return validateName(name);
    if (step === 3) return validateAge(age);
    if (step === 4) return validateHeight(height);
    if (step === 5) return validateBodyweight(bodyweight);
    return null;
  }

  async function finish() {
    const settings: UserSettings = {
      name: name.trim() || "Athlete",
      assignedSex,
      age: age.trim(),
      height: height.trim() || "Not set",
      bodyweight: bodyweight.trim() || "0",
      units,
    };

    await saveSettings(settings);
    await setOnboardingComplete(true);

    navigation.replace("Tabs");
  }

  function next() {
    const problem = validateStep();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  }

  function back() {
    setError(null);
    if (step > 0) setStep(step - 1);
  }

  const inputStyle = [
    styles.input,
    { color: theme.text, borderColor: theme.icon },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <PageMarker id="onboarding" name="Onboarding" description="First-run profile setup flow" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ThemedView style={styles.screen}>

        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index <= step ? theme.tint : theme.card,
                  width: index === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View style={[styles.content, { opacity: fade }]}>

          {step === 0 && (
            <View style={styles.block}>
              <View
                style={[styles.brandMark, { backgroundColor: theme.tint }]}
              >
                <ThemedText style={styles.brandMarkText}>
                  FT
                </ThemedText>
              </View>
              <ThemedText style={styles.heading}>
                Welcome to your training log
              </ThemedText>
              <ThemedText style={styles.body}>
                Build splits, track every set, and watch your
                strength trend over time. Let us set up your profile
                so your numbers are personalized.
              </ThemedText>
            </View>
          )}

          {step === 1 && (
            <View style={styles.block}>
              <ThemedText style={styles.heading}>
                What should we call you
              </ThemedText>
              <TextInput
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (error) setError(null);
                }}
                placeholder="Your name"
                placeholderTextColor={theme.icon}
                autoFocus
                style={inputStyle}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.block}>
              <ThemedText style={styles.heading}>
                Assigned sex at birth
              </ThemedText>
              <ThemedText style={styles.body}>
                This helps make strength and calorie estimates
                more accurate. You can change it later.
              </ThemedText>
              <View style={styles.optionsWrap}>
                {SEX_OPTIONS.map((option) => {
                  const selected = assignedSex === option.value;
                  return (
                    <PressableScale
                      key={option.value}
                      onPress={() => setAssignedSex(option.value)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: selected ? theme.tint : theme.card,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: selected ? "#ffffff" : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        {option.label}
                      </ThemedText>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.block}>
              <ThemedText style={styles.heading}>
                How old are you
              </ThemedText>
              <TextInput
                value={age}
                onChangeText={(t) => {
                  setAge(sanitizeInteger(t));
                  if (error) setError(null);
                }}
                placeholder="Age in years"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                autoFocus
                style={inputStyle}
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.block}>
              <ThemedText style={styles.heading}>
                How tall are you
              </ThemedText>
              <TextInput
                value={height}
                onChangeText={(t) => {
                  setHeight(t);
                  if (error) setError(null);
                }}
                placeholder="For example 5'9 or 175cm"
                placeholderTextColor={theme.icon}
                autoFocus
                style={inputStyle}
              />
            </View>
          )}

          {step === 5 && (
            <View style={styles.block}>
              <ThemedText style={styles.heading}>
                Your current bodyweight
              </ThemedText>
              <TextInput
                value={bodyweight}
                onChangeText={(t) => {
                  setBodyweight(sanitizeDecimal(t));
                  if (error) setError(null);
                }}
                placeholder="Bodyweight"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
                autoFocus
                style={inputStyle}
              />
              <View style={styles.unitsRow}>
                {(["lbs", "kg"] as const).map((unit) => {
                  const selected = units === unit;
                  return (
                    <PressableScale
                      key={unit}
                      onPress={() => setUnits(unit)}
                      style={[
                        styles.unitButton,
                        {
                          backgroundColor: selected ? theme.tint : theme.card,
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: selected ? "#ffffff" : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        {unit}
                      </ThemedText>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          )}

        </Animated.View>

        <View style={styles.footer}>
          {error ? (
            <ThemedText style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <PrimaryButton
            label={step === TOTAL_STEPS - 1 ? "Start training" : "Continue"}
            onPress={next}
          />

          {step > 0 ? (
            <Pressable style={styles.backButton} onPress={back}>
              <ThemedText style={{ color: theme.icon }}>
                Back
              </ThemedText>
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
        </View>

      </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  progressRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "center",
    paddingVertical: Spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: Radius.pill,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  block: {
    gap: Spacing.lg,
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  brandMarkText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    fontSize: 20,
  },
  optionsWrap: {
    gap: Spacing.md,
  },
  option: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  unitsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  unitButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  footer: {
    gap: Spacing.sm,
  },
  error: {
    color: "#c0392b",
    textAlign: "center",
  },
  backButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
