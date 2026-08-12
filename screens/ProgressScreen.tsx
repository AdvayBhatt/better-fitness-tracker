import PageMarker from "@/components/PageMarker";
import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { CompletedWorkout } from "@/data/workoutHistory";
import {
  deleteAllWorkouts,
  deleteWorkout,
  getWorkouts,
} from "@/data/workoutStorage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet
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
    | "weight"
    | "reps"
    | "volume"
    | "strength"
    | "time"
    | "distance"
    | "resistance"
    | "incline"
  >("weight");
  
  const [selectedSplit, setSelectedSplit] =
    useState<string>("All");


  const [workouts, setWorkouts] =
    useState<CompletedWorkout[]>([]);


  const [loading, setLoading] =
    useState(true);



  useFocusEffect(
    useCallback(() => {

      let active = true;

      async function loadWorkouts(){

        const savedWorkouts =
          await getWorkouts();

        if(active){
          setWorkouts(savedWorkouts);
          setLoading(false);
        }

      }

      loadWorkouts();

      return () => {
        active = false;
      };

    }, [])
  );

  


  function formatTime(seconds:number){

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;


    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2,"0")}`;

  }

async function handleDeleteWorkout(id:string){

  await deleteWorkout(id);

  setWorkouts(prev =>
    prev.filter(
      workout =>
        workout.id !== id
    )
  );

}



async function handleDeleteAll(){

  Alert.alert(
    "Delete all workouts?",
    "This cannot be undone.",
    [
      {
        text:"Cancel",
        style:"cancel",
      },
      {
        text:"Delete All",
        style:"destructive",
        onPress: async()=>{

          await deleteAllWorkouts();

          setWorkouts([]);

          setSelectedExercise("");

          setSelectedSplit("All");

        },
      },
    ]
  );

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

const selectedExerciseData =
  filteredWorkouts
    .flatMap(workout => workout.exercises)
    .find(
      exercise =>
        exercise.exerciseName === selectedExercise
    );


const selectedExerciseIsCardio =
  selectedExerciseData?.type !== "strength";


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


        let value = 0;


        if(exercise.type === "strength"){

          const weights =
            exercise.sets.map(set => set.weight);

          const reps =
            exercise.sets.map(set => set.reps);

          const epleyValues =
            exercise.sets.map(
              set =>
                set.weight *
                (1 + set.reps / 30)
            );


          value =
            metric === "weight"
              ? Math.max(...weights)

              : metric === "reps"
              ? Math.max(...reps)

              : metric === "volume"
              ? exercise.sets.reduce(
                  (total,set)=>
                    total +
                    (set.weight * set.reps),
                  0
                )

              : Math.max(...epleyValues);


        } else {


          value =
            metric === "time"
              ? exercise.time ?? 0

              : metric === "distance"
              ? exercise.miles ?? 0

              : metric === "resistance"
              ? exercise.resistance ?? 0

              : exercise.incline ?? 0;

        }



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
              sets: exercise.sets ?? [],
              exercise,
            }
          : null;

      })
      .filter(
        item => item !== null
      )
  : [];


  const strengthStats =
  exerciseStats.filter(
    workout =>
      workout.exercise.type === "strength"
  );


const totalVolume =
  strengthStats.reduce(
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
  strengthStats.flatMap(
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
  strengthStats.flatMap(
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

      <PageMarker id="progress" name="Progress" description="Workout history and trend chart" />

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





        {loading && (

          <ThemedView style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme].tint}
            />
          </ThemedView>

        )}


        {!loading && view === "table" && (

  <>

    <Pressable
      style={[
        styles.deleteAllButton,
        {
          opacity: workouts.length === 0 ? 0.5 : 1,
        }
      ]}
      disabled={workouts.length === 0}
      onPress={handleDeleteAll}
    >

      <ThemedText>
        Delete All Workouts
      </ThemedText>

    </Pressable>


    {filteredWorkouts.length === 0 && (

      <ThemedText style={styles.emptyState}>
        No workout history yet.
      </ThemedText>

    )}


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


              <ThemedView
                  style={styles.cardHeader}
                >

                  <ThemedText style={styles.header}>
                    {workout.workoutName}
                  </ThemedText>


                  <Pressable
                    onPress={()=>{

                      Alert.alert(
                        "Delete workout?",
                        "Remove this workout from history?",
                        [
                          {
                            text:"Cancel",
                            style:"cancel",
                          },
                          {
                            text:"Delete",
                            style:"destructive",
                            onPress:()=>handleDeleteWorkout(workout.id),
                          },
                        ]
                      );

                    }}
                  >

                    <ThemedText>
                      🗑️
                    </ThemedText>

                  </Pressable>


                </ThemedView>


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



                 {exercise.type === "strength" ? (

  <>
                <ThemedText>
                  Weight: {exercise.sets[0]?.weight ?? 0} lbs
                </ThemedText>

                <ThemedText>
                  Sets: {exercise.sets.length}
                </ThemedText>


                {exercise.sets.map((set,index)=>(

                  <ThemedText key={index}>

                    Set {index+1}:{" "}
                    {set.weight} lbs × {set.reps} reps
                    {" "}
                    ({formatTime(set.duration)})

                  </ThemedText>

                ))}
                <ThemedText>
                  Total Exercise Time:{" "}
                  {formatTime(
                    exercise.sets.reduce(
                      (total,set) =>
                        total + set.duration,
                      0
                    )
                  )}
                </ThemedText>

              </>

            ) : (

              <>

                <ThemedText>
                  Time: {exercise.time ?? 0} minutes
                </ThemedText>


                <ThemedText>
                  Distance: {exercise.miles ?? 0} miles
                </ThemedText>


                <ThemedText>
                  Resistance: {exercise.resistance ?? 0}
                </ThemedText>


                <ThemedText>
                  Incline: {exercise.incline ?? 0}
                </ThemedText>


                <ThemedText>
                  Session Time: {formatTime(exercise.totalDuration)}
                </ThemedText>


              </>

            )}



                </ThemedView>


              ))}



            </ThemedView>


          ))}


          </>

        )}







        {!loading && view === "graph" && (

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
                      : metric === "strength"
                      ? "Estimated 1RM Progress"
                      : metric === "time"
                      ? "Time Progress"
                      : metric === "distance"
                      ? "Distance Progress"
                      : metric === "resistance"
                      ? "Resistance Progress"
                      : "Incline Progress"
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
              onValueChange={(value)=>{

              setSelectedExercise(value);

              const exercise =
                filteredWorkouts
                  .flatMap(workout => workout.exercises)
                  .find(
                    item =>
                      item.exerciseName === value
                  );


              if(exercise?.type === "strength"){
                setMetric("weight");
              } else {
                setMetric("time");
              }

            }}
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

              {selectedExerciseIsCardio ? (

                <>

                  <Picker.Item
                    label="Time"
                    value="time"
                  />

                  <Picker.Item
                    label="Distance"
                    value="distance"
                  />

                  <Picker.Item
                    label="Resistance"
                    value="resistance"
                  />

                  <Picker.Item
                    label="Incline"
                    value="incline"
                  />

                </>


              ) : (

                <>

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

                </>

              )}

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


                    {selectedExerciseIsCardio ? (

                      <>

                        <ThemedText>
                          Best Distance: {
                            Math.max(
                              ...exerciseStats.map(
                                item =>
                                  item.exercise.miles ?? 0
                              )
                            )
                          } miles
                        </ThemedText>


                        <ThemedText>
                          Longest Session: {
                            Math.max(
                              ...exerciseStats.map(
                                item =>
                                  item.exercise.time ?? 0
                              )
                            )
                          } minutes
                        </ThemedText>


                      </>

                    ) : (

                      <>

                        {exerciseStats[0]?.exercise.type === "strength" ? (

                            <>
                              <ThemedText>
                                Top Weight: {bestWeight} lbs
                              </ThemedText>

                              <ThemedText>
                                Estimated 1RM: {Math.round(bestEpley1RM)} lbs
                              </ThemedText>

                              <ThemedText>
                                Total Volume: {Math.round(totalVolume).toLocaleString()} lb-reps
                              </ThemedText>
                            </>

                          ) : (

                            <>
                              <ThemedText>
                                Sessions: {sessionCount}
                              </ThemedText>

                              <ThemedText>
                                Total Time: {
                                  exerciseStats.reduce(
                                    (total, workout) =>
                                      total + (workout.exercise.totalDuration ?? 0),
                                    0
                                  ) / 60
                                } minutes
                              </ThemedText>

                              <ThemedText>
                                Total Distance: {
                                  exerciseStats.reduce(
                                    (total, workout) =>
                                      total + (workout.exercise.miles ?? 0),
                                    0
                                  )
                                } miles
                              </ThemedText>
                            </>

                          )}

                      </>

                    )}


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
                          : metric === "distance"
                          ? " mi"
                          : metric === "time"
                          ? " min"
                          : metric === "resistance"
                          ? ""
                          : metric === "incline"
                          ? ""
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

  loadingBox:{
    paddingVertical:60,
    alignItems:"center",
  },


  title:{
  fontSize:28,
  lineHeight:36,
  marginBottom:20,
},

cardHeader:{
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
},


deleteAllButton:{
  padding:10,
  borderRadius:10,
  backgroundColor:"#d9534f",
  alignItems:"center",
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