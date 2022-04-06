import React from 'react';
import { TouchableOpacity, ScrollView, Text, View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { getAppFont, copyToClipboard } from '../helpers/helpers';
import { PinCode, PinCodeT } from 'fedapay-react-native-pincode';
import AsyncStorage from '@react-native-async-storage/async-storage';


const PIN = ({route, navigation}) => {
 
 return ( 
  <View style={styles.container}> 
    <ScrollView styles={{backgroundColor:"white"}}>
    <PinCode mode={PinCodeT.Modes.Set} visible={true} 
          options={{
            pinLength: 6,
            maxAttempt: 9999999,
            lockDuration: 10000,
            allowedReset: true,
            disableLock: false
          }}
      styles={{ 
        main: { backgroundColor:"black" },
        enter: {
          titleContainer: { borderWidth: 1 },
          title: { color: 'yellow' },
          subTitle: { color: 'red' },
          buttonContainer: { borderWidth: 1 },
          buttonText: { color: 'blue' },
          buttons: { backgroundColor: 'green' },
          footer: { borderWidth: 1 },
          footerText: { color: 'purple' },
          pinContainer: { borderWidth: 1 }
        },
      }} 
      onSetSuccess={(newPin) => {
          AsyncStorage.setItem('@AppPIN', "SET").then( (newPin) => 
          {
            alert('App PIN successfully set!')
            navigation.navigate('Settings')
          })
        }
      }
      />

  </ScrollView>
  </View>
  )
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 30,
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
        marginVertical:5
      },
});

export default PIN;
