import { Alert, Button, TextInput, Pressable, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UInt256, U256 } from 'uint256';

import CheckBox from 'react-native-check-box';
import PasswordInputText from 'react-native-hide-show-password-input';
// import { UserContext } from "./UserProvider";


const Separator = () => (
  <View style={styles.separator} />
);


function navigateAppPassword(navigation, mnemonic, word13){

  // var seed="";
  navigation.navigate('App Password', {
    mnemonicStr: mnemonic,
    word13Str: word13
  });
}



const CreateWallet = ({route, navigation}) => {


  const { mnemonicStr } = route.params;
  var mnemonic = JSON.stringify(mnemonicStr).replaceAll('"','');






const [word13flag, setword13flag] = useState(false);
const [word13, setword13] = useState("");
// const [ state, dispatch ] = React.useContext(UserContext)

  return (

    <SafeAreaView style={styles.container}>
   
     <View > 
      <Text style={styles.title}>Below is your mnemonic phrase. Write it down and keep them in a safe place. DO NOT take a photo of the phrase or copy and paste it anywhere. This key holds ALL YOUR FUNDS!</Text>
 <Separator/>
 <Text style={styles.mnemonic}>{mnemonic}</Text>
 <Separator/>
 
 <View style={styles.checkbox}> 
 <CheckBox 
    onClick={()=>{
      if(word13flag==false){
      setword13flag(true);
      }
      else setword13flag(false);
    }}
    isChecked={word13flag}
/> 
<Text style={styles.title2}>Add 25th word?</Text>
</View > 
{ word13flag && 

<PasswordInputText 
onChangeText={(password) => setword13( password )}
label='25th word' style={styles.title}/>
 }
<Separator/>
 <Button style={styles.title}
        title="Understood - Continue"
        enabled
        onPress={() => navigateAppPassword(navigation, mnemonic, word13)}
      />



{/* <TouchableOpacity style={styles.button} onPress={() => dispatch({ type: "toggle_button" })}>
     { state.active ? <Text>On</Text> : <Text>Off</Text> }  
        </TouchableOpacity> */}
        
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
    justifyContent: 'center',
    backgroundColor: 'white',
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
