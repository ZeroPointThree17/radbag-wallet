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


function navigateHome(navigation, mnemonic, word25){

   var seed = bip39.mnemonicToSeedSync(mnemonic,word25).toString('hex');

  // var seed="";
  navigation.navigate('Home', {
    mnemonicStr: mnemonic,
    word25Str: word25,
    seedStr: seed
  });
}



const CreateWallet = ({route, navigation}) => {


  const { mnemonicStr } = route.params;
  

  var mnemonic = JSON.stringify(mnemonicStr).replaceAll('"','');
   console.log("CW MNEMONIC:" + mnemonic);




// Declare a new state variable, which we'll call "count"
// const [seed, setSeed] = useState(mnemonic);
// storeData("seed",seed);
// var saltArry = new Uint32Array(1);
// crypto.getRandomValues(saltArry);

var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c02\/", salt);
console.log("SALT: "+salt);
console.log("HASH: "+hash);

console.log(bcrypt.compareSync("B4c02\/", hash)); // true
console.log(bcrypt.compareSync("not_bacon", hash)); // false



const [word25flag, setWord25flag] = useState(false);
const [word25, setWord25] = useState("");

  return (

    <SafeAreaView style={styles.container}>
       <Separator/>
       <Separator/>
       <Separator/>
       <Separator/>
     <View > 
      <Text style={styles.title}>Below is your mnemonic phrase. Write it down and keep them in a safe place. DO NOT take a photo of the phrase or copy and paste it anywhere. This key holds ALL YOUR FUNDS!</Text>
 <Separator/>
 <Text style={styles.mnemonic}>{mnemonic}</Text>
 <Separator/>
 
 <View style={styles.checkbox}> 
 <CheckBox 
    onClick={()=>{
      if(word25flag==false){
      setWord25flag(true);
      }
      else setWord25flag(false);
    }}
    isChecked={word25flag}
/> 
<Text style={styles.title2}>Add 25th word?</Text>
</View > 
{ word25flag && 


<PasswordInputText 
onChangeText={(password) => setWord25( "password12" )}
label='25th word' style={styles.title}/>
 }
<Separator/>
 <Button style={styles.title}
        title="Understood - Continue"
        enabled
        onPress={() => navigateHome(navigation, mnemonic, word25)}
      />

  </View> 
  </SafeAreaView>
  )
  ;
};


const styles = StyleSheet.create({
  input: {
    width: 250,
    marginHorizontal: 100
  },
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35
  },
  container: {
    flex: 1,
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
    marginHorizontal: 50,
  },
  mnemonic: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 50,
    fontSize: 20,
    fontWeight: "bold"
  },
  title2: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 5,
  },
  checkbox: {
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
