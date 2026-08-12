import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import ProgressScreen from "@/screens/ProgressScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import WorkoutScreen from "@/screens/WorkoutScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {

  const { colorScheme } = useTheme();

  return (

    <Tab.Navigator
      initialRouteName="workout"
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

        headerShown: false,

        tabBarButton: HapticTab,

      }}
    >


      <Tab.Screen
        name="workout"
        component={WorkoutScreen}
        options={{
          title: "Workout",

          tabBarIcon: ({ color }) =>
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />,
        }}
      />



      <Tab.Screen
        name="progress"
        component={ProgressScreen}
        options={{
          title: "Progress",

          tabBarIcon: ({ color }) =>
            <IconSymbol
              size={28}
              name="chart.bar.fill"
              color={color}
            />,
        }}
      />



      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: "Settings",

          tabBarIcon: ({ color }) =>
            <IconSymbol
              size={28}
              name="gearshape.fill"
              color={color}
            />,
        }}
      />


    </Tab.Navigator>

  );
}
