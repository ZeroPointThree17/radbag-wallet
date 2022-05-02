import React, {useRef, useEffect, useState} from 'react';
import { StyleSheet, View, Alert, Platform, PermissionsAndroid, TouchableOpacity, Linking} from "react-native";
import { Observable } from "rxjs";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import TransportHid from '@ledgerhq/react-native-hid';
import {showMessage} from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
var bigDecimal = require('js-big-decimal');
import IconFeather from 'react-native-vector-icons/Feather';
import { Text, Card, Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decrypt, CreateSharedSecret, decryptMessage } from './encryption';
import { bech32 } from 'bech32';
const hexyjs = require("hexyjs");
import { convertbits } from '../helpers/encryption';
var elliptic = require('elliptic');


export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function errorCB(err) {
  console.log("SQL Error: " + err.message);
}

export function openCB() {
  console.log("Database OPENED");
}

export function shortenAddress(address){

  var shortenedAddr;

  if(address != undefined){
    shortenedAddr = address.substring(0, 7) +"..."+ address.substring(address.length-5, address.length);
  } else{
    shortenedAddr = ""
  }

  return shortenedAddr;
}

export function last4(address){

  var shortenedAddr;
  
  if(address != undefined){
    shortenedAddr = address.substring(address.length-5, address.length);
  } else{
    shortenedAddr = ""
  }

  return shortenedAddr;
}

export function getAppFontNoMode(color){
  
  var font = "";
  if(Platform.OS === 'ios'){
    font = "AppleSDGothicNeo-Light"
  } else{
    font = "Roboto-Regular"
  }

  return {fontFamily: font, color: color};
}

export function getAppFont(color){

  var font = "";
  if(Platform.OS === 'ios'){
    font = "AppleSDGothicNeo-Light"
  } else{
    font = "Roboto-Regular"
  }

  if(global.isDarkMode){
    // if(color === "white"){
    //   color = "black"
    // }
    if(color === "black"){
      color = "white"
    }
    if(color === "blue"){
      color = "white"
    }
  }

  return {fontFamily: font, color: color};
}

export function copyToClipboard(string)  {
  Clipboard.setString(string)

      showMessage({
message: "Address copied to clipboard",
type: "info",
});
}

export function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

export function formatNumForDisplay(number) {

  var newNum = null;
  // alert(typeof number )
  if(typeof number == 'Object'){
    // alert("hi")
    newNum = isNaN(number)?new bigDecimal(0):number;
  } else{
    newNum = isNaN(number)?new bigDecimal(0):new bigDecimal(number);
  }

  var finalNum = new bigDecimal(bigDecimal.multiply(newNum.getValue(),0.000000000000000001,1800));

  finalNum = finalNum.getPrettyValue();

  if( finalNum == "" ){
    finalNum = "0"
  }

  return finalNum;
}

export function formatNumForHomeDisplay(number) {

  var num = new bigDecimal(formatNumForDisplay(number).replace(/,/g, ''));
  var result = num.round(2, bigDecimal.RoundingModes.DOWN).getPrettyValue(); 
  resArry = result.split(".")
  var resP1 = resArry[0]
  var resP2 = resArry[1].replace(/0+$/g, "");

  finalResult = resP1.concat(".", resP2).replace(/\.$/, "");;

  return finalResult;
}

export function formatCurrencyForHomeDisplay(number, currencySymbol) {
  
  var num = new bigDecimal(formatNumForDisplay(number).replace(/,/g, ''));
  var result = num.round(4, bigDecimal.RoundingModes.DOWN).getValue(); 

  const formatter = new Intl.NumberFormat(navigator.language || 'en-US', {
    style: 'currency',
    currency: currencySymbol,
    minimumFractionDigits: 4
  });

  return formatter.format(result);

}



