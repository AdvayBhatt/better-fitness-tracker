import { ConfirmModal } from "@/components/ConfirmModal";
import PageMarker from "@/components/PageMarker";
import { PressableScale } from "@/components/pressable-scale";
import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useWorkouts } from "@/context/WorkoutContext";
import { useWorkoutSession } from "@/context/WorkoutSessionContext";
import type { RootStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

function generateId() {
  return Date.now().toString();
}

export default function WorkoutScreen() {

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { colorScheme } = useTheme();


  const {
    workouts,
    addWorkout,
    deleteWorkout,
  } = useWorkouts();

  const { 
    activeWorkout,
    cancelWorkout,
  } = useWorkoutSession();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resumeExercise =
  activeWorkout?.exercises[
    activeWorkout.currentExerciseIndex
  ];

  return (
    <ScreenContainer>

      <PageMarker id="workout" name="Workout" description="Workout list and splits" />

      <ThemedView style={styles.content}>

        <ThemedText style={styles.title}>
          Workout
        </ThemedText>

        {activeWorkout && (

  <ThemedView
    style={[
      styles.innerCard,
      {
        backgroundColor:
          Colors[colorScheme].card,
      },
    ]}
  >

    <ThemedText style={styles.workoutName}>
      Resume {activeWorkout.workoutName}
    </ThemedText>

    <ThemedText style={styles.subtitle}>
      Current: {resumeExercise?.name}
    </ThemedText>

    <ThemedText style={styles.subtitle}>
      Time: {Math.floor(activeWorkout.elapsedSeconds / 60)}:
      {(activeWorkout.elapsedSeconds % 60)
        .toString()
        .padStart(2,"0")}
    </ThemedText>


    <PressableScale
      style={[
        styles.addButton,
        {
          backgroundColor:
            Colors[colorScheme].tint,
        },
      ]}
      onPress={() => {

        navigation.navigate("WorkoutSession");

      }}
    >

      <ThemedText style={styles.addButtonText}>
        Resume Workout
      </ThemedText>

    </PressableScale>


  </ThemedView>

)}

        {workouts.length === 0 && !activeWorkout && (

          <ThemedView
            style={[
              styles.emptyState,
              {
                backgroundColor:
                  Colors[colorScheme].card,
              },
            ]}
          >

            <ThemedText style={styles.emptyTitle}>
              No splits yet
            </ThemedText>

            <ThemedText style={styles.emptyBody}>
              Create your first split to start building
              and tracking your workouts.
            </ThemedText>

          </ThemedView>

        )}

        {workouts.map((workout) => (

          <Pressable
            key={workout.id}
            style={styles.outerCard}
            onPress={() =>
              navigation.navigate("WorkoutSplit", {
                split: workout.id,
              })
            }
          >

            <ThemedView
              style={[
                styles.innerCard,
                {
                  backgroundColor:
                    Colors[colorScheme].card,
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

                      navigation.navigate("EditWorkout", {
                        split: workout.id,
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

                      setDeleteId(workout.id);

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



        <PressableScale
          style={[
            styles.addButton,
            {
              backgroundColor:
                Colors[colorScheme].tint,
            },
          ]}
          onPress={() => {


            const newWorkout = {

              id: generateId(),

              name: "New Split",

              exercises: [],

            };



            addWorkout(newWorkout);



            navigation.navigate("EditWorkout", {

              split: newWorkout.id,

            });


          }}
        >

          <ThemedText
            style={styles.addButtonText}
          >
            + Add Split
          </ThemedText>


        </PressableScale>


      </ThemedView>

      <ConfirmModal
        visible={deleteId !== null}

        title="Delete Workout?"

        message="This split and its exercises will be permanently removed."

        confirmText="Delete"

        onConfirm={async () => {

          if (!deleteId) return;

          if (
            activeWorkout &&
            activeWorkout.workoutId === deleteId
          ) {
            await cancelWorkout();
          }

          deleteWorkout(deleteId);

          setDeleteId(null);

        }}

        onCancel={() => {
          setDeleteId(null);
        }}
      />


    </ScreenContainer>
  );
}



const styles = StyleSheet.create({


  outerCard: {

    width: "85%",

    padding: 8,

    marginVertical: 10,

    borderRadius: 16,

  },



  title: {

    fontSize: 28,

    lineHeight: 36,

    fontWeight: "bold",

    marginBottom: 25,

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



  content: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    width: "100%",

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

    alignItems: "center",

  },



  addButtonText: {

    color: "#fff",

    fontWeight: "600",

  },



  emptyState: {

    width: "85%",

    padding: 24,

    borderRadius: 16,

    alignItems: "center",

    gap: 8,

  },



  emptyTitle: {

    fontSize: 18,

    fontWeight: "bold",

  },



  emptyBody: {

    textAlign: "center",

    opacity: 0.6,

  },


});