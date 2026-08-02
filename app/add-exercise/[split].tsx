import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWorkouts } from "@/context/WorkoutContext";
import { exercises as availableExercises } from "@/data/exercises";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
} from "react-native";

export default function EditSplit() {
  const { split } = useLocalSearchParams();

  const { workouts, updateWorkout } = useWorkouts();

  const workout = workouts.find(
    item => item.id === split
  );

  const [selectedExercise, setSelectedExercise] = useState("");

  if (!workout) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>
          Split not found
        </ThemedText>
      </ThemedView>
    );
  }


  const [exercises, setExercises] = useState(
    workout.exercises
  );


  function addExercise() {

    const exercise = availableExercises.find(
      item => item.id === selectedExercise
    );


    if (!exercise) return;


    setExercises([
      ...exercises,
      {
        ...exercise,
        instanceId: crypto.randomUUID(),
      },
    ]);


    setSelectedExercise("");

  }



  return (
    <ThemedView style={styles.container}>

      <ThemedText style={styles.title}>
        Edit Split
      </ThemedText>


      <ThemedText style={styles.section}>
        Exercises
      </ThemedText>


      {exercises.map((exercise,index)=>(

        <ThemedView
          key={exercise.instanceId ?? `${exercise.id}-${index}`}
          style={styles.exerciseRow}
        >

          <ThemedText>
            {exercise.name}
          </ThemedText>


          <Pressable
            onPress={()=>{
              setExercises(
                exercises.filter(
                  (_,i)=>i !== index
                )
              );
            }}
          >
            <ThemedText>
              ❌
            </ThemedText>

          </Pressable>


        </ThemedView>

      ))}



      <ThemedText style={styles.section}>
        Add Exercise
      </ThemedText>


      <Picker
        selectedValue={selectedExercise}
        onValueChange={(value)=>setSelectedExercise(value)}
      >

        <Picker.Item
          label="Select exercise"
          value=""
        />


        {availableExercises.map(exercise => (

          <Picker.Item
            key={exercise.id}
            label={exercise.name}
            value={exercise.id}
          />

        ))}


      </Picker>



      <Pressable
        style={styles.addButton}
        onPress={addExercise}
      >

        <ThemedText>
          + Add Exercise
        </ThemedText>

      </Pressable>



      <Pressable
        style={styles.saveButton}
        onPress={()=>{

          updateWorkout({
            ...workout,
            exercises,
          });

          router.back();

        }}
      >

        <ThemedText>
          Save Split
        </ThemedText>

      </Pressable>


    </ThemedView>
  );
}



const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:30,
    gap:20,
  },

  title:{
    fontSize:30,
    fontWeight:"bold",
  },

  section:{
    fontSize:20,
    marginTop:20,
  },

  exerciseRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    padding:15,
    borderRadius:10,
  },

  addButton:{
    padding:15,
    borderRadius:10,
    backgroundColor:"#0a7ea4",
    alignItems:"center",
  },

  saveButton:{
    padding:15,
    borderRadius:10,
    backgroundColor:"#0a7ea4",
    alignItems:"center",
    marginTop:20,
  },

});