import AsyncStorage from "@react-native-async-storage/async-storage";


const SETTINGS_KEY = "user_settings";


export type UserSettings = {
  name: string;
  bodyweight: string;
  height: string;
  units: "lbs" | "kg";
};


export const defaultSettings: UserSettings = {
  name: "Not set",
  bodyweight: "155",
  height: "5'9\"",
  units: "lbs",
};



export async function saveSettings(
  settings: UserSettings
) {

  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );

}



export async function getSettings():
  Promise<UserSettings> {

  const savedSettings =
    await AsyncStorage.getItem(
      SETTINGS_KEY
    );


  if(!savedSettings){
    return defaultSettings;
  }


  return {
    ...defaultSettings,
    ...JSON.parse(savedSettings),
  };

}



export async function clearSettings(){

  await AsyncStorage.removeItem(
    SETTINGS_KEY
  );

}