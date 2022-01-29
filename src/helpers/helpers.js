import React, {useRef, useEffect} from 'react';
import {showMessage} from "react-native-flash-message";
import Clipboard from '@react-native-clipboard/clipboard';

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
  return address.substring(0, 7) +"..."+ address.substring(address.length-5, address.length) 
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
  
  if(typeof number == 'bigint'){
    newNum = number;
  } else{
    newNum = isNaN(number)?BigInt(0):BigInt(number);
  }

  return (Number((newNum*BigInt(100000))/BigInt(1000000000000000000))/100000).toLocaleString();
}