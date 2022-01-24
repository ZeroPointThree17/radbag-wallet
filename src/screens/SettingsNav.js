import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Settings from './Settings';
import MnemonicDisplay from './MnemonicDisplay';
import AddressOptions from './AddressOptions';
import WalletOptions from './WalletOptions';

const Stack = createStackNavigator();

const SettingsNav = ({route, navigation}) => {

 return (
  <Stack.Navigator>
    <Stack.Screen name="Settings" component={Settings} options={{ tabBarLabel: 'Settings', headerShown: false }}/>
    <Stack.Screen name="Mnemonic Display" component={MnemonicDisplay}/>
    <Stack.Screen name="Address Options" component={AddressOptions}/>
    <Stack.Screen name="Wallet Options" component={WalletOptions}/>
  
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