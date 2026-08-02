import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { CompletedWorkout } from "@/data/workoutHistory";
import { getWorkouts } from "@/data/workoutStorage";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-gifted-charts";


export default function ProgressScreen() {

  const [view, setView] =
    useState<"table" | "graph">("table");

  const { colorScheme } = useTheme();


  const [selectedExercise, setSelectedExercise] =
    useState<string>("");


  const [metric, setMetric] =
    useState<
      "weight" | "reps" | "volume" | "strength"
    >("weight");
  
  const [selectedSplit, setSelectedSplit] =
    useState<string>("All");


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

const filteredWorkouts =
  selectedSplit === "All"
    ? workouts
    : workouts.filter(
        workout =>
          (workout.split ?? workout.workoutName)
          === selectedSplit
      );


const filteredExerciseNames = Array.from(
  new Set(
    filteredWorkouts.flatMap(workout =>
      workout.exercises.map(
        exercise => exercise.exerciseName
      )
    )
  )
);


const splitNames = Array.from(
  new Set(
    workouts.map(
      workout =>
        workout.split ?? workout.workoutName
    )
  )
);


  useEffect(()=>{

  if(
    filteredExerciseNames.length > 0 &&
    !filteredExerciseNames.includes(selectedExercise)
  ){
    setSelectedExercise(filteredExerciseNames[0]);
  }

},[
  filteredExerciseNames,
  selectedExercise
]);


  const graphData = selectedExercise
    ? [...filteredWorkouts]
        .sort(
          (a,b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
        .map(workout=>{

          const exercise =
            workout.exercises.find(
              item =>
                item.exerciseName === selectedExercise
            );


          if(!exercise){
            return null;
          }


          const weights =
            exercise.sets.map(set => set.weight);

          const reps =
            exercise.sets.map(set => set.reps);

          const epleyValues =
            exercise.sets.map(
              set => set.weight * (1 + set.reps / 30)
            );


          const value =
            metric === "weight"
              ? weights.length > 0
                ? Math.max(...weights)
                : 0

              : metric === "reps"
              ? reps.length > 0
                ? Math.max(...reps)
                : 0

              : metric === "volume"
              ? exercise.sets.reduce(
                  (total,set)=>
                    total + (set.weight * set.reps),
                  0
                )

              : epleyValues.length > 0
              ? Math.max(...epleyValues)
              : 0;


          return {
            date:
              new Date(workout.date)
              .toLocaleDateString(
                undefined,
                {
                  month:"short",
                  day:"numeric",
                }
              ),

            value,
          };


        })
        .filter(
          (
            item
          ): item is {date:string; value:number} =>
            item !== null
        )

    : [];


    const exerciseStats = selectedExercise
  ? [...filteredWorkouts]
      .sort(
        (a,b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .map(workout => {

        const exercise =
          workout.exercises.find(
            item =>
              item.exerciseName === selectedExercise
          );

        return exercise
          ? {
              date: workout.date,
              sets: exercise.sets,
            }
          : null;

      })
      .filter(
        (
          item
        ): item is {date:string; sets:any[]} =>
          item !== null
      )
  : [];


  const totalVolume =
  exerciseStats.reduce(
    (total, workout) =>
      total +
      workout.sets.reduce(
        (sum,set)=>
          sum + set.weight * set.reps,
        0
      ),
    0
  );


const allWeights =
  exerciseStats.flatMap(
    workout =>
      workout.sets.map(
        set => set.weight
      )
  );


const bestWeight =
  allWeights.length > 0
    ? Math.max(...allWeights)
    : 0;


const allEpleyValues =
  exerciseStats.flatMap(
    workout =>
      workout.sets.map(
        set =>
          set.weight *
          (1 + set.reps / 30)
      )
  );


const bestEpley1RM =
  allEpleyValues.length > 0
    ? Math.max(...allEpleyValues)
    : 0;


const sessionCount =
  exerciseStats.length;


const lastTrained =
  exerciseStats.length > 0
    ? new Date(
        exerciseStats[
          exerciseStats.length - 1
        ].date
      ).toLocaleDateString()
    : "";


const metricUnit =
  metric === "reps"
    ? "reps"
    : metric === "volume"
    ? "lb-reps"
    : "lbs";


const currentMetricValue =
  graphData.length > 0
    ? graphData[graphData.length - 1].value
    : null;


const previousMetricValue =
  graphData.length > 1
    ? graphData[graphData.length - 2].value
    : null;


const trendPercent =
  currentMetricValue !== null &&
  previousMetricValue !== null &&
  previousMetricValue !== 0
    ? (
        (currentMetricValue - previousMetricValue) /
        previousMetricValue
      ) * 100
    : null;





  return (

     <ScreenContainer>


      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >


        <ThemedText style={styles.title}>
          Progress
        </ThemedText>




        <ThemedView
          style={[
            styles.toggleContainer,
            {
              backgroundColor: Colors[colorScheme].background,
            },
          ]}
        >


          <Pressable
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  view === "table"
                    ? Colors[colorScheme].tint
                    : Colors[colorScheme].card,
              },
            ]}
            onPress={() => setView("table")}
          >
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color:
                    view === "table"
                      ? Colors[colorScheme].background
                      : Colors[colorScheme].text,
                },
              ]}
            >
              Table
            </ThemedText>
          </Pressable>



          <Pressable
            style={[
              styles.toggleButton,
              {
                backgroundColor:
                  view === "graph"
                    ? Colors[colorScheme].tint
                    : Colors[colorScheme].card,
              },
            ]}
            onPress={() => setView("graph")}
          >
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color:
                    view === "graph"
                      ? Colors[colorScheme].background
                      : Colors[colorScheme].text,
                },
              ]}
            >
              Graph
            </ThemedText>
          </Pressable>


        </ThemedView>





        {view === "table" && (

          <>


          {filteredWorkouts.map(workout=>(

            <ThemedView
              key={workout.id}
              style={[
                styles.card,
                {
                  backgroundColor: Colors[colorScheme].card,
                },
              ]}
            >


              <ThemedText style={styles.header}>
                {workout.workoutName}
              </ThemedText>


              <ThemedText>
                Date:{" "}
                {new Date(workout.date)
                  .toLocaleDateString()}
              </ThemedText>


              <ThemedText>
                Duration: {formatTime(workout.duration)}
              </ThemedText>




              {workout.exercises.map(exercise=>(


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
                    Exercise Time:
                    {" "}
                    {formatTime(exercise.totalDuration)}
                  </ThemedText>



                  {exercise.sets.map((set,index)=>(

                    <ThemedText key={index}>

                      Set {index+1}:{" "}
                      {set.weight} lbs × {set.reps} reps
                      {" "}
                      ({formatTime(set.duration)})

                    </ThemedText>

                  ))}



                </ThemedView>


              ))}



            </ThemedView>


          ))}


          </>

        )}







        {view === "graph" && (

            <ThemedView
              style={[
                styles.card,
                {
                  backgroundColor: Colors[colorScheme].card,
                },
              ]}
            >

            <ThemedText style={styles.header}>
              {selectedExercise
                ? `${selectedExercise} - ${
                    metric === "weight"
                      ? "Weight Progress"
                      : metric === "reps"
                      ? "Rep Progress"
                      : metric === "volume"
                      ? "Volume Progress"
                      : "Estimated 1RM Progress"
                  }`
                : "Strength Progress"}
            </ThemedText>



            <ThemedText>
              Split:
            </ThemedText>

          
          <ThemedView
            style={[
              styles.pickerWrapper,
              {
                backgroundColor: Colors[colorScheme].card,
              },
            ]}
          >

            <Picker
              style={[
                styles.picker,
                {
                  color: Colors[colorScheme].text,
                },
              ]}
              itemStyle={[
                styles.pickerItem,
                {
                  color: Colors[colorScheme].text,
                },
              ]}
              selectedValue={selectedSplit}
              onValueChange={(value)=>{

                setSelectedSplit(value);

                const newFilteredWorkouts =
                  value === "All"
                    ? workouts
                    : workouts.filter(
                        workout =>
                          (workout.split ?? workout.workoutName)
                          === value
                      );


                const firstExercise =
                  Array.from(
                    new Set(
                      newFilteredWorkouts.flatMap(workout =>
                        workout.exercises.map(
                          exercise => exercise.exerciseName
                        )
                      )
                    )
                  )[0];

                setSelectedExercise(firstExercise ?? "");

                setMetric("weight");

              }}
            >
              <Picker.Item
                label="All"
                value="All"
              />

              {splitNames.map(split => (

                <Picker.Item
                  key={split}
                  label={split}
                  value={split}
                />

              ))}

            </Picker>
           </ThemedView>



            <ThemedText>
              Exercise:
            </ThemedText>

        <ThemedView
          style={[
            styles.pickerWrapper,
            {
              backgroundColor: Colors[colorScheme].card,
            },
          ]}
        >

            <Picker
              style={[
                styles.picker,
                {
                  color: Colors[colorScheme].text,
                },
              ]}
              itemStyle={[
                styles.pickerItem,
                {
                  color: Colors[colorScheme].text,
                },
              ]}
              selectedValue={selectedExercise}
              onValueChange={(value)=>
                setSelectedExercise(value)
              }
            >

              {filteredExerciseNames.map(name => (

                <Picker.Item
                  key={name}
                  label={name}
                  value={name}
                />

              ))}

            </Picker>
          </ThemedView>


            <ThemedText>
              Metric:
            </ThemedText>

          <ThemedView
            style={[
              styles.pickerWrapper,
              {
                backgroundColor: Colors[colorScheme].card,
              },
            ]}
          >
            <Picker
              style={[
                styles.picker,
                {
                  color: Colors[colorScheme].text,
                },
              ]}
              itemStyle={[
                styles.pickerItem,
                {
                  color: Colors[colorScheme].text,
                },
              ]}
              selectedValue={metric}
              onValueChange={(value)=>
                setMetric(value)
              }
            >

              <Picker.Item
                label="Weight"
                value="weight"
              />

              <Picker.Item
                label="Reps"
                value="reps"
              />

              <Picker.Item
                label="Volume"
                value="volume"
              />

              <Picker.Item
                label="Estimated 1RM"
                value="strength"
              />

            </Picker>

          </ThemedView>




            {selectedExercise &&
              graphData.length > 0 && (

                <>
                  <ThemedView
                    style={[
                      styles.statsCard,
                      {
                        backgroundColor: Colors[colorScheme].card,
                      },
                    ]}
                  >

                    <ThemedText>
                      Sessions: {sessionCount}
                    </ThemedText>

                    <ThemedText>
                      Top Weight: {bestWeight} lbs
                    </ThemedText>

                    <ThemedText>
                      Estimated 1RM: {Math.round(bestEpley1RM)} lbs
                    </ThemedText>

                    <ThemedText>
                      Total Volume: {Math.round(totalVolume).toLocaleString()} lb-reps
                    </ThemedText>

                    <ThemedText>
                      Last Trained: {lastTrained}
                    </ThemedText>

                    {trendPercent !== null &&
                      metric !== "volume" && (

                      <ThemedText>
                        Last session: {Math.round(currentMetricValue!)} {metricUnit}
                        {"  "}Previous: {Math.round(previousMetricValue!)} {metricUnit}
                        {"  "}Change: {trendPercent >= 0 ? "+" : ""}
                        {trendPercent.toFixed(1)}%
                      </ThemedText>

                    )}

                  </ThemedView>


                  <ThemedView style={styles.chartContainer}>

                    <LineChart
                      data={
                        graphData.map(item => ({
                          value: item.value,
                          label: item.date,
                        }))
                      }

                      height={240}
                      width={340}

                      yAxisLabelWidth={50}
                      spacing={80}

                      thickness={3}

                      color="#0a7ea4"
                      dataPointsColor="#0a7ea4"

                      curved
                      areaChart

                      startFillColor="#0a7ea4"
                      endFillColor="#0a7ea4"

                      startOpacity={0.3}
                      endOpacity={0.05}

                      hideRules={false}

                      yAxisLabelSuffix={
                        metric === "reps"
                          ? " reps"
                          : metric === "volume"
                          ? " lb-reps"
                          : " lbs"
                      }

                      yAxisTextStyle={{
                        color:"#777",
                      }}

                      xAxisLabelTextStyle={{
                        color:"#777",
                        fontSize:10,
                      }}

                      noOfSections={5}

                      maxValue={
                        graphData.length > 0
                          ? Math.ceil(
                              Math.max(
                                ...graphData.map(
                                  item => item.value
                                )
                              ) / 5
                            ) * 5
                          : 10
                      }

                      showDataPointLabelOnFocus

                    />

                  </ThemedView>

                </>

            )}

          

            {selectedExercise &&
                graphData.length === 0 && (

                  <ThemedText style={styles.emptyState}>
                    No progress data for this exercise yet.
                  </ThemedText>

            )}
            


          </ThemedView>

        )}



      </ScrollView>


    </ScreenContainer>

  );

}




