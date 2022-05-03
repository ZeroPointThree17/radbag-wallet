import React, {useState} from 'react';
import { TouchableOpacity, ScrollView, Text, View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { getAppFont, copyToClipboard } from '../helpers/helpers';
import { PinCode, PinCodeT } from 'fedapay-react-native-pincode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { SERVFAIL } from 'dns';


const PIN = ({route, navigation}) => {
 

  const [pinSaveSpinner, setPinSaveSpinner] = useState();

  const customTexts = {

    set: {
        title: 'Set up a new PIN',
        subTitle: 'Enter 6 digits',
        repeat: 'Enter new PIN again',
        error: "PIN don't match. Start the process again.",
        backSpace: 'Del',
        cancel: undefined,
    },
  }

 return ( 
  <View style={[styles.container, {backgroundColor: "#183A81"}]}> 
    <ScrollView contentContainerStyle={{backgroundColor: "#183A81"}}>
    { pinSaveSpinner == true &&
<React.Fragment><Separator/><Separator/><Separator/><Progress.Circle style={{alignSelf:"center"}} size={30} indeterminate={true} /></React.Fragment>
}
    <PinCode mode={PinCodeT.Modes.Set} visible={true}  onSetCancel={() => {}}
          options={{
            pinLength: 6,
            maxAttempt: 9999999,
            lockDuration: 10000,
            allowedReset: true,
            disableLock: false,
            dotColor: global.modeTranslation,
          }}
          textOptions={{set: {
            backSpace: 'Del',
          }}}
      styles={{ 
        main: { backgroundColor: "#183A81"},
        enter: {
          titleContainer: { borderWidth: 0 },
          title: { color: "white" },
          subTitle: { color: "white" },
          buttonContainer: { borderWidth: 0 , color: "white"},
          buttonText: { color: "black" },
          buttons: { backgroundColor: 'white', borderWidth: 1 },
          footer: { borderWidth: 0 },
          footerText: { color: 'purple' },
          pinContainer: { borderWidth: 0,  },
          
        },
      }} 
      onSetSuccess={(newPin) => {
      
        setPinSaveSpinner(true)

        // navigation.addListener('beforeRemove', (e) => {
        //   e.preventDefault();
        // });

          AsyncStorage.setItem('@AppPIN', "SET").then( (newPin) => 
          {
            setTimeout(() => {

              showMessage({
                message: "App PIN successfully set!",
                type: "info",
                });

              setPinSaveSpinner(false)
              navigation.navigate('Settings');
            }, 3500);
          })
        } 
      }

      />
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  <Separator/>
  </ScrollView>
  </View>
  )
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: "white",
    alignItems:"center",
    justifyContent: "center"
   },
      rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 0
      },
});

export default PIN;
