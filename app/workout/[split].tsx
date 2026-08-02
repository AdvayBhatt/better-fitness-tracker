import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useWorkouts } from "@/context/WorkoutContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplitScreen() {

  const { split } = useLocalSearchParams();
  const router = useRouter();

  const { workouts } = useWorkouts();


  const workout = workouts.find(
    item => item.id === split
  );


  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.screen}>
          <ThemedText>
            Workout not found
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={styles.safeArea}>

      <ThemedView style={styles.screen}>

        <ScrollView
          contentContainerStyle={styles.container}
        >


          <View style={styles.headerRow}>

              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <ThemedText style={styles.backText}>
                  ←
                </ThemedText>
              </Pressable>


              <ThemedText style={styles.title}>
                {workout.name} Session
              </ThemedText>


              <View style={styles.headerSpacer} />

            </View>



          {workout.exercises.map((exercise,index)=>(

            <ThemedView
              key={exercise.instanceId ?? `${exercise.id}-${index}`}
              style={styles.exerciseCard}
            >


              <ThemedText style={styles.exerciseName}>
                {exercise.name}
              </ThemedText>



              {exercise.type === "cardio" ? (

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

              ) : (

                <>

                  <ThemedText>
                    {exercise.sets} sets × {exercise.reps} reps
                  </ThemedText>


                  <ThemedText>
                    {exercise.weight} lbs
                  </ThemedText>

                </>

              )}


            </ThemedView>

          ))}



          <Pressable
            style={styles.startButton}
            onPress={() =>
              router.push(`/workout/session?split=${split}`)
            }
          >

            <ThemedText style={styles.buttonText}>
              Start Session
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


  screen:{
    flex:1,
  },


  container:{
    paddingHorizontal:20,
    paddingTop:20,
    paddingBottom:40,
    alignItems:"center",
  },


  title:{
    fontSize:26,
    fontWeight:"bold",
    marginBottom:25,
    textAlign:"center",
  },


  exerciseCard:{
    width:"100%",
    padding:16,
    marginBottom:12,
    borderRadius:12,
  },

  headerRow:{
  width:"100%",
  flexDirection:"row",
  alignItems:"center",
  justifyContent:"space-between",
  marginBottom:25,
},


backButton:{
  width:40,
  height:40,
  justifyContent:"center",
},


backText:{
  fontSize:32,
},


headerSpacer:{
  width:40,
},


  exerciseName:{
    fontSize:18,
    fontWeight:"600",
    marginBottom:8,
  },


  startButton:{
    marginTop:20,
    paddingVertical:15,
    paddingHorizontal:40,
    borderRadius:12,
    backgroundColor:"#0a7ea4",
  },


  buttonText:{
    color:"white",
    fontWeight:"bold",
  },

});