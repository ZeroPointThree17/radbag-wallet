import React, {useRef, useEffect} from 'react';
import { ScrollView, View, Alert, Platform, PermissionsAndroid} from "react-native";
import { Observable } from "rxjs";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import TransportHid from '@ledgerhq/react-native-hid';
import {showMessage} from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
var bigDecimal = require('js-big-decimal');
import prompt from 'react-native-prompt-android';
import { Separator } from './jsxlib';
import { Text, Card, Button, Icon } from 'react-native-elements';

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

export function getAppFont(color){

  var font = "";
  if(Platform.OS === 'ios'){
    font = "AppleSDGothicNeo-Light"
  } else{
    font = "Roboto-Regular"
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
    alert("hi")
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
  var result = num.round(4, bigDecimal.RoundingModes.DOWN).getPrettyValue(); 
  resArry = result.split(".")
  var resP1 = resArry[0]
  var resP2 = resArry[1].replace(/^0+|0+$/g, "");

  finalResult = resP1.concat(".", resP2).replace(/\.$/, "");;

  return finalResult;
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


export function fetchTxnHistory(address, setHistoryRows, stakingOnly){

  if(stakingOnly === undefined){
    stakingOnly = false;
  }


  if(address == undefined || address.length==0){
    alert("Address is required")
  }

  // alert("src addr: "+sourceXrdAddr+" dest: "+xrdAddr+ " token rri: "+reverseTokenMetadataMap.get(symbol) + " amount "+amountStr)
  fetch('https://raddish-node.com:6208/account/transactions', {
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
              "address": "rdx1qsp75a9gj0uy477kgrzn2y5derv5fa9ce5gf5ar2fs4tkm6vr7q5gugnnw9me"
              },
              "cursor": "0",
              "limit": 30
              }  
        )
      }).then((response) => response.json()).then((json) => {

        // alert(JSON.stringify(json))
          var historyRows = [];
          var count = 0;
           json.transactions.forEach(txn => 
              {
                 
                var message  = txn.metadata.message===undefined ? "" : "\nMessage: " + txn.metadata.message;
                  
                  txn.actions.forEach(action => {

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
                    var from_account = action.from_account===undefined ? "" : "\nFrom: " + shortenAddress(action.from_account.address);
                    var to_account = action.to_account===undefined ? "" : "\nTo: "+ shortenAddress(action.to_account.address);
                    var to_validator = action.to_validator===undefined ? "" : "\nTo Validator: " + shortenAddress(action.to_validator.address);
                    var from_validator = action.from_validator===undefined ? "" : "\nFrom Validator: " + shortenAddress(action.from_validator.address);
                    // var rri  = action.amount===undefined ? "" : "       Token ID: "+ shortenAddress(action.amount.token_identifier.rri); 
                    var value  = action.amount===undefined ? "" : "\nAmount: " + formatNumForDisplay(action.amount.value) + " " + action.amount.token_identifier.rri.split("_")[0].toUpperCase() + "  " + "(Token ID: "+ shortenAddress(action.amount.token_identifier.rri) + ")"; 
                    
                   // alert(JSON.stringify(action))
                    // if( action.from_account.address == address || action.to_account.address == address){
                      // alert("a-2")
                    var title = 
                    // "Transaction Hash: " + shortenAddress(txn.transaction_identifier.hash) + 
                    action.type.replace(/([a-z])([A-Z])/g, '$1 $2') + "\n" + new Date(txn.transaction_status.confirmed_time).toLocaleString() + ""
                var details = from_account +
                to_account +
                to_validator +
                from_validator + 
                value 
                // + message;

                // alert(JSON.stringify(action))
                historyRows.push(
                  <View key={count}>
                  <Card >
                  <Card.Title>{title}</Card.Title>
                  <Card.Divider />
 
                        <Text style={[{fontSize: 12}, getAppFont("black")]}>{details.replace(/^\s+|\s+$/g, '')}</Text>
              
              
                </Card>
                </View>
                // <ScrollView nestedScrollEnabled={true} horizontal={true}><Text style={{fontSize: 12, textAlign:"center"}} numberOfLines={4}>{details}</Text><Separator/></ScrollView>

                    // }
                  )  
                }
              });

             
        })

        setHistoryRows(historyRows)


})
}
