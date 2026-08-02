import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWorkouts } from "@/context/WorkoutContext";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { saveWorkout } from "@/data/workoutStorage";


export default function WorkoutSession() {

  const { split } = useLocalSearchParams();

  const { workouts } = useWorkouts();


  const workout = workouts.find(
    item => item.id === split
  );


  const [completedSets,setCompletedSets] = useState<
    {
      weight:number;
      reps:number;
      duration:number;
    }[]
  >([]);


  const [completedExercises,setCompletedExercises] = useState<
    {
      exerciseName:string;
      sets:{
        weight:number;
        reps:number;
        duration:number;
      }[];
      totalDuration:number;
    }[]
  >([]);


  const [currentWeight,setCurrentWeight] =
    useState<number | null>(null);


  const [currentReps,setCurrentReps] =
    useState<number | null>(null);


  const [currentExerciseIndex,setCurrentExerciseIndex]
    = useState(0);


  const [showCompleteModal,setShowCompleteModal]
    = useState(false);


  const [hasStarted,setHasStarted]
    = useState(false);

  const [exerciseDuration,setExerciseDuration] = useState(0);

  const [totalWorkoutDuration,setTotalWorkoutDuration] = useState(0);


  const [isTimerRunning,setIsTimerRunning]
    = useState(false);

  const [isSetTimerRunning,setIsSetTimerRunning]
  = useState(false); // current set timer


  const [currentSetDuration,setCurrentSetDuration]
    = useState(0);



  const foundExercise =
    workout?.exercises[currentExerciseIndex];



  useEffect(()=>{

    if(foundExercise?.type === "strength"){

      setCurrentWeight(foundExercise.weight);
      setCurrentReps(foundExercise.reps);

    }

  },[foundExercise]);



 useEffect(()=>{

  if(!isTimerRunning && !isSetTimerRunning) return;


  const timer=setInterval(()=>{

    if(isTimerRunning){
      setExerciseDuration(prev=>prev+1);
      setTotalWorkoutDuration(prev=>prev+1);
    }


    if(isSetTimerRunning){
      setCurrentSetDuration(prev=>prev+1);
    }


  },1000);


  return()=>clearInterval(timer);


},[isTimerRunning,isSetTimerRunning]);



  if(!workout || !foundExercise){

    return(
      <ThemedView style={styles.safeArea}>
        <ThemedText>
          Workout not found
        </ThemedText>
      </ThemedView>
    );

  }



  const currentWorkout = workout;
  const currentExercise = foundExercise;



  const exerciseComplete =
    currentExercise.type === "cardio"
      ? completedSets.length >= 1
      : completedSets.length >= currentExercise.sets;



  function startWorkout(){

  setHasStarted(true);

  setIsTimerRunning(true);

  setIsSetTimerRunning(true);

}



  function pauseTimer(){

  setIsTimerRunning(false);
  setIsSetTimerRunning(false);

}



  function formatTime(seconds:number){

    const min=Math.floor(seconds/60);
    const sec=seconds%60;

    return `${min}:${sec.toString().padStart(2,"0")}`;

  }



  function completeSet(){

  const finishedSet = {
    weight:
      currentExercise.type==="strength"
        ? currentWeight ?? currentExercise.weight
        : 0,

    reps:
      currentExercise.type==="strength"
        ? currentReps ?? currentExercise.reps
        : 0,

    duration: currentSetDuration,
  };


  setCompletedSets(prev => [
    ...prev,
    finishedSet,
  ]);


  // reset ONLY set timer
  setCurrentSetDuration(0);


  // pause timer
  setIsTimerRunning(false);

  setIsSetTimerRunning(false);

}





  return (

    <ThemedView style={styles.safeArea}>

      <View style={styles.headerRow}>

        <Pressable
          onPress={() => {
            pauseTimer();
            router.back();
          }}
          style={styles.backButton}
        >
          <ThemedText style={styles.backText}>
            ←
          </ThemedText>
        </Pressable>


        <ThemedText style={styles.title}>
          {currentWorkout.name} Session
        </ThemedText>


        <View style={styles.headerSpacer} />

      </View>


      <ScrollView
        contentContainerStyle={styles.container}
      >



        <Pressable
          onPress={()=>{

            if(!hasStarted) return;

            if(isTimerRunning){

                    setIsTimerRunning(false);
                    setIsSetTimerRunning(false);

                  }
                  else{

                    setIsTimerRunning(true);
                    setIsSetTimerRunning(true);

                  }

          }}
        >

          <ThemedText>
            {isTimerRunning ? "⏸" : "▶️"} {formatTime(exerciseDuration)}
          </ThemedText>

        </Pressable>



        {!hasStarted && (

          <Pressable
            style={styles.button}
            onPress={startWorkout}
          >

            <ThemedText style={styles.buttonText}>
              Start Workout
            </ThemedText>

          </Pressable>

        )}



        {hasStarted && (

        <>


        <ThemedText style={styles.exercise}>
          {currentExercise.name}
        </ThemedText>



        <ThemedText>
          Exercise {currentExerciseIndex+1}/
          {currentWorkout.exercises.length}
        </ThemedText>



        {currentExercise.type==="strength" ? (

        <>

        <ThemedText>
          Weight
        </ThemedText>


        <ThemedText>
          {currentWeight} lbs
        </ThemedText>


        <ThemedText>
          Reps: {currentReps}
        </ThemedText>

        </>

        ) : (

        <>

        <ThemedText>
          Time: {currentExercise.time} min
        </ThemedText>


        <ThemedText>
          Distance: {currentExercise.miles} mi
        </ThemedText>


        <ThemedText>
          Resistance: {currentExercise.resistance}
        </ThemedText>


        <ThemedText>
          Incline: {currentExercise.incline}
        </ThemedText>


        </>

        )}



        <ThemedText>
  Completed: {completedSets.length}/
  {
    currentExercise.type==="strength"
      ? currentExercise.sets
      : 1
  }
</ThemedText>


{completedSets.map((set, index) => (
 <ThemedView
  key={index}
  style={styles.completedSet}
>

  <ThemedText>
    Set {index + 1}
  </ThemedText>

  <ThemedText>
    {set.weight} lbs x {set.reps} reps
  </ThemedText>

  <ThemedText>
    {formatTime(set.duration)}
  </ThemedText>

</ThemedView>
))}



        <Pressable
          style={styles.button}
          disabled={exerciseComplete}
          onPress={completeSet}
        >

          <ThemedText style={styles.buttonText}>
            Complete Set
          </ThemedText>

        </Pressable>




        {exerciseComplete && (

        <Pressable
          style={styles.button}
          onPress={async()=>{


            if(
              currentExerciseIndex <
              currentWorkout.exercises.length-1
            ){

              setCompletedExercises(prev => [
                ...prev,
                {
                  exerciseName: currentExercise.name,
                  sets: completedSets,
                  totalDuration: exerciseDuration,
                }
              ]);

              setCurrentExerciseIndex(prev => prev + 1);

              setCompletedSets([]);

              setExerciseDuration(0);

              setCurrentSetDuration(0);

              setIsTimerRunning(false);

              setIsSetTimerRunning(false);


            }
            else{

              pauseTimer();

              await saveWorkout({

                id:Date.now().toString(),

                workoutName:currentWorkout.name,

                date:new Date().toISOString(),

                duration: totalWorkoutDuration,

                exercises:[
                  ...completedExercises,
                  {
                    exerciseName: currentExercise.name,
                    sets: completedSets,
                    totalDuration: exerciseDuration,
                  }
                ]

              });
              console.log(
                "SAVED WORKOUTS:",
                JSON.stringify(workouts,null,2)
              );


              setShowCompleteModal(true);

            }


          }}
        >

          <ThemedText style={styles.buttonText}>
            {
              currentExerciseIndex <
              currentWorkout.exercises.length-1
                ? "Next Exercise"
                : "Finish Workout"
            }
          </ThemedText>

        </Pressable>

        )}



        </>

        )}

      </ScrollView>



      <Modal
        visible={showCompleteModal}
        transparent
      >

        <View style={styles.modalContainer}>

          <ThemedView style={styles.modalCard}>

            <ThemedText style={styles.modalTitle}>
              🎉 Workout Complete!
            </ThemedText>


            <Pressable
              style={styles.modalButton}
              onPress={()=>{
                router.replace("/progress");
              }}
            >

              <ThemedText style={styles.buttonText}>
                View Progress
              </ThemedText>

            </Pressable>


          </ThemedView>

        </View>

      </Modal>


    </ThemedView>

  );

}



