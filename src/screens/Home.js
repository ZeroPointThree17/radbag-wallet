import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
var HDKey = require('hdkey')
let { bech32, bech32m } = require('bech32')

var seed = bip39.mnemonicToSeedSync("achieve awesome grow donor recall reject small under torch garbage lucky dizzy").toString('hex');
console.log("SYNTH SEED: "+seed);
function convertbits (data, frombits, tobits, pad) {
  var acc = 0;
  var bits = 0;
  var ret = [];
  var maxv = (1 << tobits) - 1;
  for (var p = 0; p < data.length; ++p) {
    var value = data[p];
    if (value < 0 || (value >> frombits) !== 0) {
      return null;
    }
    acc = (acc << frombits) | value;
    bits += frombits;
    while (bits >= tobits) {
      bits -= tobits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) {
      ret.push((acc << (tobits - bits)) & maxv);
    }
  } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
    return null;
  }
  return ret;
}

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));


// const getData = async () => {
//   try {
//     const value = await AsyncStorage.getItem('seed')
//     if(value !== null) {
//       seed = value
//     }
//   } catch(e) {
//     console.log("err: "+e);
//   }
// }

// function arrayBufferToBufferCycle(ab) {
//   var buffer =ab)
//   var view = new Uint8Array(ab);
//   for (var i = 0; i < buffer.length; ++i) {
//       buffer[i] = view[i];
//   }
//   return buffer;
// }

const Separator = () => (
  <View style={styles.separator} />
);

const Home = () => {

  const [, updateState] = React.useState();
const forceUpdate = React.useCallback(() => updateState({}), []);

  forceUpdate;
  // getData();
  var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))
  var childkey = hdkey.derive("m/44'/1022'/0'/0/0'")
  
  console.log(childkey.privateKey.toString('hex'))
  // -> "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef"
  console.log(childkey.publicKey.toString('hex'))
  
  readdr_bytes = Buffer.concat([Buffer.from([0x04]), childkey.publicKey]);
  var readdr_bytes5 = convertbits(Uint8Array.from(readdr_bytes), 8, 5, true);
  console.log(readdr_bytes5);
   var rdx_addr = bech32.encode("rdx", readdr_bytes5);
    console.log(rdx_addr);

  return (
    <SafeAreaView>
     <View style={styles.text}> 
      <Text >Below is the retrieved mnemonic phrase: </Text>
      <Separator/>
      <Text >Public Key: {rdx_addr} </Text>
        
      <Text >Private Key: {childkey.privateKey.toString('hex')} </Text>

 <Separator/>
 <Button
        title="Understood - Continue"
        enabled
        onPress={() => Alert.alert('Import - Cannot press this one')}
      />
  </View> 
  </SafeAreaView>
  )
  ;
};


const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 20
  },
   sectionHeader: {
     paddingTop: 2,
     paddingLeft: 10,
     paddingRight: 10,
     paddingBottom: 2,
     fontSize: 14,
     fontWeight: 'bold',
     backgroundColor: 'rgba(247,247,247,1.0)',
   },
   item: {
     padding: 10,
     fontSize: 18,
     height: 44,
   },
   separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});



export default Home;
