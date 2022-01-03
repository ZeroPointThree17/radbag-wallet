import React from 'react';
import { Alert, Button, SectionList, View, Text, StyleSheet } from 'react-native';
import CreateWallet from "./CreateWallet";
import HomeScreen from "./HomeScreen";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

const Welcome = ({ navigation }) => {
  return (
     <View style={styles.text}> 
 <Text>Welcome to the Raddish Mobile Wallet!</Text>
 <Button
        title="Create New Wallet"
        enabled
        onPress={() => navigation.navigate('CreateWallet')}
      />
      <Button
        title="Import a Wallet"
        enabled
        onPress={() => Alert.alert('Import - Cannot press this one')}
      />
  </View> 
  )
  ;
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

export default Welcome;
