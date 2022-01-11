import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
let { bech32, bech32m } = require('bech32')
// import './shim';
import NodeRSA from 'node-rsa';
const { randomBytes } = require('crypto')
import QRCode from 'react-native-qrcode-svg';
import PasswordInputText from 'react-native-hide-show-password-input';
var bcrypt = require('react-native-bcrypt');
const _crypto = require('crypto');
var SQLite = require('react-native-sqlite-storage');
import {encrypt, decrypt} from '../helpers/encrypt';
var HDKey = require('hdkey')



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

const Separator = () => (
  <View style={styles.separator} />
);

function errorCB(err) {
  console.log("SQL Error: " + err.message);
}

function successCB() {
  console.log("SQL executed fine");
}

function openCB() {
  console.log("Database OPENED");
}



function navigateHome(navigation, password, confirmPassword, mnemonic, word25){

  if(password.length == 0 || confirmPassword.length == 0 ){
    alert("Password is required");
  } 
  else if(password === confirmPassword){
    // var salt = bcrypt.genSaltSync(10);
    // var pwHash = bcrypt.hashSync(password, salt);

  //  console.log(bcrypt.compareSync(password, pwHash)); // true

var mnemonic_enc = encrypt(mnemonic, Buffer.from(password));
var word25_enc = encrypt(word25, Buffer.from(password));


var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

console.log("ABOUT TO LOAD TABLES")

db.transaction((tx) => {

    tx.executeSql('DROP TABLE application', [], (tx, results) => {
      console.log("Drop application table completed");

      db.transaction((tx) => {
  tx.executeSql(`CREATE TABLE application (
    new_user_flag INTEGER,
    version INTEGER)`, [], (tx, results) => {
    console.log("Create application table completed");

    db.transaction((tx) => {
      tx.executeSql("INSERT INTO application VALUES(1,10)", [], (tx, results) => {
        console.log("Inserts into application table completed");
        
      }, errorCB);});
  }, errorCB);
});
}, errorCB);
});




db.transaction((tx) => {
  tx.executeSql('DROP TABLE id', [], (tx, results) => {
    console.log("Drop id table completed");
    db.transaction((tx) => {
      tx.executeSql(`CREATE TABLE id (
        table_name TEXT,
        next_id INTEGER
    )`, [], (tx, results) => {
        console.log("Create id table completed");
        db.transaction((tx) => {
          tx.executeSql("INSERT INTO id VALUES('wallet',1)", [], (tx, results) => {
            console.log("Inserts into id table completed");
            
          }, errorCB);
        });
      }, errorCB);
    });
  }, errorCB);
});






db.transaction((tx) => {
  tx.executeSql('DROP TABLE wallet', [], (tx, results) => {
    console.log("Drop wallet table completed");
    db.transaction((tx) => {
      tx.executeSql(`CREATE TABLE wallet (
        id INTEGER PRIMARY KEY,
        name TEXT,
        mnemonic_enc TEXT,
        word25_enc TEXT
    )`, [], (tx, results) => {
        console.log("Create wallet table completed");

          db.transaction((tx) => {
            tx.executeSql("INSERT INTO wallet (id, name, mnemonic_enc, word25_enc) VALUES (1, 'Wallet 1', '" + mnemonic_enc + "', '" + word25_enc + "')", [], (tx, results) => {
              console.log("Inserts into wallet table completed");
             
            }, errorCB);
          });
      }, errorCB);
    });
  }, errorCB);
});



db.transaction((tx) => {
  tx.executeSql('DROP TABLE token', [], (tx, results) => {
    console.log("Drop token table completed");
    db.transaction((tx) => {
      tx.executeSql(`CREATE TABLE token (
        id INTEGER PRIMARY KEY,
        rri TEXT,
    name TEXT,
    symbol TEXT,
    decimals INTGER,
    logo BLOB
    )`, [], (tx, results) => {
        console.log("Create token table completed");
        db.transaction((tx) => {
          tx.executeSql("INSERT INTO token (rri, name, symbol, decimals, logo) VALUES ('xrd_rr1qy5wfsfh','Radix','XRD',18,null)", [], (tx, results) => {
            console.log("Inserts into token table completed");
           
          }, errorCB);
        });
      }, errorCB);
    });
  }, errorCB);
});




db.transaction((tx) => {
  tx.executeSql('DROP TABLE wallet_x_token', [], (tx, results) => {
    console.log("Drop wallet_x_token table completed");
    db.transaction((tx) => {
      tx.executeSql(`CREATE TABLE wallet_x_token (
        id INTEGER PRIMARY KEY,
        wallet_id INTEGER,
        token_id INTEGER,
    enabled_flag INTEGER
    )`, [], (tx, results) => {
        console.log("Create wallet_x_token table completed");
        db.transaction((tx) => {
          tx.executeSql('INSERT INTO wallet_x_token (wallet_id, token_id, enabled_flag) select distinct a.id, b.id, 1 from wallet a, token b', [], (tx, results) => {
            console.log("Inserts into wallet_x_token token completed");
           
          }, errorCB);
        });
        
      }, errorCB);
    });
  }, errorCB);
});



var seed = bip39.mnemonicToSeedSync(mnemonic,word25).toString('hex');
     
var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))


  db.transaction((tx) => {
    tx.executeSql('DROP TABLE address', [], (tx, results) => {
      console.log("Drop address table completed");
      db.transaction((tx) => {
        tx.executeSql(`CREATE TABLE address (
          id INTEGER PRIMARY KEY,
          wallet_id INTEGER,
          name TEXT,
      radix_address TEXT,
      publickey TEXT,
      privatekey_enc TEXT,
      enabled_flag INTEGER
      )`, [], (tx, results) => {
          console.log("Create address table completed");
          var enabled_flag=1;
          for (let i = 1; i < 11; i++) {
        
            db.transaction((tx) => {
        
              var childkey = hdkey.derive("m/44'/1022'/0'/0/"+(i-1).toString()+"'")
              var privatekey_enc = encrypt(childkey.privateKey.toString('hex'), Buffer.from(password));
              var publicKey = childkey.publicKey.toString('hex');
              var readdr_bytes = Buffer.concat([Buffer.from([0x04]), childkey.publicKey]);
              var readdr_bytes5 = convertbits(Uint8Array.from(readdr_bytes), 8, 5, true);
              var rdx_addr = bech32.encode("rdx", readdr_bytes5);
          
              if(i==2){enabled_flag=0}
              tx.executeSql("INSERT INTO address (wallet_id,name,radix_address,publickey,privatekey_enc,enabled_flag) VALUES (1,'Address "+i.toString()+"','"+rdx_addr+"','"+publicKey+"','"+privatekey_enc+"',"+enabled_flag+")", [], (tx, results) => {
                console.log("Inserts into address table completed");
                
                      // db.transaction((tx) => {

                      //   tx.executeSql('SELECT * FROM address', [], (tx, results) => {


                      //     var len = results.rows.length;
                      //     //  console.log(results.rows.item);
                      //       for (let i = 0; i < len; i++) {
                      //     let row = results.rows.item(i);
                      //     console.log(row);
                      //       }
                      //     }, errorCB);
                      //   });
              }, errorCB);
            });
         } 
        
        }, errorCB);
      });
    }, errorCB);
  });



    navigation.navigate('Raddish Wallet', {
      pwStr: password
    });
  }
  else{
    alert("The passwords entered do not match");
  }
}

