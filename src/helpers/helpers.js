import React, {useRef, useEffect} from 'react';
import { StyleSheet, View, Alert, Platform, PermissionsAndroid, TouchableOpacity, Linking} from "react-native";
import { Observable } from "rxjs";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import TransportHid from '@ledgerhq/react-native-hid';
import {showMessage} from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
var bigDecimal = require('js-big-decimal');
import IconFeather from 'react-native-vector-icons/Feather';
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
  var result = num.round(4, bigDecimal.RoundingModes.DOWN).getPrettyValue(); 
  resArry = result.split(".")
  var resP1 = resArry[0]
  var resP2 = resArry[1].replace(/^0+|0+$/g, "");

  finalResult = resP1.concat(".", resP2).replace(/\.$/, "");;

  return finalResult;
}

export function formatCurrencyForHomeDisplay(number, currencySymbol) {

  var num = new bigDecimal(formatNumForDisplay(number).replace(/,/g, ''));
  var result = num.round(6, bigDecimal.RoundingModes.DOWN).getValue(); 

  const formatter = new Intl.NumberFormat(navigator.language || 'en-US', {
    style: 'currency',
    currency: currencySymbol,
    minimumFractionDigits: 6
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


String.prototype.hexDecode = function(){
  var j;
  var hexes = this.match(/.{1,4}/g) || [];
  var back = "";
  for(j = 0; j<hexes.length; j++) {
      back += String.fromCharCode(parseInt(hexes[j], 16));
  }

  return back;
}


export function fetchTxnHistory(address, setHistoryRows, stakingOnly){

  if(stakingOnly === undefined){
    stakingOnly = false;
  }


  if(address == undefined || address.length==0){
    alert("Address is required")
  }

  var count = 0;

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
              "address": address
              },
              "cursor": "0",
              "limit": 30
              }  
        )
      }).then((response) => response.json()).then((json) => {



        // alert(JSON.stringify(json))
          var historyRows = [];
           json.transactions.forEach(txn => 
              {
                 
                var message  = txn.metadata.message===undefined ? undefined : <View style={styles.rowStyle}><Text style={getAppFont("black")}>Message: {txn.metadata.message.hexDecode().trim()}</Text></View>
                  
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
                    var from_account = action.from_account===undefined ? undefined : <View style={styles.rowStyle}><Text style={getAppFont("black")}>From: {shortenAddress(action.from_account.address)}  </Text>
                    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.from_account.address)}}>
                    <IconFeather name="copy" size={16} color="#183A81" />
                    </TouchableOpacity>
                    </View>
                    ;
                    var to_account = action.to_account===undefined ? undefined : <View style={styles.rowStyle}><Text style={getAppFont("black")}>To: {shortenAddress(action.to_account.address)}  </Text>
                    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.to_account.address)}}>
                    <IconFeather name="copy" size={16} color="#183A81" />
                    </TouchableOpacity>
                    </View>
                    ;
                    var to_validator = action.to_validator===undefined ? undefined : <View style={styles.rowStyle}><Text style={getAppFont("black")}>To Validator: {shortenAddress(action.to_validator.address)}  </Text>
                    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.to_validator.address)}}>
                    <IconFeather name="copy" size={16} color="#183A81" />
                    </TouchableOpacity>
                    </View>
                    ;
                    var from_validator = action.from_validator===undefined ? undefined : <View style={styles.rowStyle}><Text style={getAppFont("black")}>From Validator: {shortenAddress(action.from_validator.address)}  </Text>
                                        <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(action.from_validator.address)}}>
                    <IconFeather name="copy" size={16} color="#183A81" />
                    </TouchableOpacity>
                    </View>
                    ;
                    // var rri  = action.amount===undefined ? "" : "       Token ID: "+ shortenAddress(action.amount.token_identifier.rri); 
                    var value  = action.amount===undefined ? undefined : <Text style={getAppFont("black")}>Amount: {formatNumForDisplay(action.amount.value)} {action.amount.token_identifier.rri.split("_")[0].toUpperCase()} (Token RRI: {shortenAddress(action.amount.token_identifier.rri)})</Text>
                    var tkn_name  = action.token_properties===undefined ? undefined : <Text style={getAppFont("black")}>Token Name: {action.token_properties.name}</Text>
                    var tkn_symbol  = action.token_properties===undefined ? undefined: <Text style={getAppFont("black")}>Token Symbol: {action.token_properties.symbol.toUpperCase()}</Text>
                    var tkn_supply  = action.token_supply===undefined ? undefined: <Text style={getAppFont("black")}>Token Supply: {formatNumForDisplay(action.token_supply.value)}</Text>
                    var tkn_rri  = action.token_supply===undefined ? undefined: <Text style={getAppFont("black")}>Token RRI: {shortenAddress(action.token_supply.token_identifier.rri)}</Text>
                    var tkn_ismutable  = action.token_properties===undefined ? undefined: <Text style={getAppFont("black")}>Token is mutable?: {action.token_properties.is_supply_mutable}</Text>
                                                                           
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
                  <View key={count}>
                  <Card >
                  <Card.Title>{title}</Card.Title>
                  <Card.Divider />
                  {details}
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


