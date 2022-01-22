import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Home from './Home';
import TokenCreator from './TokenCreator';
import SettingsNav from './SettingsNav';
import CreateWallet from './CreateWallet';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import { StackActions } from '@react-navigation/native';
import IconFA5 from 'react-native-vector-icons/FontAwesome5';

const Tab = createBottomTabNavigator();

export default function HomeNav({route, navigation}) {

  return (
    <Tab.Navigator  

 
    screenOptions={{
     
      tabBarActiveTintColor: "white",
      headerStyle: {
        backgroundColor: '#183A81',
        borderWidth:0,
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
        },
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      tabBarStyle: {
        // height: 'auto',
        height: 78,
        paddingHorizontal: 5,
        paddingTop: 10,
        marginTop:0,
        paddingBottom: 25,
        backgroundColor: '#183A81',
        position: 'absoulte',
        borderTopWidth: 0,
        
    },
    
    }}>
      <Tab.Screen name="Summary" component={Home} options={{
      tabBarLabel: 'Home',
      tabBarIcon: ({ color, size }) => (
        <IconMaterial name="home" color={color} size={size} />
      ),
    }}/>
     <Tab.Screen name="Token Creator" component={TokenCreator} options={{
      tabBarLabel: 'Token Creator',
      tabBarIcon: ({ color, size }) => (
        <IconFA5 name="coins" color={color} size={size} />
      ),
    }}/>
        <Tab.Screen name="Settings" component={SettingsNav} options={{
      tabBarLabel: 'Settings',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="settings-outline" color={color} size={size} />
      ),
    }}/>
          {/* <Tab.Screen name="Mnemonic" component={CreateWallet} /> */}
    </Tab.Navigator>
  );
}