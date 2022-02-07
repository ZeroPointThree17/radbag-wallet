import React from 'react';
import { TouchableOpacity, ScrollView, Text, View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { copyToClipboard } from '../helpers/helpers';


const Receive = ({route, navigation}) => {
 
  const { xrdAddress } = route.params;

 return ( 
  <View style={styles.container}> 
    <ScrollView styles={{backgroundColor:"white"}}>
      <View style={styles.container}> 
       <Text style={{textAlign:'center', fontWeight:'bold', fontFamily:"AppleSDGothicNeo-Regular"}}>Radix Address QR Code:</Text>
       <Separator/>
<QRCode 
     value={xrdAddress}
     logoSize={100}
     size={200}
   />
   <Separator/>
   <Separator/>
   
   <Text style={{textAlign:'center', fontWeight:'bold', fontFamily:"AppleSDGothicNeo-Regular"}}>Radix Address:</Text>
   <Text style={{textAlign:'center', fontFamily:"AppleSDGothicNeo-Regular"}}>{xrdAddress}</Text>

   <Separator/>
   <Separator/>
 
   <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(xrdAddress)}}>
   <View style={styles.rowStyle}>
   <IconFeather name="copy" size={20} color="black" />
<Text style={{fontFamily:"AppleSDGothicNeo-Regular"}}> Copy address to clipboard</Text>
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
