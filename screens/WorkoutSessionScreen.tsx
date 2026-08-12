import { ConfirmModal } from "@/components/ConfirmModal";
import PageMarker from "@/components/PageMarker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWorkouts } from "@/context/WorkoutContext";
import { useWorkoutSession } from "@/context/WorkoutSessionContext";
import type { RootStackParamList } from "@/navigation/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";

import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



export default function WorkoutSession() {

  const { split } =
    useRoute<RouteProp<RootStackParamList, "WorkoutSession">>().params ?? {};

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "WorkoutSession">>();

  const { workouts } = useWorkouts();

  const [showCancelModal,setShowCancelModal] = useState(false);

const {
  sessionWorkout,
  startWorkout,
  finishWorkout,
  cancelWorkout,
  currentExerciseIndex,
  activeWorkout,
  updateSet,
    loadingActiveWorkout,

  updateTimer,
} = useWorkoutSession();

const exerciseDuration =
  activeWorkout?.currentExerciseDuration ?? 0;


const currentSetDuration =
  activeWorkout?.currentSetDuration ?? 0;

  const { colorScheme } = useTheme();

const workout =
  activeWorkout
    ? sessionWorkout
    : workouts.find(
        item => item.id === split
      );


  const [currentWeight,setCurrentWeight] =
    useState<number | null>(null);


  const [currentReps,setCurrentReps] =
    useState<number | null>(null);



  const [showCompleteModal,setShowCompleteModal]
    = useState(false);


const hasStarted = !!activeWorkout;


const [isTimerRunning,setIsTimerRunning]
  = useState(false);

const [isSetTimerRunning,setIsSetTimerRunning]
  = useState(false);

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


  const timer = setInterval(()=>{

  console.log("TIMER TICK");

  if(isTimerRunning){

    console.log("MAIN TIMER RUNNING");

    updateTimer({
      elapsedSeconds:
        (activeWorkout?.elapsedSeconds ?? 0) + 1,

      currentExerciseDuration:
        (activeWorkout?.currentExerciseDuration ?? 0) + 1,
    });

  }


  if(isSetTimerRunning){

    console.log("SET TIMER RUNNING");

    updateTimer({
      currentSetDuration:
        (activeWorkout?.currentSetDuration ?? 0) + 1,
    });

  }

},1000);


  return()=>clearInterval(timer);


},[
  isTimerRunning,
  isSetTimerRunning,
  activeWorkout,
]);


if (loadingActiveWorkout) {
  return (
    <ThemedView style={[styles.safeArea, styles.centered]}>
      <ActivityIndicator
        size="large"
        color={Colors[colorScheme ?? "light"].tint}
      />
      <ThemedText style={styles.centeredText}>
        Loading your workout
      </ThemedText>
    </ThemedView>
  );
}

  if(!workout || !foundExercise){

    return(
      <ThemedView style={[styles.safeArea, styles.centered]}>
        <ThemedText style={styles.centeredText}>
          We could not find that workout
        </ThemedText>
      </ThemedView>
    );

  }



  const currentWorkout = workout;
  const currentExercise = foundExercise;


  const completedSets =
  activeWorkout?.exercises[currentExerciseIndex]
    ?.sets.filter(
      set => set.completed
    )
    .map(
      set => ({
        weight: set.weight,
        reps: set.reps,
        duration: set.duration ?? 0
      })
    ) ?? [];


  const exerciseComplete =
    currentExercise.type === "cardio"
      ? completedSets.length >= 1
      : completedSets.length >= currentExercise.sets;



