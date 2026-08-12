import { InputModal } from "@/components/InputModal";
import PageMarker from "@/components/PageMarker";
import { ScreenContainer } from "@/components/screen-container";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  defaultSettings,
  getSettings,
  saveSettings,
  setOnboardingComplete,
  type AssignedSex,
  type UserSettings,
} from "@/data/settingsStorage";
import type { RootStackParamList } from "@/navigation/types";
import {
  sanitizeDecimal,
  sanitizeInteger,
  validateAge,
  validateBodyweight,
  validateHeight,
  validateName,
} from "@/utils/validation";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
} from "react-native";


type EditableField = "name" | "bodyweight" | "height" | "age";


const SEX_LABELS: Record<AssignedSex, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  unspecified: "Prefer not to say",
};


const SEX_CYCLE: AssignedSex[] = [
  "male",
  "female",
  "other",
  "unspecified",
];



export default function SettingsScreen() {

  const [settings, setSettings] =
    useState<UserSettings>(defaultSettings);

  const [editingField, setEditingField] =
    useState<EditableField | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();


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




  const fieldConfig: Record<
    EditableField,
    {
      title: string;
      placeholder: string;
      numeric: boolean;
      value: string;
      sanitize?: (value: string) => string;
      validate: (value: string) => string | null;
    }
  > = {
    name: {
      title: "Edit name",
      placeholder: "Your name",
      numeric: false,
      value: settings.name,
      validate: validateName,
    },
    bodyweight: {
      title: "Edit bodyweight",
      placeholder: "Bodyweight",
      numeric: true,
      value: settings.bodyweight,
      sanitize: sanitizeDecimal,
      validate: validateBodyweight,
    },
    height: {
      title: "Edit height",
      placeholder: "For example 5'9 or 175cm",
      numeric: false,
      value: settings.height,
      validate: validateHeight,
    },
    age: {
      title: "Edit age",
      placeholder: "Age in years",
      numeric: true,
      value: settings.age,
      sanitize: sanitizeInteger,
      validate: validateAge,
    },
  };


  function submitField(value: string){

    if(!editingField) return;

    updateSettings({
      ...settings,
      [editingField]: value,
    });

    setEditingField(null);

  }




  function cycleAssignedSex(){

    const currentIndex =
      SEX_CYCLE.indexOf(settings.assignedSex);

    const nextSex =
      SEX_CYCLE[(currentIndex + 1) % SEX_CYCLE.length];

    updateSettings({
      ...settings,
      assignedSex: nextSex,
    });

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

      <PageMarker id="settings" name="Settings" description="Profile and app preferences" />

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
          onPress={() => setEditingField("name")}
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
          onPress={() => setEditingField("bodyweight")}
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
          onPress={() => setEditingField("height")}
        >

          <ThemedText>
            Height
          </ThemedText>


          <ThemedText style={styles.value}>
            {settings.height}
          </ThemedText>

        </Pressable>




        <Pressable
          style={styles.row}
          onPress={() => setEditingField("age")}
        >

          <ThemedText>
            Age
          </ThemedText>


          <ThemedText style={styles.value}>
            {settings.age ? settings.age : "Not set"}
          </ThemedText>

        </Pressable>




        <Pressable
          style={styles.row}
          onPress={cycleAssignedSex}
        >

          <ThemedText>
            Assigned sex
          </ThemedText>


          <ThemedText style={styles.value}>
            {SEX_LABELS[settings.assignedSex]}
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
          style={styles.button}
          onPress={async ()=>{
            await setOnboardingComplete(false);
            navigation.navigate("Onboarding");
          }}
        >

          <ThemedText style={styles.buttonText}>
            Reset Onboarding
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


      <InputModal
        visible={editingField !== null}
        title={editingField ? fieldConfig[editingField].title : ""}
        placeholder={
          editingField ? fieldConfig[editingField].placeholder : ""
        }
        initialValue={
          editingField ? fieldConfig[editingField].value : ""
        }
        keyboardType={
          editingField && fieldConfig[editingField].numeric
            ? "numeric"
            : "default"
        }
        sanitize={
          editingField ? fieldConfig[editingField].sanitize : undefined
        }
        validate={
          editingField ? fieldConfig[editingField].validate : undefined
        }
        onSubmit={submitField}
        onCancel={() => setEditingField(null)}
      />



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