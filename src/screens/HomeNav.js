import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Home from './Home';
import Settings from './Settings';

const Tab = createBottomTabNavigator();

export default function HomeNav({route, navigation}) {

  const pwStr = route.params;

  console.log("pwStr1:"+pwStr)
  return (
    <Tab.Navigator >
      <Tab.Screen name="Home" component={Home} initialParams={{
       pw: {pwStr}
    }}/>
        <Tab.Screen name="Settings" component={Settings} initialParams={{
       pw: {pwStr}
    }}/>
    </Tab.Navigator>
  );
}