export async function startScan(setTransport, setDeviceID, setDeviceName, scanStarted, setScanStarted, firstTimeString) {

  if(scanStarted == undefined){
    scanStarted = true;
  }

  if(firstTimeString == undefined){
    firstTimeString = "true";
  }

  if (Platform.OS === "android" && scanStarted == false && firstTimeString != "false") {

    Alert.alert(
      "Location Data Disclosure",
      "Raddish Wallet collects location data to enable bluetooth communications for Ledger Hardware Wallet even when the app is closed or not in use.",
     [
        {
          text: "Decline",
          onPress: () => alert("Location permissions for bluetooth connections declined. Bluetooth connections will not be established."),
          style: "cancel"
        },
        {
          text: "Accept",
          onPress: () => {
 
            // alert("starting scan")

               PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
              ).then( () => {
                PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                ).then( () => {
                  PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
                  ).then( () => {
                    PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
                ).then(() => {


            new Observable(TransportBLE.listen).subscribe({
              complete: () => {
                // alert("complete")
                // this.setState({ refreshing: false });
              },
              next: e => {
                // Alert.alert(JSON.stringify(e.descriptor))
                if (e.type === "add") {
                  //  Alert.alert(JSON.stringify(e.descriptor))
                  setDeviceID(e.descriptor.id)
                  setDeviceName(e.descriptor.name)
                  TransportBLE.open(e.descriptor).then((transport) => { setTransport(transport); })
                }
                // NB there is no "remove" case in BLE.
              },
              error: error => {
                // Alert.alert("error: " + error)
                // this.setState({ error, refreshing: false });
              }
            });

                })
              } )

              })
            })
            


          }
        }
        ]
    )
  } else {
    new Observable(TransportBLE.listen).subscribe({
      complete: () => {
        // alert("complete")
        // this.setState({ refreshing: false });
      },
      next: e => {
        // Alert.alert(JSON.stringify(e.descriptor))
        if (e.type === "add") {
          //  Alert.alert(JSON.stringify(e.descriptor))
          setDeviceID(e.descriptor.id)
          setDeviceName(e.descriptor.name)
          TransportBLE.open(e.descriptor).then((transport) => { setTransport(transport); })
        }
        // NB there is no "remove" case in BLE.
      },
      error: error => {
        // Alert.alert("error: " + error)
        // this.setState({ error, refreshing: false });
      }
    });
  }
    
  if(scanStarted == false){
    setScanStarted(true)
  }


};

export async function getUSB(setTransport, setUsbConn, setDeviceName) {

  var devices = await TransportHid.list();

  if (!devices[0]) {
     console.log("No device found.")
    // throw new Error('No device found.')
  } else {
    // Alert.alert("A device was found!")
    console.log("In send to hw 6")


    console.log("In send to hw 6.1")

    var transport = await TransportHid.create()

    setDeviceName(devices[0].name)
    setUsbConn(true);
    setTransport(transport)

  }
}



String.prototype.hexDecode = function() {
  
  // console.log("decoding hex: " + this)
  if(this.startsWith("01")){

    // return "<This message is encrypted. Decrypting messages on this wallet is currently not implemented>"
  } else if(this.startsWith("3030")){
    return hexyjs.hexToStr(hexyjs.hexToStr(this).slice(4));
  } else if(this.startsWith("0000")){

    var h = this.slice(4);

    var s = ''
    for (var i = 0; i < h.length; i+=2) {
        s += String.fromCharCode(parseInt(h.substr(i, 2), 16))
    }

      try{
        return decodeURIComponent(escape(s))
      } catch(e){
        return hexyjs.hexToStr(this.slice(4));
      }

  }
}

function toHexString(bytes) {

  var ec = new elliptic.ec('secp256k1');

  var compressed = bytes.map(function(byte) {
    return (byte & 0xFF).toString(16)
  }).join('').replace("4","0")

  var uncompressed = ec.keyFromPublic(compressed, 'hex').getPublic(false, 'hex');

  return uncompressed
}

export function getWalletPrivKey(privKey_enc, wallet_password){
  var privKey = Buffer.from(new Uint8Array(decrypt(privKey_enc, Buffer.from(wallet_password)).match(/.{1,2}/g).map(byte => parseInt(byte, 16))));
  
  return privKey;
}