const styles = StyleSheet.create({


  scrollContent:{
    paddingBottom:40,
  },


  title:{
  fontSize:28,
  lineHeight:36,
  marginBottom:20,
},


  toggleContainer:{
    flexDirection:"row",
    gap:10,
    marginBottom:20,
  },


  toggleButton:{
    paddingVertical:10,
    paddingHorizontal:25,
    borderRadius:10,
  },



  buttonText:{
    fontWeight:"600",
  },


  card:{
  padding:15,
  borderRadius:12,
  marginBottom:20,
},


  header:{
    fontSize:20,
    fontWeight:"bold",
    marginBottom:10,
  },

 picker:{
  height:100
},

pickerItem:{
  height:100,
  fontSize:16,
},

pickerWrapper:{
  borderRadius:8,
  marginBottom:12,
  height:100,
  overflow:"hidden",
  justifyContent:"center",
},


  exerciseCard:{
    padding:15,
    borderRadius:10,
    marginTop:15,
  },


  exerciseTitle:{
    fontSize:18,
    fontWeight:"bold",
    marginBottom:5,
  },


  emptyState:{
  marginTop:10,
  opacity:0.6,
  textAlign:"center",
},




  chartContainer:{
    marginTop:20,
    width:"100%",
    alignItems:"center",
  },

  statsCard:{
  padding:12,
  borderRadius:10,
  marginBottom:15,
}


});