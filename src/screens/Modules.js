import React from 'react';
import { Image, TouchableOpacity, ScrollView, Text, View, StyleSheet, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator, SeparatorBorder, SeparatorBorderMargin } from '../helpers/jsxlib';
import { getAppFont, copyToClipboard } from '../helpers/helpers';
var doge3skin = require("../assets/modules/skins/doge3skin.png");
import { Searchbar } from 'react-native-paper';

const Modules = ({route, navigation}) => {
 
  // const { xrdAddress } = route.params;

 return ( 
  <View style={styles.container}> 
    <ScrollView styles={{backgroundColor:"white"}}>
      <View > 
     
      <Separator/>
      <Separator/>
       <Text style={[{textAlign:'center', fontWeight:'bold'}, getAppFont("black")]}>Modules</Text>
       <Separator/>
       <Searchbar
        placeholder="Type Here..."
        onChangeText={() => {alert("a")}}
        value={"Search..."}
      />
      <Separator/>
      <Separator/>
<Text style={[{fontSize: 16}, getAppFont("black")]}>Wallet Skins</Text>
<SeparatorBorderMargin/>

<Image source={doge3skin} style={{width:65, height:65, borderRadius:15}} />
<Text style={[{fontSize: 12}, getAppFont("black")]}> Doge3 Skin</Text>
<Separator/>

<Text style={[{fontSize: 16}, getAppFont("black")]}>NFTs</Text>
<SeparatorBorderMargin/>
<Separator/>

<Text style={[{fontSize: 16}, getAppFont("black")]}>Decentralized Exchanges (DEXs)</Text>
<SeparatorBorderMargin/>
<Separator/>

<Text style={[{fontSize: 16}, getAppFont("black")]}>Miscellaneous</Text>
<SeparatorBorderMargin/>
<Separator/>
{/* <QRCode 
     value={xrdAddress}
     logoSize={100}
     size={200}
   /> */}
   <Separator/>
   <Separator/>
   
   <Separator/>
   <Separator/>
 
   {/* <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(xrdAddress)}}>
   <View style={styles.rowStyle}>
   <IconFeather name="copy" size={20} color="black" />
<Text style={getAppFont("black")}> Copy address to clipboard</Text>
</View>
</TouchableOpacity> */}

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
    // alignItems:"center",
    justifyContent: "flex-start"
   },
      rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:5
      },
});

export default Modules;
