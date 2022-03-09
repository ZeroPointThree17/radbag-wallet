import { Button, BackHandler, ActivityIndicator, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState, useEffect } from 'react';
let { bech32 } = require('bech32')
import PasswordInputText from 'react-native-hide-show-password-input';
var SQLite = require('react-native-sqlite-storage');
import {encrypt} from '../helpers/encryption';
var HDKey = require('hdkey')
import { StackActions } from '@react-navigation/native';
import { Separator } from '../helpers/jsxlib';
import { getAppFont, openCB, errorCB } from '../helpers/helpers';


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


export function navigateHome(setIsActive,navigation, password, confirmPassword, mnemonic, word13, firstFlag, hardwareWallletPubKeys){

  // hardwareWallletPubKeys = [hardwareWallletPubKeys,hardwareWallletPubKeys]
  console.log("NAV HOME BEGIN");

  console.log("INPUT KEYS: "+hardwareWallletPubKeys);

    navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
    });
  

  if(hardwareWallletPubKeys.length==0 && (password.length == 0 || confirmPassword.length == 0 )){
    alert("Password is required");
  } 
  else if(password === confirmPassword || hardwareWallletPubKeys.length > 0){
    
    if(mnemonic != "HW_WALLET"){
    setIsActive(true)
    }

    console.log("PRE ENCRYPT");
  
    var mnemonic_enc = encrypt(mnemonic, Buffer.from(password));
    var word13_enc = encrypt(word13, Buffer.from(password));

    if(mnemonic == "HW_WALLET"){
      mnemonic_enc="HW_WALLET";
      word13_enc="HW_WALLET";
      }

console.log("PRE DB-OPEN");

var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

console.log("ABOUT TO LOAD TABLES");

var doNothingStmt = "SELECT 'DO_NOTHING' as do_nothing_stmt";

var nextWalledId=1;
var nextAddressId=1;

var maxWalletId = "";
var maxAddressId = "";
var dropWallet = "";
var createWallet = "";
var insertWallet = "";
var dropActiveWallet = "";
var createActiveWallet = "";
var insertActiveWallet = "";
var dropActiveAddress = "";
var createActiveAddress = "";
var insertActiveAddress = "";
var dropToken = "";
var createToken = "";
var dropAddress = "";
var createAddress = "";
var insertAddressFirstPart = "";
// alert(firstFlag)

switch(firstFlag) {
case true:
maxWalletId = doNothingStmt;
maxAddressId = doNothingStmt;
dropWallet = 'DROP TABLE IF EXISTS wallet';
createWallet = `CREATE TABLE wallet (
id INTEGER PRIMARY KEY,
name TEXT,
mnemonic_enc TEXT,
word13_enc TEXT
)`;
insertWallet = "INSERT INTO wallet (id, name, mnemonic_enc, word13_enc) VALUES (1, 'My Wallet (#1)', '" + mnemonic_enc + "', '" + word13_enc + "')";
dropActiveWallet = 'DROP TABLE IF EXISTS active_wallet';
createActiveWallet = `CREATE TABLE active_wallet ( id INTEGER )`;
insertActiveWallet = "INSERT INTO active_wallet VALUES(1)";
dropActiveAddress = 'DROP TABLE IF EXISTS active_address';
createActiveAddress = "CREATE TABLE active_address ( id INTEGER )";
insertActiveAddress = "INSERT INTO active_address (id) VALUES('1')";
dropToken = 'DROP TABLE IF EXISTS token';
createToken = `CREATE TABLE token (
id INTEGER PRIMARY KEY,
rri TEXT,
name TEXT,
symbol TEXT,
decimals INTGER,
logo_url TEXT
)`;
dropAddress = 'DROP TABLE IF EXISTS address';
createAddress = `CREATE TABLE address (
id INTEGER PRIMARY KEY,
wallet_id INTEGER,
name TEXT,
radix_address TEXT,
publickey TEXT,
privatekey_enc TEXT,
enabled_flag INTEGER
)`;
insertAddressFirstPart = "INSERT INTO address (wallet_id,name,radix_address,publickey,privatekey_enc,enabled_flag) VALUES (1";
break;
case false:
maxWalletId='SELECT MAX(id) AS id from wallet';
maxAddressId='SELECT MAX(id) AS id from address';
dropWallet = doNothingStmt;
createWallet = doNothingStmt;
dropActiveWallet = doNothingStmt;
createActiveWallet = doNothingStmt;
dropActiveAddress = doNothingStmt;
createActiveAddress = doNothingStmt;
dropToken = doNothingStmt;
createToken = doNothingStmt;
dropAddress = doNothingStmt;
createAddress = doNothingStmt;
break;
default:
// code block
}

db.transaction((tx) => {
  tx.executeSql(maxWalletId, [], (tx, results) => {

          var len = results.rows.length;
      
        for (let i = 0; i < len; i++) {

      let row = results.rows.item(i);
      if(row.do_nothing_stmt!="DO_NOTHING"){
        nextWalledId = row.id + 1;
        console.log("Next wallet ID: " + nextWalledId)
      }
     
        }

          // alert(nextWalledId)
        db.transaction((tx) => {
          tx.executeSql(maxAddressId, [], (tx, results) => {
        
                  var len = results.rows.length;
              
                for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);

              if(row.do_nothing_stmt!="DO_NOTHING"){
                
                nextAddressId = row.id + 1;
                console.log("Next address ID: " + nextAddressId)
              }

                }

  
if(firstFlag){
db.transaction((tx) => {

    tx.executeSql('DROP TABLE IF EXISTS application', [], (tx, results) => {
      console.log("Drop application table completed");

      db.transaction((tx) => {
  tx.executeSql(`CREATE TABLE application (
    new_user_flag INTEGER,
    version INTEGER)`, [], (tx, results) => {
    console.log("Create application table completed");

    db.transaction((tx) => {
      tx.executeSql("INSERT INTO application VALUES(0,10)", [], (tx, results) => {
        console.log("Inserts into application table completed");
        
      }, errorCB);});
  }, errorCB);
});
}, errorCB);
});

}


db.transaction((tx) => {
  tx.executeSql(dropWallet, [], (tx, results) => {
    console.log("Drop wallet table completed");
    db.transaction((tx) => {
      tx.executeSql(createWallet, [], (tx, results) => {
        console.log("Create wallet table completed");

          db.transaction((tx) => {
            tx.executeSql("INSERT INTO wallet (id, name, mnemonic_enc, word13_enc) VALUES ("+nextWalledId+", 'My Wallet (#"+nextWalledId+")', '" + mnemonic_enc + "', '" + word13_enc + "')", [], (tx, results) => {
              console.log("Insert into wallet table completed");




db.transaction((tx) => {
 
  tx.executeSql(dropActiveWallet, [], (tx, results) => {
    console.log("active_wallet DROP attempt completed.")
      db.transaction((tx) => {
          tx.executeSql(createActiveWallet, [], (tx, results) => {
              db.transaction((tx) => {
                  tx.executeSql("INSERT INTO active_wallet VALUES("+nextWalledId+")", [], (tx, results) => {
                  console.log("insert into active_wallet completed");


                  db.transaction((tx) => {
                    console.log("pre active address 0.1 table completed"); 
                    tx.executeSql(dropActiveAddress, [], (tx, results) => {
                      console.log("pre active address 0 table completed"); 
                        db.transaction((tx) => {
                            tx.executeSql(createActiveAddress, [], (tx, results) => {
                                db.transaction((tx) => {
                                    tx.executeSql("INSERT INTO active_address (id) VALUES('"+nextAddressId+"')", [], (tx, results) => {
                                      console.log("Insert into active address table completed");  
                                    const pushAction = StackActions.push('Raddish Wallet');
                                  
                                  navigation.dispatch(pushAction);
                                  
                                    }, errorCB);
                                }); 
                    }, errorCB);
                });
                      }, errorCB);
                    });
                

                  }, errorCB);
              }); 
  }, errorCB);
});
    }, errorCB);
  });


              db.transaction((tx) => {
                tx.executeSql(dropToken, [], (tx, results) => {
                  console.log("Drop token table completed");
                  db.transaction((tx) => {
                    tx.executeSql(createToken, [], (tx, results) => {
                      console.log("Create token table completed");
                    
                    }, errorCB);
                  });
                }, errorCB);
              });

var seed=""
var hdkey=""
 if(hardwareWallletPubKeys.length == 0){
               seed = bip39.mnemonicToSeedSync(mnemonic,word13).toString('hex');
     
               hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))
 }
              

              db.transaction((tx) => {
                tx.executeSql(dropAddress, [], (tx, results) => {
                  console.log("Drop address table completed");
                  db.transaction((tx) => {
                    tx.executeSql(createAddress, [], (tx, results) => {
                      console.log("Create address table completed");
                      var enabled_flag=1;
                      var numberOfAddrs = hardwareWallletPubKeys.length == 0 ? 16 : hardwareWallletPubKeys.length + 1
                      for (let i = 1; i < numberOfAddrs; i++) {
                    
                        db.transaction((tx) => {
 
                          var privatekey_enc ="HARDWARE_WALLET"
                          var publicKey = undefined;
                          var rdx_addr = undefined;
                          if(i==2 && hardwareWallletPubKeys.length == 0){enabled_flag=0};

                          if(hardwareWallletPubKeys.length == 0){
                            var childkey = hdkey.derive("m/44'/1022'/0'/0/"+(i-1).toString()+"'")
                            var privatekey_enc = encrypt(childkey.privateKey.toString('hex'), Buffer.from(password));
                            var publicKey = childkey.publicKey.toString('hex');
                            var readdr_bytes = Buffer.concat([Buffer.from([0x04]), childkey.publicKey]);
                            var readdr_bytes5 = convertbits(Uint8Array.from(readdr_bytes), 8, 5, true);
                            var rdx_addr = bech32.encode("rdx", readdr_bytes5);
                          
                          } else{

                            var publicKey = hardwareWallletPubKeys[i-1];
                            var readdr_bytes = Buffer.concat([Buffer.from([0x04]), Buffer.from(publicKey, "hex")]);
                            var readdr_bytes5 = convertbits(Uint8Array.from(readdr_bytes), 8, 5, true);
                            var rdx_addr = bech32.encode("rdx", readdr_bytes5);
                      
                          }
                          
                          tx.executeSql("INSERT INTO address (wallet_id,name,radix_address,publickey,privatekey_enc,enabled_flag) VALUES ("+nextWalledId+",'My Address (#"+i.toString()+")','"+rdx_addr+"','"+publicKey+"','"+privatekey_enc+"','"+enabled_flag+"')", [], (tx, results) => {
                            console.log("Insert into address table completed");
                            
                          }, errorCB);
                        });
                     } 

                    }, errorCB);
                  });
                }, errorCB);
              });



            }, errorCB);
          });
      }, errorCB);
    });
  }, errorCB);
});

  }, errorCB);
});
    }, errorCB);
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

