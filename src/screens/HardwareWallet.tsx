import React, { useState, useEffect } from 'react';
import {
  Alert, Button, TouchableOpacity, ScrollView, Text, View, StyleSheet, ImagePropTypes, Platform,
  PermissionsAndroid
} from "react-native";
import TransportHid from '@ledgerhq/react-native-hid';
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { getAppFont, useInterval, startScan, getUSB } from '../helpers/helpers';
import { APDUGetPublicKeyInput, RadixAPDU } from '../helpers/apdu'
import { PublicKey, HDPathRadix, HDPathRadixT, BIP32PathComponentT } from '@radixdlt/crypto'
import { numberLiteralTypeAnnotation } from '@babel/types';
import { StackActions } from '@react-navigation/native';
import { navigateHome } from './AppDataSave';
import { Observable } from "rxjs";
import {
  msgFromError,
  readBuffer,
  toObservableFromResult,
} from '@radixdlt/util'
import { err, Result } from 'neverthrow'
import * as Progress from 'react-native-progress';
import { Separator } from '../helpers/jsxlib';


function even_or_odd_prefix(N: any) {
  let len = N.length;

  // check if the last digit
  // is either '0', '2', '4',
  // '6', '8', 'A'(=10),
  // 'C'(=12) or 'E'(=14)
  if (N[len - 1] == '0'
    || N[len - 1] == '2'
    || N[len - 1] == '4'
    || N[len - 1] == '6'
    || N[len - 1] == '8'
    || N[len - 1] == 'A'
    || N[len - 1] == 'C'
    || N[len - 1] == 'E')
    return ("02");
  else
    return ("03");
}


export const sendAPDU = async (
  navigation: any,
  publicKeyInputs: any[],
  firstTimeString: string,
  isBluetoothString: string,
  transport: any,
  usbConn: any

) => {
  console.log("In send to hw3")

  var publicKeys: string[] = [];
  for (var x = 0; x < 15; x++) {

    var cla = publicKeyInputs[x][0];
    var ins = publicKeyInputs[x][1];
    var p1 = publicKeyInputs[x][2];
    var p2 = publicKeyInputs[x][3];
    var data = publicKeyInputs[x][4];
    var statusList = publicKeyInputs[x][5];

    var finalResult = "BLANK"

    if (usbConn == true) {
      transport = await TransportHid.create()
    }
    // }

    console.log("In send to hw 7")
    // Alert.alert("AFTER TRANSPORT CREATE")
    const result = await transport.send(cla, ins, p1, p2, data, statusList)
    // Alert.alert("AFTER TRANSPORT SEND")
    console.log("In send to hw 8")
    transport.close()
    console.log("RESULT_HEX: " + result.toString("hex"));
    // Alert.alert("AFTER TRANSPORT CLOSE")

    // Response `buf`: pub_key_len (1) || pub_key (var) || chain_code_len (1) || chain_code (var)
    const readNextBuffer = readBuffer(result)

    const publicKeyLengthResult = readNextBuffer(1)
    if (publicKeyLengthResult.isErr()) {
      const errMsg = `Failed to parse length of public key from response buffer: ${msgFromError(
        publicKeyLengthResult.error,
      )}`
      console.error(errMsg)
      // return throwError(() => hardwareError(errMsg))
    }
    const publicKeyLength = publicKeyLengthResult.value.readUIntBE(
      0,
      1,
    )
    const publicKeyBytesResult = readNextBuffer(
      publicKeyLength,
    )

    if (publicKeyBytesResult.isErr()) {
      const errMsg = `Failed to parse public key bytes from response buffer: ${msgFromError(
        publicKeyBytesResult.error,
      )}`
      console.error(errMsg)
      // return throwError(() => hardwareError(errMsg))
    }
    const publicKeyBytes = publicKeyBytesResult.value

    var publicKeyFinal = even_or_odd_prefix(publicKeyBytes.toString('hex').substring(66)) + publicKeyBytes.toString('hex').substring(2, 66);
    publicKeys.push(publicKeyFinal)
    console.log("PKPK: " + publicKeyFinal);


  }


  const pushAction = StackActions.push('Wallet Password', {
    mnemonicStr: "HW_WALLET",
    word13Str: "HW_WALLET",
    firstTimeStr: firstTimeString,
    hardwareWallletPubKeyArr: publicKeys
  });

  navigation.dispatch(pushAction);


}

function sendToHWWallet(navigation, firstTimeString, isBluetoothString, transport, usbConn) {
  console.log("In send to hw")
  console.log("Transport: " + transport)

  var publicKeyInputs: any[] = [];

  for (var x = 0; x < 15; x++) {

    const path00H = HDPathRadix.create({ address: { index: x, isHardened: true } });

    var pkin: APDUGetPublicKeyInput = {
      display: false,
      /// Only relevant if `display` is true, this skips showing BIP32 Path on display.
      verifyAddressOnly: false,
      path: path00H
    }

    publicKeyInputs.push([
      RadixAPDU.getPublicKey(pkin).cla,
      RadixAPDU.getPublicKey(pkin).ins,
      RadixAPDU.getPublicKey(pkin).p1,
      RadixAPDU.getPublicKey(pkin).p2,
      RadixAPDU.getPublicKey(pkin).data,
      RadixAPDU.getPublicKey(pkin).requiredResponseStatusCodeFromDevice]);
  }

  sendAPDU(
    navigation,
    publicKeyInputs,
    firstTimeString,
    isBluetoothString,
    transport,
    usbConn
  );
}


const HardwareWallet = ({ route, navigation }) => {

  console.log("In send to hw 0")
  const { firstTimeStr, isBluetooth } = route.params;
  var firstTimeString = JSON.stringify(firstTimeStr).replace(/"/g, '');
  var isBluetoothString = JSON.stringify(isBluetooth).replace(/"/g, '');
  const [bluetoothHWDescriptor, setBluetoothHWDescriptor] = useState();
  const [isLoading, setIsLoading] = useState();
  const [transport, setTransport] = useState();
  const [deviceID, setDeviceID] = useState();
  const [usbConn, setUsbConn] = useState(false);
  const [deviceName, setDeviceName] = useState("Looking for device...");
  const [scanStarted, setScanStarted] = useState(false);


  useInterval(() => {

    if (transport == undefined) {
      startScan(setTransport, setDeviceID, setDeviceName, scanStarted, setScanStarted, firstTimeString);
      getUSB(setTransport, setUsbConn, setDeviceName);
    }
  }, 3500);




  if (transport != undefined) {
    sendToHWWallet(navigation, firstTimeString, isBluetoothString, transport, usbConn);
  }

  var androidMsg = "";

  if (Platform.OS === "android") {
    androidMsg = ", or that the wallet is connected via USB"
  }

  return (
    <View style={styles.container}>
      <Text style={[getAppFont("black"), { textAlign: "center" }]}>{"Please open the Radix app in the hardware wallet and ensure bluetooth is enabled on the wallet and on your device" + androidMsg + ". Once the Radix app is open, please wait 30 seconds for the connection to be established."}</Text>
      <Separator />
      <Separator />
      <Progress.Circle style={{ alignSelf: "center" }} size={30} indeterminate={true} />
    </View>
  )
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 30,
    margin: 0,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  },
  rowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5
  },
});

export default HardwareWallet;
