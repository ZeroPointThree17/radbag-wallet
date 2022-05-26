import React, {useState, useEffect} from 'react';
import { TouchableOpacity, ScrollView, Text, View, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { useInterval, getAppFont,  openCB, errorCB, shortenAddress } from '../helpers/helpers';
import {getWallets, getDDIndex, getCurrData} from '../helpers/tokenRetrieval'
var SQLite = require('react-native-sqlite-storage');
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions } from '@react-navigation/native';






const URLRequestRouter = ({route, navigation}) => {

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);
  var initialEnabledAddresses = new Map();
  const [addressBalances, setAddressBalances] = useState(new Map())
  const [wallets, setWallets] = useState([{label: "Setting up...", value:""}]);
  const [label, setLabel] = useState();
  const [value, setValue] = useState();
  const [isFocusAddr, setIsFocusAddr] = useState(false);
  const [labelAddr, setLabelAddr] = useState();
  const [valueAddr, setValueAddr] = useState();
  const [activeWallet, setActiveWallet] = useState(1);
  const [activeAddress, setActiveAddress] = useState(1);
  const [enabledAddresses, setEnabledAddresses] = useState(initialEnabledAddresses);
  const [isHW, setIsHW] = useState()
  const [tokenPrices, setTokenPrices] = useState();
  const [tokenFilter, setTokenFilter] = useState("");
  const [hiddenTokens, setHiddenTokens] = useState([]);
  const [currLabel, setCurrLabel] = useState();
  const [currValue, setCurrValue] = useState();

  // useInterval(() => {
  //   AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
  //     getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
  
  // });
  // }, 3500);
  

  useEffect( () => {
    AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
      getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
  
  });
  },[]);

  
 
  var { defaultRriParam, defaultSymbolParam 
    , messageFromRequester, destinationAddr, txnMessage, encryptredFlag, amountNum, tokenSymbol
    , tokenRRI, disableDestinationAddrTxtInput, disableEncryptionBtn, disableAmtTxtInput, disableTokenTypeDropdown
    , returnToForwarderLocationAfterSend, returnToURLAfterSend, returnURL
  } = route.params;

  //  alert(isHW)
  if(defaultRriParam != undefined && defaultSymbolParam != undefined && enabledAddresses.size > 0 && enabledAddresses.get(activeAddress) != undefined && activeAddress != undefined && isHW != undefined ){
  var dropdownVals = []
  enabledAddresses.forEach((element)=> 
    {
      console.log("Enabled Address (Router Screen): "+JSON.stringify(element));
      dropdownVals.push(element);
    }
  )

  hdpathIndex = getDDIndex(dropdownVals, activeAddress);


  navigation.replace("RadBag Wallet");               

navigation.navigate('Send',{defaultRri: defaultRriParam, defaultSymbol:defaultSymbolParam + " (" + shortenAddress(defaultRriParam) + ")", 
  sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address, hdpathIndex: getDDIndex(dropdownVals,activeAddress), isHWBool: isHW})
       

  }

 return ( 
  <View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}> 
    <ScrollView contentContainerStyle={{backgroundColor:global.reverseModeTranslation}}>
      <View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}> 
       <Text style={[{textAlign:'center', fontWeight:'bold'}, getAppFont("black")]}>Routing Request...</Text>
       <Separator/>
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

export default URLRequestRouter;
