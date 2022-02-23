import React from 'react';
import { TouchableOpacity, ScrollView, Text, View, StyleSheet, ImagePropTypes } from 'react-native';
import TransportHid from '@ledgerhq/react-native-hid';
import { getAppFont, copyToClipboard } from '../helpers/helpers';

export const sendAPDU = async (
) => {

  // var finalResult = "BLANK"
  const devices = await TransportHid.list()
  if (!devices[0]) {
    alert("No device found.")
    // throw new Error('No device found.')
  } else {
    alert("A device was found!")

    // cons t transport = await TransportHid.create()
    // const result = await transport.send(cla, ins, p1, p2, data)
    // transport.close()
    // finalResult = result.toString()
  }

  // Alert.alert(finalResult)
  // return finalResult;
}

const HardwareWalletTest3 = ({ }) => {



  return (
    <View style={styles.container}>


      <TouchableOpacity onPress={() => {


        // var bip32comp1: BIP32PathComponentT =
        //   { index: 2147483692, isHardened: true, toString: () => "44'", level: 1, name: "purpose", value: () => 44 }

        // var bip32comp2: BIP32PathComponentT =
        //   { index: 2147484184, isHardened: true, toString: () => "1022'", level: 2, name: "coin type", value: () => 1022 }

        // var bip32comp3: BIP32PathComponentT =
        //   { index: 2147484185, isHardened: true, toString: () => "0'", level: 3, name: "account", value: () => 0 }

        // var bip32comp4: BIP32PathComponentT =
        //   { index: 2147484186, isHardened: true, toString: () => "0", level: 4, name: "change", value: () => 0 }

        // var bip32comp5: BIP32PathComponentT =
        //   { index: 2147484187, isHardened: true, toString: () => "0'", level: 5, name: "address index", value: () => 0 }

        // var radPath: HDPathRadixT = {

        //   pathComponents: [bip32comp1, bip32comp2, bip32comp3, bip32comp4, bip32comp5],
        //   equals: () => true,
        //   purpose: { index: 2147483692, isHardened: true, toString: () => "44'", level: 1, name: "purpose", value: () => 44 },
        //   coinType: { index: 2147484184, isHardened: true, toString: () => "1022'", level: 2, name: "coin type", value: () => 1022 },
        //   account: { index: 2147484185, isHardened: true, toString: () => "0'", level: 3, name: "account", value: () => 0 },
        //   change: { index: 2147484186, isHardened: true, toString: () => "0", level: 4, name: "change", value: () => 0 },
        //   addressIndex: { index: 2147484187, isHardened: true, toString: () => "0'", level: 5, name: "address index", value: () => 0 },

        // }

        // var pkin: APDUGetPublicKeyInput = {
        //   display: false,
        //   /// Only relevant if `display` is true, this skips showing BIP32 Path on display.
        //   verifyAddressOnly: false,
        //   path: radPath
        // }

        // RadixAPDU.getPublicKey(pkin);

        // var res = sendAPDU(
        //   RadixAPDU.getPublicKey(pkin).cla,
        //   RadixAPDU.getPublicKey(pkin).ins,
        //   RadixAPDU.getPublicKey(pkin).p1,
        //   RadixAPDU.getPublicKey(pkin).p2,
        //   RadixAPDU.getPublicKey(pkin).data,
        //   RadixAPDU.getPublicKey(pkin).requiredResponseStatusCodeFromDevice
        // )

        var res = sendAPDU(
        )

        // Alert.alert(res)
      }}>
        <View style={styles.rowStyle}>
          <Text style={getAppFont("black")}>See HW Wallet presence</Text>
        </View>
      </TouchableOpacity>


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

export default HardwareWalletTest3;
