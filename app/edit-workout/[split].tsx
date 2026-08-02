import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useWorkouts } from "@/context/WorkoutContext";
import { exercises as availableExercises } from "@/data/exercises";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";


function generateInstanceId(){
  return `${Date.now()}-${Math.random()}`;
}


export default function EditSplit() {

  const { split } =
    useLocalSearchParams<{ split:string }>();

  const { colorScheme } = useTheme();


  const {
    workouts,
    updateWorkout,
  } = useWorkouts();



  const workout = workouts.find(
    item => item.id === split
  );



  const [name,setName] = useState(
    workout?.name === "New Split"
      ? ""
      : workout?.name ?? ""
  );


  const [exercises,setExercises] = useState(
    workout?.exercises ?? []
  );


  const [selectedExercise,setSelectedExercise] =
    useState("");



  useEffect(()=>{

    if(workout){

      const migratedExercises = workout.exercises.map(
        exercise => ({
          ...exercise,
          instanceId:
            exercise.instanceId ?? generateInstanceId(),
        })
      );

      setExercises(migratedExercises);

      const needsMigration =
        workout.exercises.some(
          exercise => !exercise.instanceId
        );

      if(needsMigration){
        updateWorkout({
          ...workout,
          exercises: migratedExercises,
        });
      }

      setName(
        workout.name === "New Split"
          ? ""
          : workout.name
      );

    }

  },[workout]);




  if(!workout){

    return(
      <ThemedView style={styles.container}>
        <ThemedText>
          Split not found
        </ThemedText>
      </ThemedView>
    );

  }


  const currentWorkout = workout;




  function addExercise(){

    const exercise =
      availableExercises.find(
        item => item.id === selectedExercise
      );


    if(!exercise) return;



    const updatedExercises = [

      ...exercises,

      {
        ...exercise,
        instanceId: generateInstanceId(),
      }

    ];



    setExercises(updatedExercises);



    setSelectedExercise("");

  }





  function removeExercise(index:number){

    const updatedExercises =
      exercises.filter(
        (_,i)=>i !== index
      );


    setExercises(updatedExercises);

  }





  return (

    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            Colors[colorScheme ?? "light"].background,
        },
      ]}
    >

      <ThemedView style={styles.flexContainer}>


        <ScrollView
          contentContainerStyle={styles.container}
        >


          <ThemedText style={styles.header}>
            Edit Split
          </ThemedText>



          <ThemedText>
            Split Name
          </ThemedText>



          <TextInput

            value={name}

            onChangeText={setName}

            placeholder="Split name"

            placeholderTextColor="#687076"

            style={[
              styles.input,
              {
                color:
                  Colors[colorScheme ?? "light"].text
              }
            ]}

          />




          <ThemedText style={styles.section}>
            Exercises
          </ThemedText>




          {exercises.map((exercise,index)=>(


            <ThemedView

              key={exercise.instanceId ?? `${exercise.id}-${index}`}

              style={styles.exerciseRow}

            >


              <ThemedView>


                <ThemedText style={styles.exerciseName}>
                  {exercise.name}
                </ThemedText>



                {exercise.type === "strength" ? (

                  <>

                    <ThemedText>
                      Sets: {exercise.sets}
                    </ThemedText>


                    <ThemedText>
                      Reps: {exercise.reps}
                    </ThemedText>


                    <ThemedText>
                      Weight: {exercise.weight} lbs
                    </ThemedText>

                  </>


                ) : (

                  <>

                    <ThemedText>
                      Time: {exercise.time} min
                    </ThemedText>


                    <ThemedText>
                      Distance: {exercise.miles} mi
                    </ThemedText>


                    <ThemedText>
                      Resistance: {exercise.resistance}
                    </ThemedText>


                    <ThemedText>
                      Incline: {exercise.incline}
                    </ThemedText>

                  </>

                )}


              </ThemedView>





              <Pressable

                onPress={()=>removeExercise(index)}

              >

                <ThemedText>
                  ❌
                </ThemedText>

              </Pressable>





              <Pressable

                onPress={()=>{

              


                  router.push({

                    pathname:"/edit-exercise/[id]",

                    params:{

                      id: exercise.instanceId,

                      workoutId: currentWorkout.id,

                    },

                  });


                }}

              >

                <ThemedText>
                  ✏️
                </ThemedText>

              </Pressable>




            </ThemedView>


          ))}




          <ThemedText style={styles.section}>
            Add Exercise
          </ThemedText>




          <Picker

            selectedValue={selectedExercise}

            onValueChange={
              value => setSelectedExercise(value)
            }

            itemStyle={{
              color:
                colorScheme === "dark"
                  ? "#ECEDEE"
                  : "#11181C"
            }}

          >

            <Picker.Item
              label="Select exercise"
              value=""
            />



            {availableExercises

              .filter(
                exercise =>
                  !exercises.some(
                    current =>
                      current.id === exercise.id
                  )
              )

              .map(exercise=>(

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

            <ThemedText style={styles.buttonText}>
              + Add Exercise
            </ThemedText>

          </Pressable>





          <Pressable

            style={styles.saveButton}

            onPress={()=>{


              updateWorkout({

                ...currentWorkout,

                name:
                  name.trim() || "Unnamed Split",

                exercises,

              });



              router.back();


            }}

          >

            <ThemedText style={styles.buttonText}>
              Save Split
            </ThemedText>


          </Pressable>



        </ScrollView>


      </ThemedView>


    </SafeAreaView>

  );

}





const styles = StyleSheet.create({

  safeArea:{
    flex:1,
  },


  flexContainer:{
    flex:1,
  },


  container:{
    paddingHorizontal:30,
    paddingTop:30,
    paddingBottom:50,
    gap:20,
  },


  header:{
    fontSize:22,
    fontWeight:"600",
    marginBottom:10,
  },


  section:{
    fontSize:20,
    marginTop:20,
  },


  input:{
    borderWidth:1,
    borderRadius:10,
    padding:12,
    fontSize:18,
  },


  exerciseRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
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


  exerciseName:{
    fontSize:18,
    fontWeight:"bold",
    marginBottom:5,
  },


  buttonText:{
    color:"white",
    fontWeight:"bold",
  },

});
