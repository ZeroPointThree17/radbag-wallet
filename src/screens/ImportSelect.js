import React from 'react';
import { Button, TouchableOpacity, ScrollView, Text, View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { getAppFont, copyToClipboard } from '../helpers/helpers';


const ImportSelect = ({route, navigation}) => {
 
  const { firstTimeStr } = route.params;
  var firstTimeString = JSON.stringify(firstTimeStr).replace(/"/g, '');

 return ( 
  <View style={styles.container}> 
    {/* <ScrollView styles={{justifyContent: "center", alignItems:"center", backgroundColor:"white"}}> */}

    <Button style={getAppFont("black")}
        title="Import a Wallet via Mnemonic Phrase"
        enabled
        onPress={() => navigation.navigate('Mnemonic Input', {firstTimeStr: firstTimeString})}
      />
      {Platform.OS != 'ios' && <Separator/>}
    {Platform.OS === 'ios' && <React.Fragment><Separator/>
    <Button style={getAppFont("black")}
        title={"Import a Hardware Wallet via Ledger Nano X Bluetooth"}
        enabled
        onPress={() => navigation.push('Hardware Wallet', {firstTimeStr: firstTimeString, isBluetooth:"true"})}
      />
      <Separator/>
      <Separator/>
      <Text>NOTE: Ledger Nano S and USB connections are not supported on iOS</Text>
      </React.Fragment>
      }
      {Platform.OS != 'ios' && <Separator/>}
      {Platform.OS != 'ios' && <React.Fragment><Separator/><Button style={getAppFont("black")}
        title={"Import a Hardware Wallet\n(Ledger Nano S or X\nvia USB or Bluetooth)"}
        enabled
        onPress={() => navigation.push('Hardware Wallet', {firstTimeStr: firstTimeString, isBluetooth:"false"})}
      /></React.Fragment>}
      
      
  {/* </ScrollView> */}
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

export default ImportSelect;
