import React, {useState, useEffect, useRef} from 'react';
import { Keyboard, Image, ImageBackground, useColorScheme, TouchableOpacity, Linking, Alert, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { decrypt } from '../helpers/encryption';
import SelectDropdown from 'react-native-select-dropdown'
import IconFeather from 'react-native-vector-icons/Feather';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { Separator } from '../helpers/jsxlib';
import { getWalletPrivKey, getAppFont, openCB, errorCB, useInterval, shortenAddress, fetchTxnHistory, formatNumForDisplay, startScan, getUSB, setNewGatewayIdx, getAppFontNoMode } from '../helpers/helpers';
import { buildTxn, getBalances } from '../helpers/gatewayCalls';
import { isElementAccessExpression, validateLocaleAndSetLanguage } from 'typescript';
var bigDecimal = require('js-big-decimal');
var GenericToken = require("../assets/generic_token.png");
var GenericTokenInverted = require("../assets/generic_token_inverted.png");
import * as Progress from 'react-native-progress';
import CheckboxBouncy from "react-native-bouncy-checkbox";
import { log, BufferReader } from '@radixdlt/util'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hideMessage, showMessage } from 'react-native-flash-message';
var SQLite = require('react-native-sqlite-storage');
var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);


String.prototype.hexEncode = function(){
  var s = unescape(encodeURIComponent(this))
  var h = ''
  for (var i = 0; i < s.length; i++) {
      h += s.charCodeAt(i).toString(16)
  }
  return h
}


 const Send = ({route, navigation}) => {
 
  var { defaultRri, defaultSymbol, sourceXrdAddr, hdpathIndex, isHWBool } = route.params;
  const [privKey_enc, setPrivKey_enc] = useState();
  const [wallet_password, setWallet_password] = useState();
  const [public_key, setPublic_key] = useState();
  const [destAddr, onChangeDestAddr] = useState();
  const [amount, onChangeAmount] = useState(null);
  const [symbol, onChangeSymbol] = useState(defaultSymbol);
  const [message, onChangeMessage] = useState();
  const [txnHash, setTxHash] = useState(null);
  const [show, setShow] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  // const [currentBalance, setCurrentBalance] = useState(false);
  const [symbols, setSymbols] = useState([]);
  // const [rri, setRRI] = useState();
  const [balances, setBalances] = useState(new Map());
  const [symbolToRRI, setSymbolToRRI] = useState(new Map());
  const [iconURIs, setIconURIs] = useState(new Map());
  const [tokenNames, setTokenNames] = useState(new Map());
  const [gettingBalances, setGettingBalances] = useState();
  const [submitEnabled, setSubmitEnabled] = useState(true);
  const [bluetoothHWDescriptor, setBluetoothHWDescriptor] = useState();
  const [transport, setTransport] = useState();
  const [deviceID, setDeviceID] = useState();
  const [deviceName, setDeviceName] = useState("Looking for device...");
  const [usbConn, setUsbConn] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);
  const [encryptMsgflag, setEncryptMsgflag] = useState(false)
  const [hashToDecrypt, setHashToDecrypt] = useState([])
  const [decryptedMap, setDecryptedMap] = useState(new Map())
  global.isDarkMode = useColorScheme() === 'dark';
  global.modeTranslation = useColorScheme() === 'dark' ? "white" : "black";
  global.reverseModeTranslation = useColorScheme() === 'dark' ? "black" : "white";
  global.linkModeTranslation = useColorScheme() === 'dark' ? "white" : "blue";

  // sourceXrdAddr = "rdx1qsplgax6sgeqqflwsalad3u7pds83wr892ayrxrhs7r3e2vc9m3dejq6sapew"
  // sourceXrdAddr = "rdx1qspxwq6ejym0hqvtwqz6rkmfrxgegjf6y0mz63pveks7klunlgcdswgmrj34g"
  // sourceXrdAddr = "rdx1qspa05gfcxux87nlw7rrky86pptmwc9hsev73retl57tykgs9llwqrswl9jrg"
  // sourceXrdAddr = "rdx1qspz0gxzprhegk8dsf8u5zknmpf68f5g8c4dhlex0n3uypky3f5z6dqsxwleh"

  useEffect( () => {
    AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
      getBalances(gatewayIdx, defaultRri, true, setGettingBalances,sourceXrdAddr, setSymbols, setSymbolToRRI, setBalances,setPrivKey_enc,setPublic_key, setIconURIs, setTokenNames);
      getBalances(gatewayIdx, undefined, false, setGettingBalances,sourceXrdAddr, setSymbols, setSymbolToRRI, setBalances,setPrivKey_enc,setPublic_key, setIconURIs, setTokenNames); 
      fetchTxnHistory(db, gatewayIdx, sourceXrdAddr, setHistoryRows, false, hashToDecrypt, setHashToDecrypt, setDecryptedMap, decryptedMap, isHWBool, usbConn, transport, deviceID, hdpathIndex);
    })
  
},[]);

