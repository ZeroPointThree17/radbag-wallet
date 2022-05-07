import { Button, ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import { StackActions } from '@react-navigation/native';
import CheckboxBouncy from "react-native-bouncy-checkbox";
import PasswordInputText from 'react-native-password-eye'; 
import { Separator } from '../helpers/jsxlib';
import { getAppFont } from '../helpers/helpers';
import { RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import RadioGroup from 'react-native-radio-buttons-group';

function navigateAppPassword(navigation, mnemonic, word13, firstTime){

  var trimmedWord13 = word13.trim();
  var trimmedMnemonic = mnemonic.trim();
  if(word13.length > 0 && trimmedWord13 == ""){
    alert("Custom word cannot consist only of spaces");
  } else {
  const pushAction = StackActions.push('Wallet Password', {
    mnemonicStr: trimmedMnemonic,
    word13Str: trimmedWord13,
    firstTimeStr: firstTime,
    hardwareWallletPubKeyArr: []
  });

navigation.dispatch(pushAction);
  }

}

const CreateWallet = ({route, navigation}) => {

  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic(128));
  const { firstTimeStr } = route?.params || {};
  var firstTime = JSON.stringify(firstTimeStr).replace(/"/g, '');

const [wordcustomflag, setwordcustomflag] = useState(false);
const [wordcustom, setwordcustom] = useState("");

// const [ state, dispatch ] = React.useContext(UserContext)

const radioButtonsData = 
[
  {
  id: '1', // acts as primary key, should be unique and non-empty string
  label: '12 Words',
  value: '128',
  selected: true,
  containerStyle:{color: global.modeTranslation},
  color: global.modeTranslation,
  borderColor: global.modeTranslation,
  labelStyle:{color: global.modeTranslation}
}, {
  id: '2',
  label: '18 Words',
  value: '192',
  selected: false,
  containerStyle:{color: global.modeTranslation},
  color: global.modeTranslation,
  borderColor: global.modeTranslation,
  labelStyle:{color: global.modeTranslation}
}, {
  id: '3',
  label: '24 Words',
  value: '256',
  selected: false,
  containerStyle:{color: global.modeTranslation},
  color: global.modeTranslation,
  borderColor: global.modeTranslation,
  labelStyle:{color: global.modeTranslation}
}
]

const [radioButtons, setRadioButtons] = useState(radioButtonsData)

function onPressRadioButton(radioButtonsArray) {
  radioButtonsArray.forEach(element => {
    if(element.selected == true){
      // alert(element.value)
      setMnemonic(bip39.generateMnemonic(element.value))
    }
  });
    // alert(JSON.stringify(radioButtonsArray))
    setRadioButtons(radioButtonsArray);
}


  return (

  <ScrollView style={[{backgroundColor:global.reverseModeTranslation}]}> 
  <Separator/>
  <View  style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}> 

      <Text style={[styles.title,getAppFont("black")]}>Below is your mnemonic phrase. Write it down and keep them in a safe place. DO NOT take a photo of the phrase or copy and paste it anywhere. This key holds ALL YOUR FUNDS!</Text>
      <Separator/>
      <Text style={[styles.title,getAppFont("black")]}>Select the number of words you want the mnemonic to be:</Text>
 
      <RadioGroup layout = "row"
                  color= "#555"
                  containerStyle={{color:"white"}}
                  borderColor= "white"
                  radioButtons={radioButtons} 
                  onPress={onPressRadioButton} 
              />
      <Separator/>
      <Separator/>
     <Text style={[styles.title,getAppFont("black")]}>Mnemonic Phrase:</Text>
 
      <Text style={[styles.mnemonic,getAppFont("black")]}>{mnemonic}</Text>
      <Separator/>
 
    <View style={styles.checkbox}> 

          <CheckboxBouncy
          fillColor="#183A81"
          iconStyle={{ borderColor: global.modeTranslation }}
          isChecked={wordcustomflag}
          onPress={()=>{
            if(wordcustomflag==false){
            setwordcustomflag(true);
            }
            else setwordcustomflag(false);
          }}
          />

        <Text style={[styles.title2,getAppFont("black")]}>Add custom word?</Text>
    </View > 
    { wordcustomflag && <React.Fragment><View style={{width: "80%"}}><PasswordInputText placeholder="Custom Word" secureTextEntry={true} eyeColor={global.modeTranslation} placeholderTextColor={global.modeTranslation} underlineColor={global.modeTranslation}  inputStyle={[{ padding:4, paddingLeft:10, height:40, borderRadius: 15, borderWidth: 1, borderColor: global.modeTranslation, color:global.modeTranslation}, getAppFont("black")]} 
    onChangeText={(password) => setwordcustom( password )}/></View></React.Fragment>
    }
    <Separator/>
    <Separator/>
    <Button style={[styles.title, getAppFont("black")]}
            title="Understood - Continue"
            enabled
            onPress={() => navigateAppPassword(navigation, mnemonic, wordcustom, firstTime)}
          />
  </View> 
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/> 
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/> 
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/> 
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/> 
  <Separator/>
  <Separator/>
  </ScrollView>
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
    marginHorizontal: 0,
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
