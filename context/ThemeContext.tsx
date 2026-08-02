import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";


type ThemePreference =
  "system"
  | "light"
  | "dark";


type ThemeContextType = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  colorScheme: "light" | "dark";
};


const ThemeContext =
  createContext<ThemeContextType | null>(null);



const THEME_KEY = "theme_preference";



export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {


  const systemTheme =
    useColorScheme();


  const [theme,setThemeState] =
    useState<ThemePreference>("system");



  useEffect(()=>{

    async function loadTheme(){

      const saved =
        await AsyncStorage.getItem(
          THEME_KEY
        );


      if(
        saved === "light" ||
        saved === "dark" ||
        saved === "system"
      ){
        setThemeState(saved);
      }

    }


    loadTheme();

  },[]);



  async function setTheme(
    value: ThemePreference
  ){

    setThemeState(value);

    await AsyncStorage.setItem(
      THEME_KEY,
      value
    );

  }



  const colorScheme =
    theme === "system"
      ? systemTheme ?? "light"
      : theme;



  return (

    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorScheme,
      }}
    >

      {children}

    </ThemeContext.Provider>

  );

}



export function useTheme(){

  const context =
    useContext(ThemeContext);


  if(!context){

    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );

  }


  return context;

}