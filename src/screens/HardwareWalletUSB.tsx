import React, { useState } from 'react';
import { Alert, TouchableOpacity, ScrollView, Text, View, StyleSheet, ImagePropTypes } from 'react-native';
import TransportHid from '@ledgerhq/react-native-hid';
import { getAppFont, copyToClipboard } from '../helpers/helpers';
import { APDUGetPublicKeyInput, RadixAPDU } from '../helpers/apdu'
import { PublicKey, HDPathRadix, HDPathRadixT, BIP32PathComponentT } from '@radixdlt/crypto'
import { numberLiteralTypeAnnotation } from '@babel/types';
import { StackActions } from '@react-navigation/native';
import { navigateHome } from './AppDataSave';
import {
  msgFromError,
  readBuffer,
  toObservableFromResult,
} from '@radixdlt/util'
import { err, Result } from 'neverthrow'



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




function splitPath(path: string): number[] {
  const result: number[] = [];
  const components = path.split("/");
  components.forEach((element) => {
    let number = parseInt(element, 10);
    if (isNaN(number)) {
      return; // FIXME shouldn't it throws instead?
    }
    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000;
    }
    result.push(number);
  });
  return result;
}

export const sendAPDU = async (
  navigation: any,
  publicKeyInputs: any[],
  firstTimeString: string

) => {

  // var publicKeys = ["04f4f40a5a387388652998c19f1c63de76ff3cd4a6faacb11b383456c5196ec2d3"];
  var publicKeys: string[] = [];
  for (var x = 0; x < 15; x++) {

    var cla = publicKeyInputs[x][0];
    var ins = publicKeyInputs[x][1];
    var p1 = publicKeyInputs[x][2];
    var p2 = publicKeyInputs[x][3];
    var data = publicKeyInputs[x][4];
    var statusList = publicKeyInputs[x][5];
    // const paths = splitPath("m/44'/1022'/0'/0/" + x + "");
    // const buffer = Buffer.alloc(1 + paths.length * 4);
    // buffer[0] = paths.length;
    // paths.forEach((element, index) => {
    //   buffer.writeUInt32BE(element, 1 + 4 * index);
    // });

    // Alert.alert(cla + " " + ins + " " + p1 + " " + p2 + " " + data + " " + statusList)
    var finalResult = "BLANK"
    const devices = await TransportHid.list()
    if (!devices[0]) {
      // Alert.alert("No device found.")
      // throw new Error('No device found.')
    } else {
      // Alert.alert("A device was found!")

      const transport = await TransportHid.create()
      // Alert.alert("AFTER TRANSPORT CREATE")
      const result = await transport.send(cla, ins, p1, p2, data, statusList)
      // Alert.alert("AFTER TRANSPORT SEND")
      transport.close()
      console.log("RESULT_HEX: " + result.toString("hex"));
      // Alert.alert("AFTER TRANSPORT CLOSE")
      // const publicKeyLength = result[0];
      // var pubkey = result.slice(1, 1 + publicKeyLength).toString("hex")
      // publicKeys.push(pubkey)


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
      // PublicKey.fromBuffer(publicKeyBytes).toString(true)
      console.log("PKPK: " + publicKeyFinal);

      // return publicKeyFinal;
    }



  }


  const pushAction = StackActions.push('Wallet Password', {
    mnemonicStr: "HW_WALLET",
    word13Str: "HW_WALLET",
    firstTimeStr: firstTimeString,
    hardwareWallletPubKeyArr: ["036b7673ebece31c881a742912b07f24d415810d98b395bdd42d566b8202603265"]
  });

  navigation.dispatch(pushAction);
  // navigateHome(setIsActive, navigation, "a", "a", "HW_WALLET", "HW_WALLET", "false", publicKeys);

}

function sendToHWWallet(navigation, firstTimeString) {
  console.log("In send to hw")
  // var bip32comp1: BIP32PathComponentT =
  //   { index: 0x8000002c, isHardened: true, toString: () => "44'", level: 1, name: "purpose", value: () => 44 }

  // var bip32comp2: BIP32PathComponentT =
  //   { index: 0x80000218, isHardened: true, toString: () => "1022'", level: 2, name: "coin type", value: () => 1022 }

  // var bip32comp3: BIP32PathComponentT =
  //   { index: 0x0, isHardened: true, toString: () => "0'", level: 3, name: "account", value: () => 0 }

  // var bip32comp4: BIP32PathComponentT =
  //   { index: 0x0, isHardened: true, toString: () => "0'", level: 4, name: "change", value: () => 0 }

  // var bip32comp5: BIP32PathComponentT =
  //   { index: 0x0, isHardened: false, toString: () => "0", level: 5, name: "address index", value: () => 0 }

  // var radPath: HDPathRadixT = {

  //   pathComponents: [bip32comp1, bip32comp2, bip32comp3, bip32comp4, bip32comp5],
  //   equals: () => true,
  //   purpose: { index: 0x8000002c, isHardened: true, toString: () => "44'", level: 1, name: "purpose", value: () => 44 },
  //   coinType: { index: 0x80000218, isHardened: true, toString: () => "1022'", level: 2, name: "coin type", value: () => 1022 },
  //   account: { index: 0x0, isHardened: true, toString: () => "0'", level: 3, name: "account", value: () => 0 },
  //   change: { index: 0x0, isHardened: true, toString: () => "0'", level: 4, name: "change", value: () => 0 },
  //   addressIndex: { index: 0x0, isHardened: false, toString: () => "0", level: 5, name: "address index", value: () => 0 },

  // }

  // Alert.alert(radPath.pathComponents.toString())


  // RadixAPDU.getPublicKey(pkin);

  // RadixAPDU.getPublicKey(pkin).cla,
  // RadixAPDU.getPublicKey(pkin).ins,
  // RadixAPDU.getPublicKey(pkin).p1,
  // RadixAPDU.getPublicKey(pkin).p2,
  // RadixAPDU.getPublicKey(pkin).data,
  // RadixAPDU.getPublicKey(pkin).requiredResponseStatusCodeFromDevice

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
    firstTimeString
  );
}

const HardwareWalletUSB = ({ route, navigation }) => {

  console.log("In send to hw 0")
  const { firstTimeStr } = route.params;
  var firstTimeString = JSON.stringify(firstTimeStr).replace(/"/g, '');

  sendToHWWallet(navigation, firstTimeString);

  return (
    <View style={styles.container}>


      <View style={styles.rowStyle}>
        <Text style={getAppFont("black")}>Loading Hardware Wallet...</Text>
      </View>
      {/* <TouchableOpacity onPress={() => {







        // var res = sendAPDU(
        //   1,
        //   1,
        //   0,
        //   0,
        //   Buffer.from("d"),
        //   undefined
        // )

        // Alert.alert(res)
      }}>
        <View style={styles.rowStyle}>
          <Text style={getAppFont("black")}>See HW Wallet presence</Text>
        </View>
      </TouchableOpacity> */}


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

export default HardwareWalletUSB;