useInterval(() => {

  if(transport == undefined){
    startScan(setTransport, setDeviceID, setDeviceName);
    getUSB(setTransport, setUsbConn, setDeviceName);
  }

  AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {    
    getBalances(gatewayIdx, undefined, false, setGettingBalances,sourceXrdAddr, setSymbols, setSymbolToRRI, setBalances,setPrivKey_enc,setPublic_key, setIconURIs, setTokenNames);
    fetchTxnHistory(db, gatewayIdx, sourceXrdAddr, setHistoryRows, false, hashToDecrypt, setHashToDecrypt, setDecryptedMap, decryptedMap, isHWBool, usbConn, transport, deviceID, hdpathIndex);
  })
}, 4000);


// alert(defaultSymbol)
  const onSuccess = e => {
    onChangeDestAddr(e.data);
    setCameraOn(false);
  };

  console.log(symbols)

  const addrFromRef = useRef();
  const addrToRef = useRef();
  const amountRef = useRef();
  const msgRef = useRef();
  const [error, setError]=useState(false);

 return ( 
   <View style={[styles.container, {backgroundColor: global.reverseModeTranslation}]}>
     <ScrollView nestedScrollEnabled={true}> 

<View style={[styles.rowStyle, {alignSelf: "center"}]}>

{ gettingBalances &&
<Progress.Circle style={{alignSelf:"center", marginBottom:10, marginRight: 12}} size={25} indeterminate={true} />
}

      <View style={[{alignSelf: "center"}]}>

      <View style={[styles.rowStyle, {alignSelf: "center"}]}>
     
    
      {/* <ImageBackground
    style={{
      width: 25,
      height: 25
    }}
    source={
      require("../assets/generic_token.png") //Indicator
    }> */}
<Image style={{width: 25, height: 25}}
    defaultSource={global.isDarkMode ? GenericTokenInverted : GenericToken}
    source={
      {uri: iconURIs.get(symbol)}
    }/> 
    {/* </ImageBackground> */}

  <Text style={[{fontSize:20, textAlign:"center"}, getAppFont("black")]}> {tokenNames.get(symbol) + " (" + symbol.split(" (")[0] + ")"}</Text>
  </View>
  <Text style={[{fontSize:14, textAlign:"center"}, getAppFont("black")]}>Token RRI: {shortenAddress(symbolToRRI.get(symbol))}</Text>
  </View>
     </View>
     {/* <Text style={[{color: 'black', textAlign: "center"}, getAppFont("black")]}>Token RRI: {shortenAddress(symbolToRRI.get(symbol))}</Text> */}
     <Text
       style={[{marginVertical:4, textAlign: "center", textDecorationLine: "underline"}, getAppFont("#4DA892")]}
       disabled = {symbolToRRI.get(symbol) == undefined}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/tokens/'+symbolToRRI.get(symbol))}}
     >Token Details</Text>
     <Separator/>
   
     <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Address you are sending from:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={addrFromRef}
        style={[{padding:10, borderWidth:1, height:55, borderColor: global.modeTranslation, backgroundColor:"#d3d3d3", flex:1, borderRadius: 15}, getAppFontNoMode("black")]}
        disabled="true"
        multiline={true}
        numberOfLines={2}
        autoCapitalize='none'
        placeholder='Radix Address sending from'
        value={sourceXrdAddr}
      />
      </View>
      <Separator/>
 
      { cameraOn &&
      <QRCodeScanner
      cameraStyle={{width:'auto', height:200}}
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
      />
      }
<View style={styles.sendRowStyle}>
      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12, flex:1}, getAppFont("black")]}>{"\n"}Address to send to:</Text>
      <TouchableOpacity style={{justifyContent:'center'}} onPress={() => {setCameraOn(!cameraOn)} }>
      <Text style={[{ textAlign:'center', marginHorizontal: 0, fontSize:8}, getAppFont("black")]}>Scan QR</Text>
  
 <IconMaterial style={{justifyContent:'center', alignSelf:'center', color: global.modeTranslation}} name="qrcode-scan" size={20} color="black" />
 </TouchableOpacity>
 </View>

      <View style={styles.rowStyle}>

<TextInput ref={addrToRef}
style={[{padding:10, borderWidth:1, flex:1, borderRadius: 15, borderColor: global.modeTranslation, textAlignVertical: 'top'}, getAppFont("black")]}
        placeholder='Destination Radix Address'
        placeholderTextColor="#d3d3d3"
        value={destAddr}
        onChangeText={value => onChangeDestAddr(value)}
        autoCapitalize='none'
        multiline={true}
        numberOfLines={2}
      />
       <Separator/>

</View>