function wait(ms){
  var start = new Date().getTime();
  var end = start;
  while(end < start + ms) {
    end = new Date().getTime();
 }
}

const AppDataSave = ({route, navigation}) => {

  const { mnemonicStr, word25Str} = route.params;
  var mnemonic = JSON.stringify(mnemonicStr).replaceAll('"','');
  var word25 = JSON.stringify(word25Str).replaceAll('"','');

  const [, updateState] = React.useState();
const forceUpdate = React.useCallback(() => updateState({}), []);

// const [appDone, setappDone] = useState(false);
// const [idDone, setidDone] = useState(false);
// const [walletDone, setwalletDone] = useState(false);
// const [walletXtokenDone, setwalletXtokenDone] = useState(false);
// const [tokenDone, settokenDone] = useState(false);
// const [addressDone, setaddressDone] = useState(false);





 

const [appPw, setAppPw] = useState("");
const [appPwConfirm, setAppPwConfirm] = useState("");

  
  return (
    <SafeAreaView>
     <View > 
     <Separator/>

<Separator/>

    <Text style={styles.title}>Enter a password to protect the data in this app.</Text>
 <PasswordInputText style={styles.title}
onChangeText={(password) => setAppPw( password )}
label='App Password' />

<PasswordInputText style={styles.title}
onChangeText={(password) => setAppPwConfirm( password )}
label='Confirm App Password' />


      <Separator/>




 <Separator/>
 <Button
        title="Continue"
        enabled
        onPress={() => navigateHome(navigation, appPw, appPwConfirm, mnemonic, word25)}
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
    borderBottomWidth: 0,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 50,
  },

});



export default AppDataSave;