export function fetchTxnHistory(gatewayIdx, address, setHistoryRows, stakingOnly, privKey_enc, setWallet_password, wallet_password){

  if(stakingOnly === undefined){
    stakingOnly = false;
  }


  if(address == undefined || address.length==0){
    alert("Address is required")
  }

  var count = 0;
  AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
           
  // alert("src addr: "+sourceXrdAddr+" dest: "+xrdAddr+ " token rri: "+reverseTokenMetadataMap.get(symbol) + " amount "+amountStr)
  fetch(global.gateways[gatewayIdx] + '/account/transactions', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
      
          {
              "network_identifier": {
              "network": "mainnet"
              },
              "account_identifier": {
              "address": address
              },
              "cursor": "0",
              "limit": 30
              }  
        )
      }).then((response) => response.json()).then((json) => {


        // console.log("FROM HISTORY ENC: "+this)
        // var sharedKey = CreateSharedSecret(Buffer.from(privKey, 'hex'),Buffer.from("04ea74a893f84afbd640c535128dc8d944f4b8cd109a746a4c2abb6f4c1f814471e6537b9205a568f188ba4c75bbb306befb6c9361daa58c2ed6e3d8ed740954e5",'hex'));
                   

        // alert(JSON.stringify(json))
       
          var historyRows = [];

          var count = 0;
           json.transactions.forEach( (txn) => 
              {
                var sharedKey = ""
                var raw_message =  txn.metadata.message

       
                  txn.actions.forEach(action => {

                    try{
                    var pubKeyIntermediate = bech32.decode(action.to_account.address)
                    var prefix = pubKeyIntermediate.prefix
                    var words = pubKeyIntermediate.words
                    var pubkey_bytes = convertbits(words, 5, 8, false);
                    toHexString(pubkey_bytes)
                    console.log("calculated pubkey bytes: "+ toHexString(pubkey_bytes))
                    } catch(error){
                      // do nothing, to_account address not found
                    }

                    if(txn.metadata.message != undefined && txn.metadata.message.startsWith("01") && wallet_password != undefined){
                      sharedKey = CreateSharedSecret(Buffer.from(getWalletPrivKey(privKey_enc, wallet_password), 'hex'),Buffer.from(toHexString(pubkey_bytes),'hex'));
                      // alert(sharedKey.toString('hex'))
                    }
                    var message = raw_message===undefined ? undefined : <View style={styles.rowStyle}><Text style={getAppFont("black")}>Message: {
                      
                      raw_message.startsWith("01") && sharedKey != undefined ?
                         decryptMessage(raw_message, Buffer.from(sharedKey.toString('hex'),'hex')) : raw_message.hexDecode()
    
                      }  {raw_message.startsWith("01") && decryptMessage(raw_message, Buffer.from(sharedKey.toString('hex'),'hex')) == "<encrypted>" ? <Text style={[{fontSize: 14, color: 'blue', textAlign:"center"}, getAppFont("blue")]}
                      onPress={() => {showPasswordPrompt(setWallet_password, "NO_RESPONSE", "Section will refresh with decrypted data in approximately 5 seconds...")}}>[Decrypt]</Text>: ""}</Text></View>
                      


                    var stakeFilter;
                    if(stakingOnly){
                      stakeFilter = action.type.toLowerCase().includes("stake") 
                    } else{
                      stakeFilter = true;
                    }

                    if( ((action.from_account != undefined && action.from_account.address == address) 
                    || (action.to_account != undefined && action.to_account.address == address))
                    && stakeFilter 
                    ){
                    count++;
                    var from_account = action.from_account===undefined ? undefined : <View style={[styles.rowStyle, {backgroundColor: global.reverseModeTranslation}]}><Text style={getAppFont("black")}>From: {shortenAddress(action.from_account.address)}  </Text>
                    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.from_account.address)}}>
                    <IconFeather name="copy" size={16} color={global.isDarkMode?"white":"#183A81"} />
                    </TouchableOpacity>
                    </View>
                    ;
                    var to_account = action.to_account===undefined ? undefined : <View style={[styles.rowStyle, {backgroundColor: global.reverseModeTranslation}]}><Text style={getAppFont("black")}>To: {shortenAddress(action.to_account.address)}  </Text>
                    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.to_account.address)}}>
                    <IconFeather name="copy" size={16} color={global.isDarkMode?"white":"#183A81"} />
                    </TouchableOpacity>
                    </View>
                    ;
                    var to_validator = action.to_validator===undefined ? undefined : <View style={[styles.rowStyle, {backgroundColor: global.reverseModeTranslation}]}><Text style={getAppFont("black")}>To Validator: {shortenAddress(action.to_validator.address)}  </Text>
                    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.to_validator.address)}}>
                    <IconFeather name="copy" size={16} color={global.isDarkMode?"white":"#183A81"} />
                    </TouchableOpacity>
                    </View>
                    ;
                    var from_validator = action.from_validator===undefined ? undefined : <View style={[styles.rowStyle, , {backgroundColor: global.reverseModeTranslation}]}><Text style={getAppFont("black")}>From Validator: {shortenAddress(action.from_validator.address)}  </Text>
                                        <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.from_validator.address)}}>
                    <IconFeather name="copy" size={16} color={global.isDarkMode?"white":"#183A81"} />
                    </TouchableOpacity>
                    </View>
                    ;
                    // var rri  = action.amount===undefined ? "" : "       Token ID: "+ shortenAddress(action.amount.token_identifier.rri); 
                    var value  = action.amount===undefined ? undefined : <Text style={getAppFont("black")}>Amount: {formatNumForDisplay(action.amount.value)} {action.amount.token_identifier.rri.split("_")[0].toUpperCase()} (Token RRI: {shortenAddress(action.amount.token_identifier.rri)})</Text>
                    var tkn_name  = action.token_properties===undefined ? undefined : <Text style={getAppFont("black")}>Token Name: {action.token_properties.name}</Text>
                    var tkn_symbol  = action.token_properties===undefined ? undefined: <Text style={getAppFont("black")}>Token Symbol: {action.token_properties.symbol.toUpperCase()}</Text>
                    var tkn_supply  = action.token_supply===undefined ? undefined: <Text style={getAppFont("black")}>Token Supply: {formatNumForDisplay(action.token_supply.value)}</Text>
                    var tkn_rri  = action.token_supply===undefined ? undefined: <Text style={getAppFont("black")}>Token RRI: {shortenAddress(action.token_supply.token_identifier.rri)}</Text>
                    var tkn_ismutable  = action.token_properties===undefined ? undefined: <Text style={getAppFont("black")}>Token is mutable?: {action.token_properties.is_supply_mutable.toString()}</Text>
                                                                           
                   // alert(JSON.stringify(action))
                    // if( action.from_account.address == address || action.to_account.address == address){
                      // alert("a-2")
                    var title = 
                    // "Transaction Hash: " + shortenAddress(txn.transaction_identifier.hash) + 
                    <Text style={getAppFont("black")}
                    onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/transactions/' + txn.transaction_identifier.hash)}}
                    >{action.type.replace(/([a-z])([A-Z])/g, '$1 $2') + "\n" + new Date(txn.transaction_status.confirmed_time).toLocaleString()}</Text>
                var details = []
                
                details.push(from_account)
                  details.push(to_account)
                    details.push(to_validator)
                      details.push(from_validator)
                        details.push(value)
                          details.push(message)
                            details.push(tkn_name)
                              details.push(tkn_symbol)
                                details.push(tkn_supply)
                                  details.push(tkn_rri)
                                    details.push(tkn_ismutable)
                // + message;

                // alert(JSON.stringify(action))
                historyRows.push(
                  <View key={count} style={{backgroundColor: global.reverseModeTranslation}}>
                  <Card containerStyle={{ backgroundColor: global.reverseModeTranslation }}>
              
                  <Card.Title style={{backgroundColor: global.reverseModeTranslation}}>{title}</Card.Title>
                  <Card.Divider />
                  <View style={{backgroundColor: global.reverseModeTranslation}}>
                  {details}
                  </View>
                </Card>
                </View>
                // <ScrollView nestedScrollEnabled={true} horizontal={true}><Text style={{fontSize: 12, textAlign:"center"}} numberOfLines={4}>{details}</Text><Separator/></ScrollView>

                    // }
                  )  
                }
              });

              count++;  
        }
        
        )

        setHistoryRows(historyRows)


})
}).catch((error) => {
  setNewGatewayIdx(gatewayIdx);
});
  
}

