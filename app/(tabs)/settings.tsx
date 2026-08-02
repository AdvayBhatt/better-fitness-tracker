import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  getSettings,
  saveSettings,
  UserSettings,
} from "@/data/settingsStorage";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";


const defaultSettings: UserSettings = {
  name: "Not set",
  bodyweight: "155",
  height: "5'9\"",
  units: "lbs",
};



export default function SettingsScreen() {

  const [settings, setSettings] =
    useState<UserSettings>(defaultSettings);


  const {
    theme,
    setTheme,
    colorScheme,
  } = useTheme();



  useEffect(() => {

    async function loadSettings() {

      const savedSettings =
        await getSettings();

      if(savedSettings){
        setSettings(savedSettings);
      }

    }


    loadSettings();

  }, []);




  async function updateSettings(
    updatedSettings: UserSettings
  ){

    setSettings(updatedSettings);

    await saveSettings(updatedSettings);

  }




  function editName(){

    Alert.prompt(
      "Edit Name",
      "Enter your name",
      value => {

        if(value){

          updateSettings({
            ...settings,
            name:value,
          });

        }

      }
    );

  }





  function editBodyweight(){

    Alert.prompt(
      "Edit Bodyweight",
      "Enter weight",
      value => {

        if(value){

          updateSettings({
            ...settings,
            bodyweight:value,
          });

        }

      }
    );

  }





  function editHeight(){

    Alert.prompt(
      "Edit Height",
      "Enter height",
      value => {

        if(value){

          updateSettings({
            ...settings,
            height:value,
          });

        }

      }
    );

  }





  function toggleUnits(){

    updateSettings({
      ...settings,
      units:
        settings.units === "lbs"
          ? "kg"
          : "lbs",
    });

  }





  function toggleTheme(){

    const nextTheme =
      theme === "system"
        ? "light"
        : theme === "light"
        ? "dark"
        : "system";


    setTheme(nextTheme);

  }




  return (

    <ScreenContainer>


      <ThemedText
        type="title"
        style={styles.title}
      >
        Settings
      </ThemedText>




      <ThemedView
        style={[
          styles.section,
          {
            backgroundColor:
              Colors[colorScheme].card,
          },
        ]}
      >

        <ThemedText style={styles.sectionTitle}>
          Profile
        </ThemedText>



        <Pressable
          style={styles.row}
          onPress={editName}
        >

          <ThemedText>
            Name
          </ThemedText>


          <ThemedText style={styles.value}>
            {settings.name}
          </ThemedText>

        </Pressable>




        <Pressable
          style={styles.row}
          onPress={editBodyweight}
        >

          <ThemedText>
            Bodyweight
          </ThemedText>


          <ThemedText style={styles.value}>
            {settings.bodyweight} {settings.units}
          </ThemedText>

        </Pressable>




        <Pressable
          style={styles.row}
          onPress={editHeight}
        >

          <ThemedText>
            Height
          </ThemedText>


          <ThemedText style={styles.value}>
            {settings.height}
          </ThemedText>

        </Pressable>


      </ThemedView>






      <ThemedView
        style={[
          styles.section,
          {
            backgroundColor:
              Colors[colorScheme].card,
          },
        ]}
      >

        <ThemedText style={styles.sectionTitle}>
          Preferences
        </ThemedText>




        <Pressable
          style={styles.row}
          onPress={toggleUnits}
        >

          <ThemedText>
            Units
          </ThemedText>


          <ThemedText style={styles.value}>
            {settings.units}
          </ThemedText>

        </Pressable>




        <Pressable
          style={styles.row}
          onPress={toggleTheme}
        >

          <ThemedText>
            Theme
          </ThemedText>


          <ThemedText style={styles.value}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </ThemedText>

        </Pressable>


      </ThemedView>







      <ThemedView
        style={[
          styles.section,
          {
            backgroundColor:
              Colors[colorScheme].card,
          },
        ]}
      >

        <ThemedText style={styles.sectionTitle}>
          Data
        </ThemedText>




        <Pressable
          style={styles.button}
          onPress={()=>{
            console.log("Export data");
          }}
        >

          <ThemedText style={styles.buttonText}>
            Export Workout Data
          </ThemedText>

        </Pressable>





        <Pressable
          style={styles.button}
          onPress={()=>{
            console.log("Import data");
          }}
        >

          <ThemedText style={styles.buttonText}>
            Import Workout Data
          </ThemedText>

        </Pressable>





        <Pressable
          style={[
            styles.button,
            styles.dangerButton,
          ]}
          onPress={()=>{
            console.log("Clear data");
          }}
        >

          <ThemedText style={styles.buttonText}>
            Clear All Data
          </ThemedText>

        </Pressable>


      </ThemedView>



    </ScreenContainer>

  );

}






const styles = StyleSheet.create({

  title:{
    marginBottom:25,
  },



  section:{
    padding:15,
    borderRadius:12,
    marginBottom:20,
  },



  sectionTitle:{
    fontSize:18,
    fontWeight:"bold",
    lineHeight:26,
    marginBottom:15,
  },



  row:{
    flexDirection:"row",
    justifyContent:"space-between",
    paddingVertical:12,
  },



  value:{
    opacity:0.6,
  },



  button:{
    padding:15,
    borderRadius:10,
    marginTop:10,
    backgroundColor:"#0a7ea4",
    alignItems:"center",
  },



  dangerButton:{
    backgroundColor:"#a40a0a",
  },



  buttonText:{
    color:"#fff",
  },

});