import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';

// import './shim';
import NodeRSA from 'node-rsa';
const { randomBytes } = require('crypto')
import QRCode from 'react-native-qrcode-svg';
import PasswordInputText from 'react-native-hide-show-password-input';
var bcrypt = require('react-native-bcrypt');
const _crypto = require('crypto');
var SQLite = require('react-native-sqlite-storage');

function encrypt (text, masterkey){
  // random initialization vector
  const iv = _crypto.randomBytes(16);

  // random salt
  const salt = _crypto.randomBytes(64);

  // derive key: 32 byte key length - in assumption the masterkey is a cryptographic and NOT a password there is no need for
  // a large number of iterations. It may can replaced by HKDF
  const key = _crypto.pbkdf2Sync(masterkey, salt, 2145, 32, 'sha512');

  // AES 256 GCM Mode
  const cipher = _crypto.createCipheriv('aes-256-gcm', key, iv);

  // encrypt the given text
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

  // extract the auth tag
  const tag = cipher.getAuthTag();

  // generate output
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
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
    var salt = bcrypt.genSaltSync(10);
    var pwHash = bcrypt.hashSync(password, salt);

  //  console.log(bcrypt.compareSync(password, pwHash)); // true

var mnemonic_enc = encrypt(mnemonic, Buffer.from(pwHash));
var word25_enc = encrypt(word25, Buffer.from(pwHash));


var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);


db.transaction((tx) => {
  tx.executeSql('DROP TABLE application', [], (tx, results) => {
    console.log("Drop application table completed");
  }, errorCB);
});


db.transaction((tx) => {
  tx.executeSql(`CREATE TABLE application (
    new_user_flag INTEGER,
    version INTEGER,
    app_pw_enc TEXT
)`, [], (tx, results) => {
    console.log("Create application table completed");
  }, errorCB);
});

db.transaction((tx) => {
  tx.executeSql("INSERT INTO application VALUES(1,10,'"+pwHash+"')", [], (tx, results) => {
    console.log("Inserts into application table completed");
  }, errorCB);
});


db.transaction((tx) => {
  tx.executeSql('DROP TABLE wallet', [], (tx, results) => {
    console.log("Drop wallet table completed");
  }, errorCB);
});


db.transaction((tx) => {
  tx.executeSql(`CREATE TABLE wallet (
    id INTEGER,
    name TEXT,
    mnemonic_enc TEXT,
    word25_enc TEXT
)`, [], (tx, results) => {
    console.log("Create wallet table completed");
  }, errorCB);
});

db.transaction((tx) => {
  tx.executeSql("INSERT INTO wallet VALUES(1,'Wallet 1', '" + mnemonic_enc + "', '" + word25_enc + "')", [], (tx, results) => {
    console.log("Inserts into wallet table completed");
  }, errorCB);
});



db.transaction((tx) => {
  tx.executeSql('DROP TABLE token', [], (tx, results) => {
    console.log("Drop token table completed");
  }, errorCB);
});

db.transaction((tx) => {
  tx.executeSql(`CREATE TABLE token (
    id INTEGER,
    RRI TEXT,
name TEXT,
symbol TEXT,
decimals INTGER,
logo BLOB
)`, [], (tx, results) => {
    console.log("Create token table completed");
  }, errorCB);
});

db.transaction((tx) => {
  tx.executeSql("INSERT INTO token VALUES (1,'xrd_rr1qy5wfsfh','Radix','XRD',18,null)", [], (tx, results) => {
    console.log("Inserts into token table completed");
  }, errorCB);
});



db.transaction((tx) => {
  tx.executeSql('DROP TABLE wallet_x_token', [], (tx, results) => {
    console.log("Drop wallet_x_token token completed");
  }, errorCB);
});

db.transaction((tx) => {
  tx.executeSql(`CREATE TABLE wallet_x_token (
    walled_id INTEGER,
    token_id INTEGER,
enabled_flag INTEGER
)`, [], (tx, results) => {
    console.log("Create wallet_x_token table completed");
  }, errorCB);
});

db.transaction((tx) => {
  tx.executeSql('INSERT INTO wallet_x_token VALUES(1,1,1)', [], (tx, results) => {
    console.log("Inserts into wallet_x_token token completed");
  }, errorCB);
});

// db.transaction((tx) => {

//   tx.executeSql('SELECT * FROM lorem', [], (tx, results) => {
     
//       console.log("Query completed");

//       // Get rows with Web SQL Database spec compliance.

//       var len = results.rows.length;
//       for (let i = 0; i < len; i++) {
//         let row = results.rows.item(i);
//         console.log(`Employee name: ${row.info}, Dept Name: ${row.info}`);
//       }

//       // Alternatively, you can use the non-standard raw method.

//       /*
//         let rows = results.rows.raw(); // shallow copy of rows Array

//         rows.map(row => console.log(`Employee name: ${row.name}, Dept Name: ${row.deptName}`));
//       */
//     }, errorCB);
// });


    navigation.navigate('Home');
  }
  else{
    alert("The passwords entered do not match");
  }
}

const AppDataSave = ({route, navigation}) => {

  const { mnemonicStr, word25Str} = route.params;
  var mnemonic = JSON.stringify(mnemonicStr).replaceAll('"','');
  var word25 = JSON.stringify(word25Str).replaceAll('"','');

  const [, updateState] = React.useState();
const forceUpdate = React.useCallback(() => updateState({}), []);

  




 

const [appPw, setAppPw] = useState("");
const [appPwConfirm, setAppPwConfirm] = useState("");

  
  return (
    <SafeAreaView>
     <View > 
   

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
        title="Understood - Continue"
        enabled
        onPress={() => navigateHome(navigation, appPw, appPwConfirm, mnemonic, word25)}
      />
      <Text>{mnemonicStr}</Text> 
      <Text>{word25Str}</Text> 
     
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
    marginHorizontal: 50,
  },

});



export default AppDataSave;
