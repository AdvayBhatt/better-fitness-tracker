import PageMarker from "@/components/PageMarker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useWorkouts } from "@/context/WorkoutContext";
import type { RootStackParamList } from "@/navigation/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";


export default function EditExercise() {

  const {
    id,
    workoutId,
  } = useRoute<RouteProp<RootStackParamList, "EditExercise">>().params;


  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "EditExercise">>();


  const { colorScheme } = useTheme();


  const {
    workouts,
    updateWorkout,
  } = useWorkouts();



  const workout = workouts.find(
    item => item.id === workoutId
  );



  const exercise = workout?.exercises.find(
    item => item.instanceId === id
  );



  // All hooks are declared before any early return so hook call counts
  // stay constant across renders (rules of hooks).

  const [sets, setSets] = useState(
    exercise?.type === "strength"
      ? exercise.sets.toString()
      : ""
  );


  const [reps, setReps] = useState(
    exercise?.type === "strength"
      ? exercise.reps.toString()
      : ""
  );


  const [weight, setWeight] = useState(
    exercise?.type === "strength"
      ? exercise.weight.toString()
      : ""
  );


  const [time, setTime] = useState(
    exercise?.type === "cardio"
      ? exercise.time.toString()
      : ""
  );


  const [miles, setMiles] = useState(
    exercise?.type === "cardio"
      ? exercise.miles.toString()
      : ""
  );


  const [resistance, setResistance] = useState(
    exercise?.type === "cardio"
      ? exercise.resistance.toString()
      : ""
  );


  const [incline, setIncline] = useState(
    exercise?.type === "cardio"
      ? exercise.incline.toString()
      : ""
  );



  if (!workout || !exercise) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>
          Exercise not found
        </ThemedText>
      </ThemedView>
    );
  }



  function saveExercise() {

    if (!workout || !exercise) return;



    const updatedExercise =
      exercise.type === "cardio"
        ? {
            ...exercise,
            time: Number(time),
            miles: Number(miles),
            resistance: Number(resistance),
            incline: Number(incline),
          }

        : {
            ...exercise,
            sets: Number(sets),
            reps: Number(reps),
            weight: Number(weight),
          };



    updateWorkout({

      ...workout,

      exercises: workout.exercises.map(item =>
        item.instanceId === exercise.instanceId
          ? updatedExercise
          : item
      ),

    });



    navigation.goBack();

  }



  const inputColor =
    Colors[colorScheme ?? "light"].text;



  return (

    <ThemedView style={styles.container}>

      <PageMarker id="edit-exercise" name="Edit Exercise" description="Edit a single exercise's sets, reps, or weight" />

      <ThemedText style={styles.title}>
        {exercise.name}
      </ThemedText>



      {exercise.type === "cardio" ? (

        <>

          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="Minutes"
            placeholderTextColor={inputColor}
            keyboardType="numeric"
            style={[
              styles.input,
              {color:inputColor},
            ]}
          />


          <TextInput
            value={miles}
            onChangeText={setMiles}
            placeholder="Miles"
            placeholderTextColor={inputColor}
            keyboardType="numeric"
            style={[
              styles.input,
              {color:inputColor},
            ]}
          />


          <TextInput
            value={resistance}
            onChangeText={setResistance}
            placeholder="Resistance"
            placeholderTextColor={inputColor}
            keyboardType="numeric"
            style={[
              styles.input,
              {color:inputColor},
            ]}
          />


          <TextInput
            value={incline}
            onChangeText={setIncline}
            placeholder="Incline"
            placeholderTextColor={inputColor}
            keyboardType="numeric"
            style={[
              styles.input,
              {color:inputColor},
            ]}
          />

        </>


      ) : (

        <>

          <TextInput
            value={sets}
            onChangeText={setSets}
            placeholder="Sets"
            placeholderTextColor={inputColor}
            keyboardType="numeric"
            style={[
              styles.input,
              {color:inputColor},
            ]}
          />


          <TextInput
            value={reps}
            onChangeText={setReps}
            placeholder="Reps"
            placeholderTextColor={inputColor}
            keyboardType="numeric"
            style={[
              styles.input,
              {color:inputColor},
            ]}
          />


          <TextInput
            value={weight}
            onChangeText={setWeight}
            placeholder="Weight"
            placeholderTextColor={inputColor}
            keyboardType="numeric"
            style={[
              styles.input,
              {color:inputColor},
            ]}
          />

        </>

      )}



      <Pressable
        style={styles.saveButton}
        onPress={saveExercise}
      >

        <ThemedText
          style={
            colorScheme === "light"
              ? styles.buttonTextLight
              : undefined
          }
        >
          Save Exercise
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
    fontSize:26,
    fontWeight:"bold",
  },


  input:{
    borderWidth:1,
    borderRadius:10,
    padding:12,
    fontSize:18,
  },


  saveButton:{
    padding:15,
    borderRadius:10,
    backgroundColor:"#0a7ea4",
    alignItems:"center",
  },


  buttonTextLight:{
    color:"white",
  },

});
