import React from 'react';
import { TouchableOpacity, ScrollView, Text, View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { getAppFont, copyToClipboard } from '../helpers/helpers';


const Receive = ({route, navigation}) => {
 
  const { xrdAddress } = route.params;

 return ( 
  <View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}> 
    <ScrollView contentContainerStyle={{backgroundColor:global.reverseModeTranslation}}>
      <View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}> 
       <Text style={[{textAlign:'center', fontWeight:'bold'}, getAppFont("black")]}>Radix Address QR Code:</Text>
       <Separator/>
<QRCode 
     value={xrdAddress}
     logoSize={100}
     size={200}
   />
   <Separator/>
   <Separator/>
   
   <Text style={[{textAlign:'center', fontWeight:'bold'}, getAppFont("black")]}>Radix Address:</Text>
   <Text style={[{textAlign:'center'}, getAppFont("black")]}>{xrdAddress}</Text>

   <Separator/>
   <Separator/>
 
   <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(xrdAddress)}}>
   <View style={styles.rowStyle}>
   <IconFeather name="copy" size={20} color={global.modeTranslation} />
<Text style={getAppFont("black")}> Copy address to clipboard</Text>
</View>
</TouchableOpacity>

  </View>
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

export default Receive;
