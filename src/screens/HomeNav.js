import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Home from './Home';
import Settings from './Settings';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import  Ionicons  from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function HomeNav({route, navigation}) {

  const pwStr = route.params;

  var password = pwStr.pwStr;

  console.log("pwStr1:"+pwStr.pwStr)
  return (
    <Tab.Navigator >
      <Tab.Screen name="Home" component={Home} initialParams={{
       pw: {password}
    }} options={{
      tabBarLabel: 'Home',
      tabBarIcon: ({ color, size }) => (
        <IconMaterial name="home" color={color} size={size} />
      ),
    }}/>
        <Tab.Screen name="Settings" component={Settings} initialParams={{
       pw: {password}
    }} options={{
      tabBarLabel: 'Settings',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="settings-outline" color={color} size={size} />
      ),
    }}/>
    </Tab.Navigator>
  );
}