function handleBackButtonClick(navigation) {
  navigation.goBack(null);
  return true;
}

const AppDataSave = ({route, navigation}) => {

  // useEffect(() => {
  //   BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick(navigation));
  //   return () => {
  //     BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick(navigation));
  //   };
  // }, []);

  const { mnemonicStr, word13Str, firstTimeStr, hardwareWallletPubKeyArr} = route.params;
  var mnemonic = JSON.stringify(mnemonicStr).replace(/"/g, '');
  var word13 = JSON.stringify(word13Str).replace(/"/g, '');
  var firstTimeString = JSON.stringify(firstTimeStr).replace(/"/g, '');
  var hardwareWallletPubKeys = hardwareWallletPubKeyArr;

  var firstTime=true
  if(firstTimeString=="false"){firstTime=false}
  console.log("first time: "+firstTime)

  const [, updateState] = React.useState();
const forceUpdate = React.useCallback(() => updateState({}), []);
const [appPw, setAppPw] = useState("");
const [appPwConfirm, setAppPwConfirm] = useState("");
const [isActive, setIsActive] = useState(false);
  
if(hardwareWallletPubKeyArr.length > 0){
  navigateHome(setIsActive,navigation, appPw, appPwConfirm, mnemonic, word13, firstTime, hardwareWallletPubKeys)
}

  return (
    <SafeAreaView style={styles.container}>
      <Separator/>
      <Separator/>
     <View > 

     { isActive
  &&
  <React.Fragment><ActivityIndicator /><Separator/></React.Fragment>
  }
{hardwareWallletPubKeys.length>0 && <React.Fragment>
<View style={styles.rowStyle}>
        <Text style={getAppFont("black")}>Setting up Hardware Wallet for the first time. Please wait...</Text>
      </View>
</React.Fragment>
}
{ isActive
  &&
  <Text style={[styles.title,getAppFont("black")]}>Setting up wallet for the first time. Please wait...</Text>
  }
<Separator/>
<Separator/>
{hardwareWallletPubKeys.length==0 && <React.Fragment>
    <Text style={[styles.title,getAppFont("black")]}>Enter a password to protect the data in this wallet.</Text>
 <PasswordInputText style={[styles.title, getAppFont("black")]}
onChangeText={(password) => setAppPw( password )}
label='Wallet Password' />

<PasswordInputText style={[styles.title,getAppFont("black")]}
onChangeText={(password) => setAppPwConfirm( password )}
label='Confirm Wallet Password' />

 <Separator/>
 { !isActive
  &&
  
 <Button style={getAppFont("black")}
        title="Continue"
        enabled = {!isActive}
        onPress={() => {navigateHome(setIsActive,navigation, appPw, appPwConfirm, mnemonic, word13, firstTime, hardwareWallletPubKeys)}}
      />
     
  }
  </React.Fragment>}
<Separator/>
<Separator/>

  </View> 
  </SafeAreaView>
  )
  ;
};


const styles = StyleSheet.create({
  input: {
    height: 40,
    marginHorizontal: 75,
    borderWidth: 1,
    padding: 10,
  },
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35
  },
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
    paddingHorizontal: 20,
    backgroundColor: 'white',
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
  title: {
    textAlign: 'center',
    marginVertical: 4,
    marginHorizontal: 50
  },
  rowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5
  },
});



export default AppDataSave;
