import { Button, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import { StackActions } from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import PasswordInputText from 'react-native-hide-show-password-input';
import { Separator } from '../helpers/jsxlib';


function navigateAppPassword(navigation, mnemonic, word13, firstTime){

  var trimmedWord13 = word13.trim();
  if(word13.length > 0 && trimmedWord13 == ""){
    alert("13th word cannot consist only of spaces");
  } else {
  const pushAction = StackActions.push('App Password', {
    mnemonicStr: mnemonic,
    word13Str: trimmedWord13,
    firstTimeStr: firstTime
  });

navigation.dispatch(pushAction);
  }

}

const CreateWallet = ({route, navigation}) => {

  const[mnemonic, setMnemonic] = useState(bip39.generateMnemonic());
  const { firstTimeStr } = route.params;
  var firstTime = JSON.stringify(firstTimeStr).replaceAll('"','');

const [word13flag, setword13flag] = useState(false);
const [word13, setword13] = useState("");
// const [ state, dispatch ] = React.useContext(UserContext)

  return (

    <SafeAreaView style={styles.container}>
   <Separator/>
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
<Text style={styles.title2}>Add 13th word?</Text>
</View > 
{ word13flag && 

<PasswordInputText 
onChangeText={(password) => setword13( password )}
label='13th word' style={styles.title}/>
 }
<Separator/>
 <Button style={styles.title}
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
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  mnemonic: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 50,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: 'AppleSDGothicNeo-Regular'
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
