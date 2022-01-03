import React from 'react';
import { Alert, Button, SectionList, View, Text, StyleSheet } from 'react-native';

var seedPhrase = "seedPhrase";


const CreateWallet = () => {
  return (
     <View style={styles.text}> 
 <Text>{seedPhrase} jkjkj</Text>

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

export default CreateWallet;
