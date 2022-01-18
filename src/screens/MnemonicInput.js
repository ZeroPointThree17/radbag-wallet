import React, {useState} from 'react';
import { Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { decrypt } from '../helpers/encrypt';
var SQLite = require('react-native-sqlite-storage');
import PasswordInputText from 'react-native-hide-show-password-input';
import { catchError } from 'rxjs/operators';
const bip39 = require('bip39');
import { StackActions } from '@react-navigation/native';

const Separator = () => (
  <View style={styles.separator} />
);


function navigateAppPassword(navigation, mnemonic, firstTime){

    mnemonic = mnemonic.replace(/\s\s+/g, ' ');

    mnemonicArr = mnemonic.split(" ");

    const words12sub = mnemonicArr.slice(0, 12);
    const word13sub = mnemonicArr.slice(12);

 
    var words12 = words12sub.join(' '); 
    var word13 = word13sub[0];
    if(word13 === undefined){
        word13="";
    }

    // alert(words12);
    // alert(word13);
   

    if(bip39.validateMnemonic(words12)){
    const pushAction = StackActions.push('App Password', {
        mnemonicStr: mnemonic,
        word13Str: word13,
        firstTimeStr: firstTime
      });
    
    navigation.dispatch(pushAction);
    } else{
        alert("Mnemonic is not valid")
    }
    

  }
  

 const MnemonicInput = ({route, navigation}) => {

    const { firstTimeStr } = route.params;
    var firstTime = JSON.stringify(firstTimeStr).replaceAll('"','');

  const [mnemonic, setMnemonic] = useState();
  
 return ( 
     <View style={styles.container}> 
<Text style={styles.title, {margin: 20}}>Enter your mnemonic below with words separated by a single space. Include 13th word if any.</Text>
 
<TextInput
    editable
    onChangeText={(input) => setMnemonic( input )}
      multiline={true}
      numberOfLines={4}
      autoCapitalize='none'
      style={{height: 150, padding: 10, margin:20, marginTop:10, borderWidth:StyleSheet.hairlineWidth}}
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
    justifyContent: 'center'
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
    marginVertical: 0,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default MnemonicInput;