const styles=StyleSheet.create({

safeArea:{
 flex:1,
},

container:{
 flexGrow:1,
 justifyContent:"center",
 alignItems:"center",
 gap:15,
 padding:20,
},

title:{
  fontSize:28,
  flex:1,
  textAlign:"center",
},

exercise:{
 fontSize:22,
},

button:{
 padding:15,
 borderRadius:10,
 backgroundColor:"#0a7ea4",
},

headerRow:{
  flexDirection:"row",
  alignItems:"center",
  paddingHorizontal:20,
  paddingTop:15,
},



backButton:{
  width:40,
  height:40,
  justifyContent:"center",
},


backText:{
  fontSize:32,
},

completedSet:{
  flexDirection:"row",
  justifyContent:"space-between",
  width:"100%",
  padding:10,
},


headerSpacer:{
  width:40,
},

buttonText:{
 color:"white",
},

modalContainer:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:"rgba(0,0,0,0.5)",
},

modalCard:{
  width:"80%",
  padding:30,
  borderRadius:20,
  alignItems:"center",
  gap:20,
},

modalTitle:{
  fontSize:26,
  textAlign:"center",
},

modalButton:{
  width:"100%",
  padding:15,
  borderRadius:10,
  backgroundColor:"#0a7ea4",
  alignItems:"center",
},

});