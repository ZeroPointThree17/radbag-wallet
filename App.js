/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
//  global.Buffer = global.Buffer || require('buffer/').Buffer

import './shim';
//import {Buffer} from 'buffer';
import React, { useState } from 'react';
import { StyleSheet, Button, View,useColorScheme, SafeAreaView, Text, Alert, LogBox } from 'react-native';
import { NavigationContext, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import { UserProvider } from "./screens/UserProvider"
var SQLite = require('react-native-sqlite-storage');

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
// import AesGcmCrypto from 'react-native-aes-gcm-crypto';
const { Entropy, charset16 } = require('entropy-string')

// var scrypt = require("scrypt");

const bip39 = require('bip39');

const scrypt = require('scrypt-js');
import * as ec from 'react-native-ecc'
import { Buffer } from 'buffer'
import Welcome from './src/screens/Welcome';
import CreateWallet from './src/screens/CreateWallet';
import Home from './src/screens/Home';
import HomeNav from './src/screens/HomeNav';
import AppDataSave from './src/screens/AppDataSave';
import MnemonicInput from './src/screens/MnemonicInput';

// import NFTs from './src/screens/NFTs';
// import bitcoin from 'react-native-bitcoinjs-lib'
// import BIP32Factory from 'bip32';
// import * as ecc from 'tiny-secp256k1';
// var bip32utils = require('react-native-bip32-utils');

// ec.setServiceID('be.excellent.to.each.other')
// optional
// ec.setAccessGroup('dsadjsakd.com.app.awesome.my')

const Separator = () => (
  <View style={styles.separator} />
);

var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);


// this library allows you to sign 32 byte hashes (e.g. sha256 hashes)
const msg = Buffer.from('hey ho')
// check ec.curves for supported curves
const curve = 'p256'
var pub = 'a'

// ec.keyPair(curve, function (err, key) {
//   // pub tested for compatibility with npm library "elliptic"
//    pub = key.pub
//   // console.log('pub', key.pub.toString('hex'))

//   // look up the key later like this:
//   // const key = ec.keyFromPublic(pub)


// })

   
// import * as secp from "noble-secp256k1";
 
// (async () => {
//   // You can also pass Uint8Array and BigInt.
//   const privateKey = "6b911fd37cdf5c81d4c0adb1ab7fa822ed253ab0ad9aa18d77257c88b29b718e";
//   const messageHash = "9c1185a5c5e9fc54612808977ee8f548b2258d31";
//   // const publicKey = secp.getPublicKey(privateKey);
//   // const signature = await secp.sign(messageHash, privateKey);
//   // const isSigned = secp.verify(signature, messageHash, publicKey);
//   // console.log("Sig: "+signature);
// })();

// var mnemonic = bip39.entropyToMnemonic('974b41e522639c5230c3b44c3891faee');
var mnemonic = bip39.generateMnemonic();
var mnemonic2 = bip39.mnemonicToSeedSync(mnemonic).toString('hex');

console.log("mnemonic seed: " + mnemonic2);

// });



const entropy = new Entropy({ total: 1e6, risk: 1e9, charset: charset16 })
const string = bip39.mnemonicToEntropy(mnemonic);

console.log(string);

mnemonic = bip39.entropyToMnemonic(string);
console.log(mnemonic);

var HDKey = require('hdkey')
var seed = 'a0c42a9c3ac6abf2ba6a9946ae83af18f51bf1c9fa7dacc4c92513cc4dd015834341c775dcd4c0fac73547c5662d81a9e9361a0aac604a73a321bd9103bce8af'
var hdkey = HDKey.fromMasterSeed(Buffer.from(mnemonic2, 'hex'))
var childkey = hdkey.derive("m/44'/1022'/0'/0/0'")

console.log(childkey.privateKey.toString('hex'))
// -> "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef"
console.log(childkey.publicKey.toString('hex'))



 childkey = hdkey.derive("m/44'/1022'/0'/0/1'")

console.log(childkey.privateExtendedKey)
// -> "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef"
console.log(childkey.publicExtendedKey)
// => 'xpub661MyMwAqRbcEvPmRAmYndzERhyNux1GoHzHxgzVHMBFkCro3kbbCiDZZ5XabZDyXPj5mH3hktvkjhhUdCQxie5e1g4t2GuAWNbPmsSfDp2'
// const keyPair = bitcoin.ECPair.makeRandom();
// const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
// console.log("BC: "+address);

// const keypair = Bitcoin.ECPair.makeRandom()
// console.log("BC: "+keypair.getAddress()) 

// let hdNode = bitcoin.bip32.fromSeed(mnemonic2)

// let childNode = hdNode.deriveHardened(0)
// let external = childNode.derive(0)
// let internal = childNode.derive(1)
// let account = new bip32utils.Account([
//   new bip32utils.Chain(external.neutered()),
//   new bip32utils.Chain(internal.neutered())
// ])

// console.log(account.getChainAddress(0))
// => 1QEj2WQD9vxTzsGEvnmLpvzeLVrpzyKkGt

// const path = "m/0'/0/0";
// const root = bip32.fromSeed(
//   Buffer.from(
//     'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
//     'hex',
//   ),
// );

// const child1 = root.derivePath(path);

// // option 2, manually
// const child1b = root
//   .deriveHardened(0)
//   .derive(0)
//   .derive(0);


