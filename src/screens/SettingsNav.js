import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Settings from './Settings';
import MnemonicDisplay from './MnemonicDisplay';
import AddressOptions from './AddressOptions';
import WalletOptions from './WalletOptions';
import PIN from './PIN';
import TokenCreator from './TokenCreator';
import AdvancedOptions from './AdvancedOptions';

const Stack = createStackNavigator();

const SettingsNav = ({route, navigation}) => {

 return (
  <Stack.Navigator  
  screenOptions={{
    headerStyle: {
    backgroundColor: '#4DA892',
    headerTitleAlign: 'center',
    headerTintColor: 'white',
    borderWidth:0,
    shadowRadius: 0,
    textAlign:'center',
    shadowOffset: {
        height: 0,
    },
    
  },
  headerTitleStyle: {
    fontWeight: 'bold',
    fontFamily:"AppleSDGothicNeo-Regular",
    color: "white",
  },
  }}>
    <Stack.Screen name="Settings" component={Settings} options={{ tabBarLabel: 'Settings', headerShown: false }}/>
    <Stack.Screen name="Mnemonic Display" component={MnemonicDisplay} options={{ headerTintColor: 'white', headerTitleAlign: 'center' }}/>
    <Stack.Screen name="Address Options" component={AddressOptions} options={{ headerTintColor: 'white', headerTitleAlign: 'center' }}/>
    <Stack.Screen name="Wallet Options" component={WalletOptions} options={{ headerTintColor: 'white', headerTitleAlign: 'center' }}/>
    <Stack.Screen name="PIN" component={PIN} options={{ headerTintColor: 'white', headerTitleAlign: 'center' }}/>
    <Stack.Screen name="Advanced Options" component={AdvancedOptions} options={{ headerTintColor: 'white', headerTitleAlign: 'center' }}/>
   <Stack.Screen name="Token Creator" component={TokenCreator} options={{
      tabBarLabel: 'Token Creator',
      headerTitleAlign: 'center',
      tabBarIcon: ({ color, size }) => (
        <IconFA5 name="coins" color={color} size={size} />
      ),
    }}/> 
  </Stack.Navigator>
);
};


const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35
  },
  container: {
    flex: 1,
    paddingTop: 22
   },
   sectionHeader: {
     paddingTop: 2,
     paddingLeft: 10,
     paddingRight: 10,
     paddingBottom: 2,
     fontSize: 14,
     fontWeight: 'bold',
     backgroundColor: 'rgba(247,247,247,1.0)',
   },
   item: {
     padding: 10,
     fontSize: 18,
     height: 44,
   },
});


export default SettingsNav;