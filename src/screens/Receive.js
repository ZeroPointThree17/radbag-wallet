import React, {useRef, useState} from 'react';
import { TouchableOpacity, ScrollView, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import Clipboard, {useClipboard} from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";

const Separator = () => (
  <View style={styles.separator} />
);

const Receive = ({route, navigation}) => {
 
  const { xrdAddress } = route.params;

  const copyToClipboard = (string) => {
    Clipboard.setString(string);
// alert(string)
        showMessage({
  message: "Address copied to clipboard",
  type: "info",
});
  }

 return ( 
    
      <View style={styles.container}> 
      <ScrollView>
       <Text style={{textAlign:'center', fontWeight:'bold'}}>Radix Address QR Code:</Text>
       <Separator/>
<QRCode 
     value={xrdAddress}
     logoSize={100}
     size={200}
   />
   <Separator/>
   <Separator/>
   
   <Text style={{textAlign:'center', fontWeight:'bold'}}>Radix Address:</Text>
   <Text style={{textAlign:'center'}}>{xrdAddress}</Text>

   <Separator/>
   <Separator/>
 
   <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(xrdAddress)}}>
   <View style={styles.rowStyle}>
   <IconFeather name="copy" size={20} color="black" />
<Text> Copy address to clipboard</Text>
</View>
</TouchableOpacity>
</ScrollView>
  </View>

  )
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 70,
    margin: 0,
    backgroundColor: "white",
    alignItems:"center",
    justifyContent: "center"
   },

   separator: {
    marginVertical: 10,
    borderBottomColor: '#737373',
    borderBottomWidth: 0,
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
