import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";


export default function TabLayout() {

  const { colorScheme } = useTheme();


  return (

    <Tabs
      screenOptions={{
        
        tabBarActiveTintColor:
          Colors[colorScheme].tint,

        tabBarInactiveTintColor:
          Colors[colorScheme].icon,

        tabBarStyle: {
          backgroundColor:
            Colors[colorScheme].background,

          borderTopColor:
            Colors[colorScheme].card,
        },

        headerShown:false,

        tabBarButton:HapticTab,

      }}
    >


      <Tabs.Screen
        name="workout"
        options={{
          title:"Workout",

          tabBarIcon:({color}) =>
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />,
        }}
      />



      <Tabs.Screen
        name="progress"
        options={{
          title:"Progress",

          tabBarIcon:({color}) =>
            <IconSymbol
              size={28}
              name="chart.bar.fill"
              color={color}
            />,
        }}
      />



      <Tabs.Screen
        name="settings"
        options={{
          title:"Settings",

          tabBarIcon:({color}) =>
            <IconSymbol
              size={28}
              name="gearshape.fill"
              color={color}
            />,
        }}
      />


    </Tabs>

  );
}