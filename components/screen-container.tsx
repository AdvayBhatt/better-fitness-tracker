import { ThemedView } from "@/components/themed-view";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenContainerProps = {
  children: React.ReactNode;
};

export function ScreenContainer({
  children,
}: ScreenContainerProps) {

  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        {children}
      </ScrollView>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal:20,
  },
  scrollContent:{
    paddingBottom:40,
  },
});
