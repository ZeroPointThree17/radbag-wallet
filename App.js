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
import React from 'react';
// import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

// var scrypt = require("scrypt");

const bip39 = require('bip39');

const scrypt = require('scrypt-js');

const mnemonic = bip39.entropyToMnemonic('974b41e522639c5230c3b44c3891faee');

var mnemonic2 = bip39.mnemonicToSeedSync(mnemonic).toString('hex');

console.log(mnemonic2);



// import { Mnemonic, StrengthT } from '@radixdlt/application'
// var mnemonic = Mnemonic.generateNew({ strength: StrengthT.WORD_COUNT_12 });

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
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






// var salt = CryptoJS.lib.WordArray.random(128/8); 
// var key128Bits = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 128/32 }); 
// var key256Bits = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 256/32 }); 
// var key512Bits = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 512/32 }); 
// var key512Bits1000Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 512/32, iterations: 1000 });

// console.log(key512Bits1000Iterations);




const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

//   const result = scrypt(password, [salt, N=costParameterN, r=blockSize, p=parallelizationParameter, dkLen=lengthOfDerivedKey, encoding='legacy']).then((value) => {

//   hex2a('32343630'); // returns '2460'
   
//     console.log(value.toString('hex'));
//     // expected output: "Success!"
//   });
// // var mnemonic = Mnemonic.generateNew({ strength: StrengthT.WORD_COUNT_12 })


  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
           
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.js</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
