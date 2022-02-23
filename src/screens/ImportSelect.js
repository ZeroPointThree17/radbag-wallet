import React from 'react';
import { Button, TouchableOpacity, ScrollView, Text, View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { getAppFont, copyToClipboard } from '../helpers/helpers';


const ImportSelect = ({route, navigation}) => {
 
  const { xrdAddress } = route.params;

 return ( 
  <View style={styles.container}> 
    <ScrollView styles={{backgroundColor:"white"}}>

    <Button style={getAppFont("black")}
        title="Import a Wallet via Mnemonic Phrase"
        enabled
        onPress={() => navigation.navigate('Mnemonic Input', {firstTimeStr: "true"})}
      />
      <Separator/>
      <Separator/>
      {Platform.OS != 'ios' && <Separator/>}
    {Platform.OS === 'ios' && <React.Fragment><Separator/><Button style={getAppFont("black")}
        title={"Import a Hardware Wallet\nvia Ledger Nano X Bluetooth\n\n(NOTE: Ledger Nano S is not supported on iOS)"}
        enabled
        onPress={() => navigation.navigate('Hardware Wallet USB', {firstTimeStr: "true"})}
      /></React.Fragment>}
      {Platform.OS != 'ios' && <Separator/>}
      {Platform.OS != 'ios' && <React.Fragment><Separator/><Button style={getAppFont("black")}
        title={"Import a Hardware Wallet\n(Ledger Nano S or X via USB)"}
        enabled
        onPress={() => navigation.navigate('Hardware Wallet USB', {firstTimeStr: "true"})}
      /></React.Fragment>}
      
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

export default ImportSelect;