const styles = StyleSheet.create({

  rowStyle: {
      flexDirection: 'row',
      fontSize: 4,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginVertical:0,
    },
   
});


export const currencyList = [
  {"label": "Fiat Prices in: USD", "value": "usd"},
  {"label": "Fiat Prices in: EUR", "value": "eur"},
  {"label": "Fiat Prices in: JPY", "value": "jpy"},
  {"label": "Fiat Prices in: GBP", "value": "gbp"},
  {"label": "Fiat Prices in: AUD", "value": "aud"},
  {"label": "Fiat Prices in: CAD", "value": "cad"},
  {"label": "Fiat Prices in: CHF", "value": "chf"},
  {"label": "Fiat Prices in: CNY", "value": "cny"},
  {"label": "Fiat Prices in: HKD", "value": "hkd"},
  {"label": "Fiat Prices in: NZD", "value": "nzd"},
  {"label": "Fiat Prices in: SEK", "value": "sek"},
  {"label": "Fiat Prices in: KRW", "value": "krw"},
  {"label": "Fiat Prices in: SGD", "value": "sgd"},
  {"label": "Fiat Prices in: NOK", "value": "nok"},
  {"label": "Fiat Prices in: MXN", "value": "mxn"},
  {"label": "Fiat Prices in: INR", "value": "inr"},
  {"label": "Fiat Prices in: RUB", "value": "rub"},
  {"label": "Fiat Prices in: ZAR", "value": "zar"},
  {"label": "Fiat Prices in: TRY", "value": "try"},
  {"label": "Fiat Prices in: BRL", "value": "brl"},
  {"label": "Fiat Prices in: TWD", "value": "twd"},
  {"label": "Fiat Prices in: DKK", "value": "dkk"},
  {"label": "Fiat Prices in: PLN", "value": "pln"},
  {"label": "Fiat Prices in: THB", "value": "thb"},
  {"label": "Fiat Prices in: IDR", "value": "idr"},
  {"label": "Fiat Prices in: HUF", "value": "huf"},
  {"label": "Fiat Prices in: CZK", "value": "czk"},
  {"label": "Fiat Prices in: ILS", "value": "ils"},
  {"label": "Fiat Prices in: CLP", "value": "clp"},
  {"label": "Fiat Prices in: PHP", "value": "php"},
  {"label": "Fiat Prices in: AED", "value": "aed"},
  {"label": "Fiat Prices in: COP", "value": "cop"},
  {"label": "Fiat Prices in: SAR", "value": "sar"},
  {"label": "Fiat Prices in: MYR", "value": "myr"},
  {"label": "Fiat Prices in: RON", "value": "ron"},
]
