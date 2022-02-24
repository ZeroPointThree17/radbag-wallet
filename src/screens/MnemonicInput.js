import React, {useState} from 'react';
import { KeyboardAvoidingView,Button, Text, TextInput, View, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import { StackActions } from '@react-navigation/native';
import { Separator } from '../helpers/jsxlib';
import { getAppFont } from '../helpers/helpers';


function navigateAppPassword(navigation, mnemonic, firstTime){

    if(mnemonic.length > 0){
    mnemonic = mnemonic.replace(/\s\s+/g, ' ').replace(/(\r\n|\n|\r)/gm, "");
    mnemonic = mnemonic.trim();

    mnemonicArr = mnemonic.split(" ");

    const words12sub = mnemonicArr.slice(0, 12);
    const word13sub = mnemonicArr.slice(12);
 
    var words12 = words12sub.join(' '); 
    var word13 = word13sub[0];
    if(word13 === undefined){
        word13="";
    }

    if(bip39.validateMnemonic(words12)){
    const pushAction = StackActions.push('Wallet Password', {
        mnemonicStr: words12,
        word13Str: word13,
        firstTimeStr: firstTime,
        hardwareWallletPubKeyArr: []
      });
    
    navigation.dispatch(pushAction);
    } else{
        alert("Mnemonic is not valid")
    }
} else{
    alert("Mnemonic cannot be empty")
}

  }
  

 const MnemonicInput = ({route, navigation}) => {

    const { firstTimeStr } = route.params;
    var firstTime = JSON.stringify(firstTimeStr).replace(/"/g, '');

  const [mnemonic, setMnemonic] = useState("");
  
 return ( 
     <View style={styles.container}> 
     <Separator/>
<Text style={[getAppFont("black"), {margin: 20}]}>Enter your mnemonic below with words separated by a single space. Include 13th word if any.</Text>

<TextInput
    editable = {true}
    onChangeText={(input) => setMnemonic( input )}
      multiline={true}
      numberOfLines={4}
      autoCapitalize='none'
      style={[{height: 150, padding: 12, paddingTop: 12, margin:20, marginTop:10, borderWidth:1, borderRadius: 15, textAlignVertical: 'top'},getAppFont("black")]}
    />

 <Button style={styles.title}
        title="Submit"
        enabled
        onPress={() => navigateAppPassword(navigation, mnemonic, firstTime)}
      />

  </View>)
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
    paddingTop: 0,
    backgroundColor: "white",
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

export default MnemonicInput;
