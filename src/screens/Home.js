import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shim } from 'react-native-quick-base64';
var HDKey = require('hdkey')
let { bech32, bech32m } = require('bech32')
var bitcoinMessage = require('bitcoinjs-message')
// var crypto = require('crypto');
import './shim';
import NodeRSA from 'node-rsa';
// import * as secp from "@noble/secp256k1";
const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')
import QRCode from 'react-native-qrcode-svg';
// const PouchDB = require('pouchdb');
// PouchDB.plugin(require('crypto-pouch'));
// var sqlite3 = require('sqlite3');
// var db = new sqlite3.Database(':memory:');
var SQLite = require('react-native-sqlite-storage');
// const path = require('path');
// const fs = require('fs');

var seed = "";
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

const Home = ({route, navigation}) => {

  const { mnemonicStr, word25Str, seedStr} = route.params;
  
  const [, updateState] = React.useState();
const forceUpdate = React.useCallback(() => updateState({}), []);

  forceUpdate;
  // getData();
  var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))
  var childkey = hdkey.derive("m/44'/1022'/0'/0/0'")
  
  console.log("Home PUB KEY: "+ childkey.publicKey.toString('hex'))
  
  console.log("Home PRIV KEY: "+ childkey.privateKey.toString('hex'))
  // -> "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef"
  
  readdr_bytes = Buffer.concat([Buffer.from([0x04]), childkey.publicKey]);
  var readdr_bytes5 = convertbits(Uint8Array.from(readdr_bytes), 8, 5, true);
  console.log(readdr_bytes5);
   var rdx_addr = bech32.encode("rdx", readdr_bytes5);
    console.log("Home RDX KEY: "+ rdx_addr);

    var message = '9a25747cd03f9764de539934e1800edc8160a4978aa27b1a6fb8411a11543697'
    var signature = "AA";

     signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(message,'hex')), Uint8Array.from(childkey.privateKey))
    // var derPublicKey = keyEncoder.encodePublic(childkey.publicKey, 'raw', 'der');
    // var derPrivateKey = keyEncoder.encodePublic(childkey.privateKey, 'raw', 'der');
    // console.log("DER PUB K:"+ derPublicKey)
    // console.log("DER PRIV K:"+ derPrivateKey)
    
    
    //  signature = secp.signSync(message, .toString('hex'), { der: true });


// console.log("SIG: " + signer.sign({data: Buffer.from(message,"hex"),encoding:"hex"}));
//  var signature = bitcoinMessage.sign(message, childkey.privateKey, childkey.compressed)

// console.log(childkey.sign(Buffer.from(message,'hex')).toString('hex'));

 
// const signit = crypto.createSign("RSA-SHA256");
// signit.update(Buffer.from(message, "hex"));
// var signature = signit.sign(childkey.privateKey.toString("hex")).toString("hex");

 var result=new Uint8Array(72);
 secp256k1.signatureExport(signature.signature,result);
   console.log("SIG: "+ Buffer.from(result).toString('hex'));


  //  const db = new PouchDB('my_db')
 // init; after this, docs will be transparently en/decrypted
// db.crypto("test").then(() => {
//   // db will now transparently encrypt writes and decrypt reads
//     db.put({
//     _id: 'dave@gmail.com',
//     name: 'David',
//     age: 69
//   });
// })
  
// db.serialize(function() {
//   db.run("CREATE TABLE lorem (info TEXT)");

//   var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//   for (var i = 0; i < 10; i++) {
//       stmt.run("Ipsum " + i);
//   }
//   stmt.finalize();

//   db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//       console.log(row.id + ": " + row.info);
//   });
// });

// db.close();

function errorCB(err) {
  console.log("SQL Error: " + err.message);
}

function successCB() {
  console.log("SQL executed fine");
}

function openCB() {
  console.log("Database OPENED");
}



var db = SQLite.openDatabase("test.db", "1.0", "Test Database", 200000, openCB, errorCB);


db.transaction((tx) => {
  tx.executeSql('CREATE TABLE lorem (info TEXT)', [], (tx, results) => {
    console.log("Query0 completed");
  });
});


db.transaction((tx) => {
  tx.executeSql("INSERT INTO lorem VALUES ('TEST1')", [], (tx, results) => {
    console.log("Query0-2 completed");
  });
});

db.transaction((tx) => {

  tx.executeSql('SELECT * FROM lorem', [], (tx, results) => {
    
      console.log("Query completed");

      // Get rows with Web SQL Database spec compliance.

      var len = results.rows.length;
      for (let i = 0; i < len; i++) {
        let row = results.rows.item(i);
        console.log(`Employee name: ${row.info}, Dept Name: ${row.info}`);
      }

      // Alternatively, you can use the non-standard raw method.

      /*
        let rows = results.rows.raw(); // shallow copy of rows Array

        rows.map(row => console.log(`Employee name: ${row.name}, Dept Name: ${row.deptName}`));
      */
    }, errorCB);
});
 


  
  return (
    <SafeAreaView>
     <View style={styles.text}> 
     <QRCode
      value={rdx_addr}
    />
      <Text >Below is the retrieved mnemonic phrase: </Text>
      <Separator/>
      <Text >Radix Key: {rdx_addr} </Text>
        
      <Text >Private Key: {childkey.privateKey.toString('hex')} </Text>

 <Separator/>
 <Button
        title="Understood - Continue"
        enabled
        onPress={() => Alert.alert('Import - Cannot press this one')}
      />
      <Text>{mnemonicStr}</Text> 
      <Text>{word25Str}</Text> 
      <Text>{seedStr}</Text>
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
