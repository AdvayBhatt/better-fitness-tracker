import { PrimaryButton } from "@/components/primary-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type InputModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  initialValue?: string;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  confirmText?: string;
  // Strips unwanted characters as the user types (for example non digits).
  sanitize?: (value: string) => string;
  // Returns an error message when the value is invalid, or null when valid.
  validate?: (value: string) => string | null;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

export function InputModal({
  visible,
  title,
  message,
  initialValue = "",
  placeholder,
  keyboardType = "default",
  confirmText = "Save",
  sanitize,
  validate,
  onSubmit,
  onCancel,
}: InputModalProps) {

  const { colorScheme } = useTheme();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  // Reseed the field each time the modal opens so it reflects current data.
  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setError(null);
    }
  }, [visible, initialValue]);

  function handleChange(next: string) {
    setValue(sanitize ? sanitize(next) : next);
    if (error) setError(null);
  }

  function handleSubmit() {
    const problem = validate ? validate(value) : null;
    if (problem) {
      setError(problem);
      return;
    }
    onSubmit(value);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ThemedView style={styles.card}>

          <ThemedText style={styles.title}>
            {title}
          </ThemedText>

          {message ? (
            <ThemedText style={styles.message}>
              {message}
            </ThemedText>
          ) : null}

          <TextInput
            value={value}
            onChangeText={handleChange}
            placeholder={placeholder}
            placeholderTextColor={Colors[colorScheme].icon}
            keyboardType={keyboardType}
            autoFocus
            style={[
              styles.input,
              {
                color: Colors[colorScheme].text,
                borderColor: error
                  ? "#c0392b"
                  : Colors[colorScheme].icon,
              },
            ]}
            onSubmitEditing={handleSubmit}
          />

          {error ? (
            <ThemedText style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <PrimaryButton
            label={confirmText}
            onPress={handleSubmit}
          />

          <Pressable
            style={styles.cancel}
            onPress={onCancel}
          >
            <ThemedText>
              Cancel
            </ThemedText>
          </Pressable>

        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    width: "85%",
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    gap: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  message: {
    opacity: 0.7,
  },
  error: {
    color: "#c0392b",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    fontSize: 18,
  },
  cancel: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
});
