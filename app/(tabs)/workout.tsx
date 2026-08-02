import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useWorkouts } from "@/context/WorkoutContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

function generateId() {
  return Date.now().toString();
}

export default function WorkoutScreen() {
  const colorScheme = useColorScheme();

  const {
    workouts,
    addWorkout,
    deleteWorkout,
  } = useWorkouts();

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText>
        Workout Screen
      </ThemedText>

      {workouts.map((workout) => (

        <Pressable
          key={workout.id}
          style={[
            styles.outerCard,
            {
              backgroundColor:
                Colors[colorScheme ?? "light"].background,
            },
          ]}
          onPress={() =>
            router.push({
              pathname: "/workout/[split]",
              params: {
                split: workout.id,
              },
            })
          }
        >

          <ThemedView
            style={[
              styles.innerCard,
              {
                backgroundColor:
                  Colors[colorScheme ?? "light"].card,
              },
            ]}
          >

            <ThemedView style={styles.cardContent}>

              <ThemedView>

                <ThemedText style={styles.workoutName}>
                  {workout.name}
                </ThemedText>

                <ThemedText style={styles.subtitle}>
                  {workout.exercises.length} exercises
                </ThemedText>

              </ThemedView>

              <ThemedView style={styles.actions}>

                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();

                    router.push({
                      pathname: "/edit-workout/[split]",
                      params: {
                        split: workout.id,
                      },
                    });
                  }}
                >
                  <ThemedText>
                    ✏️
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();

                    deleteWorkout(workout.id);
                  }}
                >
                  <ThemedText>
                    ❌
                  </ThemedText>
                </Pressable>

              </ThemedView>

            </ThemedView>

          </ThemedView>

        </Pressable>

      ))}

      <Pressable
        style={styles.addButton}
        onPress={() => {

          const newWorkout = {
            id: generateId(),
            name: "New Split",
            exercises: [],
          };

          addWorkout(newWorkout);

          router.push({
            pathname: "/edit-workout/[split]",
            params: {
              split: newWorkout.id,
            },
          });

        }}
      >

        <ThemedText>
          + Add Split
        </ThemedText>

      </Pressable>

    </ThemedView>
  );
}

const styles = StyleSheet.create({

  outerCard: {
    width: "85%",
    padding: 8,
    marginVertical: 10,
    borderRadius: 16,
  },

  innerCard: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  cardContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  workoutName: {
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 5,
    opacity: 0.6,
  },

  actions: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },

  addButton: {
    width: "80%",
    padding: 20,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "#0a7ea4",
    alignItems: "center",
  },

});