import { commentRegex } from 'convert-source-map';
import React from 'react';
import {SafeAreaView, Alert, Button, SectionList, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');

function navigateToCreateWallet(navigation){
  var mnemonic = bip39.generateMnemonic();
  navigation.navigate('Create Wallet', {
    mnemonicStr: mnemonic
  });
}

const Welcome = ({ navigation }) => {


  return (

    <SafeAreaView style={styles.container}>
     <View style={styles.text}> 
 <Text style={styles.title}>Welcome to the Raddish Mobile Wallet! Have you previously made a Radix DLT Wallet?</Text>
 <Button
        title="Yes - Import a Wallet"
        enabled
        onPress={() => Alert.alert('Import - Cannot press this one')}
      />
 <Button
        title="No - Create New Wallet"
        color = 'red'
        enabled
        onPress={() => navigateToCreateWallet(navigation)
          }
      />

  </View> 
  </SafeAreaView>
  )
  ;
};


const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical:35,
    paddingHorizontal: 20,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 20
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
   title: {
    textAlign: 'center',
    marginVertical: 8,
  },
});

export default Welcome;
