import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CompletedWorkout } from "@/data/workoutHistory";
import { getWorkouts } from "@/data/workoutStorage";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";


export default function ProgressScreen() {

  const [view, setView] =
    useState<"table" | "graph">("table");


  const [workouts, setWorkouts] =
    useState<CompletedWorkout[]>([]);



 useEffect(()=>{

    async function loadWorkouts(){

      const savedWorkouts =
        await getWorkouts();




      setWorkouts(savedWorkouts);

    }

    loadWorkouts();

  },[]);



  function formatTime(seconds:number){

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;


    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2,"0")}`;

  }



  return (

    <ThemedView style={styles.container}>


      <ThemedText style={styles.title}>
        Progress
      </ThemedText>



      <ThemedView style={styles.toggleContainer}>


        <Pressable
          style={[
            styles.toggleButton,
            view === "table" && styles.activeButton,
          ]}
          onPress={() => setView("table")}
        >

          <ThemedText style={styles.buttonText}>
            Table
          </ThemedText>

        </Pressable>



        <Pressable
          style={[
            styles.toggleButton,
            view === "graph" && styles.activeButton,
          ]}
          onPress={() => setView("graph")}
        >

          <ThemedText style={styles.buttonText}>
            Graph
          </ThemedText>

        </Pressable>


      </ThemedView>





      {view === "table" ? (

        <ScrollView>


        {workouts.map((workout)=>(


          <ThemedView
            key={workout.id}
            style={styles.card}
          >


            <ThemedText style={styles.header}>
              {workout.workoutName}
            </ThemedText>



            <ThemedText>
              Date: {new Date(workout.date)
                .toLocaleDateString()}
            </ThemedText>



            <ThemedText>
              Duration: {formatTime(workout.duration)}
            </ThemedText>





            {workout.exercises.map((exercise)=>(


              <ThemedView
                key={exercise.exerciseName}
                style={styles.exerciseCard}
              >


                <ThemedText style={styles.exerciseTitle}>
                  {exercise.exerciseName}
                </ThemedText>



                <ThemedText>
                  Weight: {exercise.sets[0]?.weight ?? 0} lbs
                </ThemedText>



                <ThemedText>
                  Sets: {exercise.sets.length}
                </ThemedText>



                <ThemedText>
                  Exercise Time: {formatTime(exercise.totalDuration)}
                </ThemedText>



                {exercise.sets.map((set,index)=>(


                  <ThemedText key={index}>

                    Set {index + 1}:{" "}
                    {set.weight} lbs × {set.reps} reps{" "}
                    ({formatTime(set.duration)})

                  </ThemedText>


                ))}



              </ThemedView>


            ))}



          </ThemedView>


        ))}


        </ScrollView>



      ) : (


        <ThemedView style={styles.card}>


          <ThemedText style={styles.header}>
            Strength Progress
          </ThemedText>


          <ThemedText>
            Graphs will appear here.
          </ThemedText>


        </ThemedView>


      )}



    </ThemedView>

  );

}





const styles = StyleSheet.create({


  container:{
    flex:1,
    padding:20,
    gap:20,
  },


  title:{
    fontSize:28,
  },


  toggleContainer:{
    flexDirection:"row",
    gap:10,
  },


  toggleButton:{
    paddingVertical:10,
    paddingHorizontal:25,
    borderRadius:10,
    backgroundColor:"#555",
  },


  activeButton:{
    backgroundColor:"#0a7ea4",
  },


  buttonText:{
    color:"white",
  },


  card:{
    padding:20,
    borderRadius:12,
    gap:10,
    marginBottom:20,
  },


  header:{
    fontSize:20,
    fontWeight:"bold",
  },


  exerciseCard:{
    padding:15,
    borderRadius:10,
    gap:5,
    marginTop:15,
  },


  exerciseTitle:{
    fontSize:18,
    fontWeight:"bold",
  },


});