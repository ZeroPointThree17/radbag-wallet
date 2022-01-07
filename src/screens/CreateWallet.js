import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Separator = () => (
  <View style={styles.separator} />
);

var mnemonic = "";
const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
}

const CreateWallet = ({navigation}) => {
   mnemonic = bip39.generateMnemonic();
   console.log("CW MNEMONIC:" + mnemonic);
   var seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');

// Declare a new state variable, which we'll call "count"
// const [seed, setSeed] = useState(mnemonic);
storeData("seed",seed);

  return (
    <SafeAreaView>
     <View style={styles.text}> 
      <Text style={styles.title}>Below is your mnemonic phrase. Write it down and keep them in a safe place. DO NOT take a photo of the phrase or copy and paste it anywhere. This key holds ALL YOUR FUNDS!</Text>
 <Separator/>
 <Text style={styles.title}>{mnemonic}</Text>
 <Separator/>
 <Button
        title="Understood - Continue"
        enabled
        onPress={() => navigation.navigate('Home')}
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
    justifyContent: 'space-around',
    marginVertical:35
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
   separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default CreateWallet;