// const master = HDNode.fromSeedHex(mnemonic2.toString('hex'));

// const derived = master.derivePath("m/44'/0'/0'/0/0");
// const address = derived.getAddress();
// const privateKey = derived.keyPair.toWIF();

// console.log("addr: "+address)
// console.log("privKey: "+privateKey)

// console.log('pub', pub)

// var key2 = ec.keyFromPublic(pub)

// key2.sign({
//   data: msg,
//   algorithm: 'sha256'
// }, function (err, sig) {
//   // signatures tested for compatibility with npm library "elliptic"
//   console.log('sig', sig.toString('hex'))
//   key2.verify({
//     algorithm: 'sha256',
//     data: msg,
//     sig: sig
//   }, function (err, verified) {
//     console.log('verified:', verified)
//   })
// })

// import { Mnemonic, StrengthT } from '@radixdlt/application'
// var mnemonic = Mnemonic.generateNew({ strength: StrengthT.WORD_COUNT_12 });

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function errorCB(err, moreInfoStr) {
  console.log("SQL Error: " + err.message + " More Info: "+moreInfoStr);
}

function successCB() {
  console.log("SQL executed fine");
}

function openCB() {
  // console.log("Database OPENED");
}


// Convert a byte array to a hex string
// function bytesToHex(bytes) {
//   for (var hex = [], i = 0; i < bytes.length; i++) {
//       var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
//       hex.push((current >>> 4).toString(16));
//       hex.push((current & 0xF).toString(16));
//   }
//   return hex.join("");
// }
  // See the section below: "Encoding Notes"

  // function hex2a(hexx) {
//     var hex = hexx.toString();//force conversion
//     var str = '';
//     for (var i = 0; i < hex.length; i += 2)
//         str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
//     return str;
//   }

  var password = Buffer.from("password");
  var salt = hexToBytes("a975aa92c27fd94077fd40b107a9da3ac1ff66afdde7b5fe7ecfb9899a73c22e");
var lengthOfDerivedKey =32;
var blockSize = 8;
var parallelizationParameter = 1;
var costParameterN = 8192;



function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

const key = scrypt.syncScrypt(password, salt, costParameterN, blockSize, parallelizationParameter, lengthOfDerivedKey);
console.log("Derived Key (sync): ", toHexString(key));

// Crypto parameters from wallet.json
ciphertext = "3d634906b073952364898a40cce456cc"
nonce = "b7f042ea4266d6ae910ee332"
mac = "f4000f968fa9e7403911937da74c7d12"


// AesGcmCrypto.decrypt(
//   ciphertext,
//   key,
//   nonce,
//   [],
//   false
// ).then((decryptedData) => {
//   console.log("Decrypted entrophy: ", decryptedData);
// });




// //Asynchronous with promise
// scrypt.kdf("ascii encoded key", {N: 1, r:1, p:1}).then(function(result){
//   console.log("Asynchronous result: "+result.toString("base64"));
// }, function(err){
// });


// // Using a custom N parameter. Must be a power of two.
// scrypt(password, salt, lengthOfDerivedKey, { N: costParameterN, r: blockSize, parallelization: parallelizationParameter  }, (err, derivedKey) => {
//   if (err) throw err;
//   console.log(derivedKey.toString('hex'));  // '3745e48...aa39b34'
// });

// const result = scrypt(password, ['', N=costParameterN, r=blockSize, p=parallelizationParameter, dkLen=lengthOfDerivedKey, encoding='base64']).then((value) => {
//   console.log(value);
// });


// import CryptoJS from "react-native-crypto-js";
 
// // Encrypt
// let ciphertext = CryptoJS.AES.encrypt('my message', 'secret key 123').toString();
 
// // Decrypt
// let bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
// let originalText = bytes.toString(CryptoJS.enc.Utf8);
 
// console.log(originalText); // 'my message'







const Stack = createStackNavigator();


const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = React.useContext(NavigationContext);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };


const [firstTimer, setFirstTimer] = useState(true);

db.transaction((tx) => {
  tx.executeSql("SELECT new_user_flag FROM application", [], (tx, results) => {
  
          var len = results.rows.length;
                
          var new_user_flag = 0;
          for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);
              new_user_flag = row.new_user_flag;
          }

          if(new_user_flag == 0){
            setFirstTimer(false); 
          }


  }, errorCB('update active_wallet'));
}); 


LogBox.ignoreAllLogs();

  return (

<NavigationContainer>
    <Stack.Navigator       screenOptions={{
        headerStyle: {
          backgroundColor: '#183A81',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>{ firstTimer == false
  ?  <Stack.Screen name="Welcome to the Raddish Wallet!" component={Welcome} />
  :     <Stack.Screen name="Raddish  Wallet" component={HomeNav} options={{headerShown: false ,headerLeft: () => null, gestureEnabled: false}} />

}
     
      <Stack.Screen name="Mnemonic" component={CreateWallet} />
      <Stack.Screen name="Mnemonic Input" component={MnemonicInput} />
      <Stack.Screen name="App Password" component={AppDataSave} />
      <Stack.Screen name="Raddish Wallet" component={HomeNav} options={{headerShown: false ,headerLeft: () => null, gestureEnabled: false}} />
 
    </Stack.Navigator>
    </NavigationContainer>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default App;
