import React from 'react';
import { Text, FlatList, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';
import Settings from './Settings';
import MnemonicDisplay from './MnemonicDisplay';
import { CommonActions } from '@react-navigation/native';

const Stack = createStackNavigator();


const Separator = () => (
  <View style={styles.separator} />
);

 const SettingsNav = ({route, navigation}) => {

 return (
  <Stack.Navigator>
    <Stack.Screen name="Settings" component={Settings} options={{ tabBarLabel: 'Settings', headerShown: false }}/>
    <Stack.Screen name="Mnemonic Display" component={MnemonicDisplay}/>
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
   separator: {
    marginVertical: 0,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default SettingsNav;
