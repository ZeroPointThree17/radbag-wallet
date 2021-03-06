import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View ,Linking} from 'react-native';
import React from 'react';
import Home from './Home';
import TokenCreator from './TokenCreator';
import NFTs from './NFTs';
import Sign from './Sign';
import SettingsNav from './SettingsNav';
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import IconFA5 from 'react-native-vector-icons/FontAwesome5';
import IconFA from 'react-native-vector-icons/FontAwesome';
import { Image } from 'react-native';

// import HardwareWallet from './HardwareWalletUSB'

const Tab = createBottomTabNavigator();

export default function HomeNav({route, navigation}) {



  return (
  
    <Tab.Navigator  

    screenOptions={{
      tabBarHideOnKeyboard: true,
      tabBarActiveTintColor: "white",
      tabBarInactiveTintColor: "grey",
      tabBarStyle: [
        {
          "display": "flex"
        },
        null
      ],
      headerShown: false,
      alignSelf: 'center',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: global.appBlue,
        // backgroundColor: '#183A81',
        borderWidth:0,
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
        },
      },
      headerTintColor: "white",
      headerTitleStyle: {
        fontWeight: 'bold',
        fontFamily:"AppleSDGothicNeo-Regular",
      },
      headerTextStyle:{
        textAlign:'center',
        flexGlow: 1
      },
      tabBarStyle: {
        // height: 'auto',
        height: 78,
        paddingHorizontal: 5,
        paddingTop: 10,
        marginTop:0,
        paddingBottom: 25,
        // backgroundColor: '#183A81',
        backgroundColor: global.appBlue,
        position: 'absolute',
        borderTopWidth: 0,
    },
    
    }}>
      <Tab.Screen name="Summary" component={Home} options={{
      tabBarLabel: 'Home',
      tabBarIcon: ({ color, size }) => (
        <IconMaterial name="home" color={color} size={size} />
      ),
    }}/>

         {/* <Tab.Screen name="Market" component={NFTs} options={
           {
      tabBarLabel: 'Market',
      tabBarIcon: ({ color, size }) => (

        <IconFA5 name="opencart" color={color} size={size} />
      ),
    }}/> */}
            {/* <Tab.Screen name="Sign" component={Sign} options={
           {
      tabBarLabel: 'Sign',
      tabBarIcon: ({ color, size }) => (

        <IconFA5 name="opencart" color={color} size={size} />
      ),
    }}/> */}
        <Tab.Screen name="Settings" component={SettingsNav} options={{
      headerShown: true,
      tabBarLabel: 'Settings',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="settings-outline" color={color} size={size} />
      ),
    }}/>
    
      {/* <Tab.Screen name="Token Creator" component={TokenCreator} options={{
       tabBarLabel: 'Token Creator',
       tabBarIcon: ({ color, size }) => (
         <IconFA5 name="coins" color={color} size={size} />
       ),
     }}/> */}

      {/* <Tab.Screen name="HardwareWallet" component={HardwareWallet} options={{
       tabBarLabel: 'HardwareWalletTest',
       tabBarIcon: ({ color, size }) => (
        <Ionicons name="settings-outline" color={color} size={size} />
       ),
     }}/> */}

          {/* <Tab.Screen name="Mnemonic" component={CreateWallet} /> */}
    </Tab.Navigator>
  


  );
}