<Separator/>
   
   <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Message (optional):</Text>
   <View style={[styles.rowStyleCenter]}>

      <TextInput ref={msgRef}
      style={[{flex:1, padding:10, borderWidth:1, height:55, borderRadius: 15, borderColor: global.modeTranslation, textAlignVertical: 'top'}, getAppFont("black")]}
      multiline={true}
      numberOfLines={4}
      autoCapitalize='none'
      placeholder='Message to send in transaction'
      placeholderTextColor="#d3d3d3"
      onChangeText={value => onChangeMessage(value)}
    />
  
  <React.Fragment>
      <View style={{textAlign:"center", alignContent:"flex-end", justifyContent:"center"}}>
      <Text style={[{fontSize:12, textAlign:"center"},getAppFont("black")]}> Encrypt?</Text>
      <CheckboxBouncy
          fillColor="#4DA892"
          style={[{marginTop: 4, fontSize:12, textAlign:"center", flexDirection:"column"},getAppFont("black")]}
          iconStyle={[{ borderColor: global.modeTranslation }]}
          isChecked={encryptMsgflag}
          onPress={()=>{
            if(encryptMsgflag==false){
              setEncryptMsgflag(true);
            }
            else{
              setEncryptMsgflag(false);
            }
          }}
          />

      </View>
  </React.Fragment>

    </View>
<Separator/>


<Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Amount to send:</Text>
{/* <View > */}
<TextInput ref={amountRef}
        style={[{padding:10, borderWidth:1, flex:1, borderRadius: 15, borderColor: global.modeTranslation,}, getAppFont("black")]}
        placeholder='Amount'
        autoCapitalize='none'
        placeholderTextColor="#d3d3d3"
         value={amount}
        onChangeText={value => {
          
          var cleanedVal = value.replace(/^0+/, '').replace(/,/g, '');
          
          if(!isNaN(cleanedVal)){
            onChangeAmount(new bigDecimal(cleanedVal).getPrettyValue())
          } else{
            onChangeAmount(value);
          }
        }  
      }
      />
<Separator/>
<Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Token type:</Text>
{ symbols.length > 0 &&
<React.Fragment>
  <View style={{alignSelf: 'center'}}>
<SelectDropdown
 buttonStyle={[{height: 44, backgroundColor:"#183A81", width: '100%', borderWidth:1, marginRight:0, borderRadius: 15}, getAppFont("black")]}
 buttonTextStyle={{color:"white", size:16}}
	data={symbols}
  defaultValue={defaultSymbol}
	onSelect={(selectedItem, index) => {
		onChangeSymbol(selectedItem)
	}}
	buttonTextAfterSelection={(selectedItem, index) => {
		// text represented after item is selected
		// if data array is an array of objects then return selectedItem.property to render after item is selected
		return selectedItem
	}}
	rowTextForSelection={(item, index) => {
		// text represented for each item in dropdown
		// if data array is an array of objects then return item.property to represent item in dropdown
		return item
	}}
/></View></React.Fragment>}
{/* </View> */}
<Separator/>
<Text style={[{fontSize: 12, color:"black"}, getAppFont("black")]}>Current liquid balance: {formatNumForDisplay(balances.get(symbolToRRI.get(symbol)))} {symbol.trim()}</Text>

{isHWBool==true && <React.Fragment><Separator/><Separator/>
  <Text style={[{fontSize: 12, color:"black"}, getAppFont("black")]}>Hardware Wallet: {deviceName}</Text></React.Fragment>}

  <Separator/>
  <Separator/>
  <Separator/>
  <TouchableOpacity enabled={submitEnabled} onPress={() => {addrFromRef.current.blur();addrToRef.current.blur();amountRef.current.blur();
    
      AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
        buildTxn(gatewayIdx, usbConn, setSubmitEnabled,symbolToRRI.get(symbol), sourceXrdAddr, destAddr, symbol, amount, message, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHWBool, transport, deviceID, encryptMsgflag)
      })
      
      }}>
      <View style={[styles.sendRowStyle]}>
        <View style ={[styles.sendRowStyle,{borderWidth:1, borderRadius:15, padding: 10, backgroundColor:"#183A81"}]}>
          <Text style={[{fontSize: 19, color:"black", alignSelf:"center"}, getAppFont("white")]}>
          <IconFeather name="send" size={19} color="white" style={{alignSelf:"center"}}/> Send</Text>
        </View>
      </View>

  </TouchableOpacity>
  <Separator/>
  <Separator/>
  <Separator/>

  { show == true &&
  <React.Fragment><Text
        style={[{textAlign: "center"}, getAppFont("#4DA892")]}
        onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/transactions/'+txnHash)}}
      >
        Transaction has been submitted.{"\n\n"}Transaction hash is: {txnHash}{"\n\n"}Click here for transaction details. Refresh page if transaction does not immediately display.
      </Text>
      <Separator/>
      <Separator/>
  </React.Fragment>
  }

  <Separator/>


  {historyRows.length > 0 && 
    <React.Fragment>
      <Text style={[{fontSize: 14, alignSelf:"center"}, getAppFont("black")]}>Transaction History (last 30 transactions)</Text>
      {historyRows}
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
      <Separator/>
    </React.Fragment>
  }
  </ScrollView>

  </View>)
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 25,
    margin: 0,
    backgroundColor: "white",
    justifyContent: "flex-start"
   },
  rowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical:5
  },
  rowStyleCenter: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical:5
  },
  sendColStyle: {
    flexDirection: 'column',
    fontSize: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical:0
  },
  sendRowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical:0
  },
});

export default Send;