async function handleStartWorkout(){

  if (!workout) return;

  if (!activeWorkout) {
    await startWorkout(workout);
  }
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



function completeSet() {

  if (!activeWorkout) return;


  const nextIncompleteSet =
    activeWorkout.exercises[
      currentExerciseIndex
    ].sets.findIndex(
      set => !set.completed
    );


  if (nextIncompleteSet === -1) {
    return;
  }

  updateSet(
  currentExerciseIndex,
  nextIncompleteSet,
  {
    completed: true,
    duration: currentSetDuration,
  }
);

  updateTimer({
    currentSetDuration: 0,
  });

  setIsTimerRunning(false);

  setIsSetTimerRunning(false);

}




  return (

    <SafeAreaView style={styles.safeArea}>

    <PageMarker id="workout-session" name="Workout Session" description="Active workout session, set-by-set tracking" />

    <ThemedView style={styles.screen}>


      <View style={styles.headerRow}>

        <Pressable
          onPress={() => {
            pauseTimer();
            navigation.goBack();
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



        {!activeWorkout && !hasStarted && (

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor:
                  Colors[colorScheme ?? "light"].tint,
              },
            ]}
            onPress={handleStartWorkout}          >

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
  style={[
    styles.completedSet,
    {
      backgroundColor:
        Colors[colorScheme ?? "light"].card,
    },
  ]}
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
          style={[
            styles.button,
            {
              backgroundColor:
                Colors[colorScheme ?? "light"].tint,
            },
          ]}
          disabled={exerciseComplete}
          onPress={completeSet}
        >

          <ThemedText style={styles.buttonText}>
            Complete Set
          </ThemedText>

        </Pressable>




        {exerciseComplete && (

        <Pressable
          style={[
            styles.button,
            {
              backgroundColor:
                Colors[colorScheme ?? "light"].tint,
            },
          ]}
          onPress={async()=>{


            if(
                currentExerciseIndex <
                currentWorkout.exercises.length - 1
              ){

                const next = currentExerciseIndex + 1;

                updateTimer({
                  currentExerciseIndex: next,
                  currentExerciseDuration: 0,
                  currentSetDuration: 0,
                });

                setIsTimerRunning(false);

                setIsSetTimerRunning(false);

              }
            else{

              pauseTimer();

              await finishWorkout();


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

        <Pressable
          style={[
            styles.button,
            {
              backgroundColor:
                Colors[colorScheme ?? "light"].tint,
            },
          ]}
          onPress={() => {
            setShowCancelModal(true);
          }}
        >
          <ThemedText style={styles.buttonText}>
            Cancel Workout
          </ThemedText>
        </Pressable>

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
              style={[
                styles.modalButton,
                {
                  backgroundColor:
                    Colors[colorScheme ?? "light"].tint,
                },
              ]}
              onPress={()=>{
                navigation.navigate("Tabs", { screen: "progress" });
              }}
            >

              <ThemedText style={styles.buttonText}>
                View Progress
              </ThemedText>

            </Pressable>


          </ThemedView>

        </View>

      </Modal>

      <ConfirmModal
      visible={showCancelModal}

      title="Discard Workout?"

      message="All progress from this session will be lost."

      confirmText="Discard"

      onConfirm={async () => {
        await cancelWorkout();
        setShowCancelModal(false);
        navigation.navigate("Tabs", { screen: "workout" });
      }}

      onCancel={() => {
        setShowCancelModal(false);
      }}
    />


    </ThemedView>

  </SafeAreaView>

  );

}



const styles=StyleSheet.create({

safeArea:{
 flex:1,
},

centered:{
  alignItems:"center",
  justifyContent:"center",
  gap:12,
},

centeredText:{
  opacity:0.7,
},

screen:{
  flex:1,
},

container:{
 flexGrow:1,
 alignItems:"center",
 gap:15,
 paddingHorizontal:20,
 paddingBottom:40,
 paddingTop:20,
},

title:{
  fontSize:28,
  textAlign:"center",
  fontWeight:"bold",
  lineHeight:36,
  paddingTop:4,
},

exercise:{
 fontSize:22,
},

button:{
 padding:15,
 borderRadius:10,
},

headerRow:{
  width:"100%",
  flexDirection:"row",
  alignItems:"center",
  justifyContent:"center",
  marginTop:10,
  marginBottom:25,
},



backButton:{
  position:"absolute",
  left:20,
  width:40,
  height:40,
  justifyContent:"center",
  alignItems:"center",
},


backText:{
  fontSize:32,
  lineHeight:32,
  transform:[{translateY:5}],
},

completedSet:{
  flexDirection:"row",
  justifyContent:"space-between",
  width:"100%",
  padding:12,
  borderRadius:10,
},


buttonText:{
 color:"white",
 fontWeight:"bold",
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
  alignItems:"center",
},

});
