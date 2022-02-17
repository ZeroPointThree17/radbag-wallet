import { Button, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import { StackActions } from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import PasswordInputText from 'react-native-hide-show-password-input';
import { Separator } from '../helpers/jsxlib';
import { getAppFont } from '../helpers/helpers';


function navigateAppPassword(navigation, mnemonic, word13, firstTime){

  var trimmedWord13 = word13.trim();
  var trimmedMnemonic = mnemonic.trim();
  if(word13.length > 0 && trimmedWord13 == ""){
    alert("13th word cannot consist only of spaces");
  } else {
  const pushAction = StackActions.push('App Password', {
    mnemonicStr: trimmedMnemonic,
    word13Str: trimmedWord13,
    firstTimeStr: firstTime
  });

navigation.dispatch(pushAction);
  }

}

const CreateWallet = ({route, navigation}) => {

  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic());
  const { firstTimeStr } = route?.params || {};
  var firstTime = JSON.stringify(firstTimeStr).replace(/"/g, '');

const [word13flag, setword13flag] = useState(false);
const [word13, setword13] = useState("");
// const [ state, dispatch ] = React.useContext(UserContext)

  return (

    <SafeAreaView style={styles.container}>
   <Separator/>
     <View > 
      <Text style={[styles.title,getAppFont("black")]}>Below is your mnemonic phrase. Write it down and keep them in a safe place. DO NOT take a photo of the phrase or copy and paste it anywhere. This key holds ALL YOUR FUNDS!</Text>
 <Separator/>
 <Text style={[styles.mnemonic,getAppFont("black")]}>{mnemonic}</Text>
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
<Text style={[styles.title2,getAppFont("black")]}>Add 13th word?</Text>
</View > 
{ word13flag && 

<PasswordInputText 
onChangeText={(password) => setword13( password )}
label='13th word' style={[styles.title,getAppFont("black")]}/>
 }
<Separator/>
 <Button style={[styles.title, getAppFont("black")]}
        title="Understood - Continue"
        enabled
        onPress={() => navigateAppPassword(navigation, mnemonic, word13, firstTime)}
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
    fontWeight: "bold",
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