export function setNewGatewayIdx(gatewayIdx){

  showMessage({
    message: "Attemeping to re-connect to Radix",
    type: "danger",
    });

  if(parseInt(gatewayIdx)+1 >= global.gateways.length){
    AsyncStorage.setItem('@gatewayIdx',"0");
  } else{
    AsyncStorage.setItem('@gatewayIdx',(parseInt(gatewayIdx)+1).toString());
  }
}


const styles = StyleSheet.create({

  rowStyle: {
      flexDirection: 'row',
      fontSize: 4,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginVertical:0,
    },
   
});

export function showPasswordPrompt(setWallet_password, cancelResponse, successResponse){
  if(Platform.OS === 'ios'){
    promptFunc = Alert.prompt;
    } else{
    promptFunc = prompt
    }

    promptFunc(
      "Enter wallet password",
      "Enter the wallet password to perform this action",
      [
        {
          text: "Cancel",
          onPress: () => { if(cancelResponse != "NO_RESPONSE"){alert(cancelResponse)}},
          style: "cancel"
        },
        {
          text: "OK",
          onPress: password => {
            setWallet_password(password)
            if(successResponse != "NO_RESPONSE"){alert(successResponse)}
          }
        }
      ]
    )
}


export const currencyList = [
  {"label": "Prices in: USD", "value": "usd"},
  {"label": "Prices in: EUR", "value": "eur"},
  {"label": "Prices in: JPY", "value": "jpy"},
  {"label": "Prices in: GBP", "value": "gbp"},
  {"label": "Prices in: AUD", "value": "aud"},
  {"label": "Prices in: CAD", "value": "cad"},
  {"label": "Prices in: CHF", "value": "chf"},
  {"label": "Prices in: CNY", "value": "cny"},
  {"label": "Prices in: HKD", "value": "hkd"},
  {"label": "Prices in: NZD", "value": "nzd"},
  {"label": "Prices in: SEK", "value": "sek"},
  {"label": "Prices in: KRW", "value": "krw"},
  {"label": "Prices in: SGD", "value": "sgd"},
  {"label": "Prices in: NOK", "value": "nok"},
  {"label": "Prices in: MXN", "value": "mxn"},
  {"label": "Prices in: INR", "value": "inr"},
  {"label": "Prices in: RUB", "value": "rub"},
  {"label": "Prices in: ZAR", "value": "zar"},
  {"label": "Prices in: TRY", "value": "try"},
  {"label": "Prices in: BRL", "value": "brl"},
  {"label": "Prices in: TWD", "value": "twd"},
  {"label": "Prices in: DKK", "value": "dkk"},
  {"label": "Prices in: PLN", "value": "pln"},
  {"label": "Prices in: THB", "value": "thb"},
  {"label": "Prices in: IDR", "value": "idr"},
  {"label": "Prices in: HUF", "value": "huf"},
  {"label": "Prices in: CZK", "value": "czk"},
  {"label": "Prices in: ILS", "value": "ils"},
  {"label": "Prices in: CLP", "value": "clp"},
  {"label": "Prices in: PHP", "value": "php"},
  {"label": "Prices in: AED", "value": "aed"},
  {"label": "Prices in: SAR", "value": "sar"},
  {"label": "Prices in: MYR", "value": "myr"}
]
