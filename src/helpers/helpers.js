import {useRef, useEffect} from 'react';
import { Platform, PermissionsAndroid} from "react-native";
import { Observable } from "rxjs";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import TransportHid from '@ledgerhq/react-native-hid';
import {showMessage} from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';
var bigDecimal = require('js-big-decimal');

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


export async function startScan(setTransport, setDeviceID) {

  if (Platform.OS === "android") {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
    );
  }

  if (Platform.OS === "android") {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
  }

  new Observable(TransportBLE.listen).subscribe({
    complete: () => {
      // alert("complete")
      // this.setState({ refreshing: false });
    },
    next: e => {
      // Alert.alert(JSON.stringify(e.descriptor))
      if (e.type === "add") {
        // alert(JSON.stringify(e.descriptor))
        setDeviceID(e.descriptor.id)
        TransportBLE.open(e.descriptor).then((transport) => { setTransport(transport); })
      }
      // NB there is no "remove" case in BLE.
    },
    error: error => {
      // alert("error: " + error)
      // this.setState({ error, refreshing: false });
    }
  });
};

export async function getUSB(setTransport) {

  var devices = await TransportHid.list();

  if (!devices[0]) {
    // Alert.alert("No device found.")
    // throw new Error('No device found.')
  } else {
    // Alert.alert("A device was found!")
    console.log("In send to hw 6")


    console.log("In send to hw 6.1")

    var transport = await TransportHid.create()

    setTransport(transport)

  }
}
