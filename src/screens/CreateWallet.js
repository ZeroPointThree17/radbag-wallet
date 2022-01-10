import { Alert, Button, TextInput, Pressable, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UInt256, U256 } from 'uint256';
var bcrypt = require('react-native-bcrypt');
import CheckBox from 'react-native-check-box';
import PasswordInputText from 'react-native-hide-show-password-input';

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


  const [selectedFruits, setSelectedFruits] = useState([]);


   mnemonic = bip39.generateMnemonic();
   console.log("CW MNEMONIC:" + mnemonic);

   var word25='';


   var seed = bip39.mnemonicToSeedSync(mnemonic).toString('hex');

// Declare a new state variable, which we'll call "count"
// const [seed, setSeed] = useState(mnemonic);
storeData("seed",seed);
// var saltArry = new Uint32Array(1);
// crypto.getRandomValues(saltArry);

var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c02\/", salt);
console.log("SALT: "+salt);
console.log("HASH: "+hash);

console.log(bcrypt.compareSync("B4c02\/", hash)); // true
console.log(bcrypt.compareSync("not_bacon", hash)); // false





  return (

    <SafeAreaView style={styles.container}>
     <View > 
      <Text style={styles.title}>Below is your mnemonic phrase. Write it down and keep them in a safe place. DO NOT take a photo of the phrase or copy and paste it anywhere. This key holds ALL YOUR FUNDS!</Text>
 <Separator/>
 <Text style={styles.title}>{mnemonic}</Text>
 <Separator/>
 
 <View style={styles.title2}> 
 <CheckBox 
    onClick={()=>{
    
    }}
    isChecked={false}
/> 
<Text style={styles.title}>Add 25th word?</Text>
</View > 
<PasswordInputText
      
        />
<Separator/>
 <Button style={styles.title}
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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    marginHorizontal:50
  },
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
    backgroundColor: '#FFFFFF'
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
   checkbox: {
    alignSelf: "center",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
   item: {
     padding: 10,
     fontSize: 18,
     height: 44,
   },
   separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: 0,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 5,
  },
  title2: {
    flexDirection: "row",
    textAlign: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 20,
    alignSelf: "center",
    justifyContent: 'center'
  },

});

export default CreateWallet;
