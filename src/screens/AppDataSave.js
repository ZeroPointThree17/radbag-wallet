import { Button, ActivityIndicator, SafeAreaView, View, Text, StyleSheet } from 'react-native';
const bip39 = require('bip39');
import React, { useState } from 'react';
let { bech32, bech32m } = require('bech32')
import QRCode from 'react-native-qrcode-svg';
import PasswordInputText from 'react-native-hide-show-password-input';
var bcrypt = require('react-native-bcrypt');;
var SQLite = require('react-native-sqlite-storage');
import {encrypt, decrypt} from '../helpers/encrypt';
var HDKey = require('hdkey')
import { StackActions, NavigationActions } from '@react-navigation/native';


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
  console.log("SQL Error: " + err.message );
}

function openCB() {
  console.log("Database OPENED");
}



function navigateHome(navigation, password, confirmPassword, mnemonic, word13, firstFlag){

  if(password.length == 0 || confirmPassword.length == 0 ){
    alert("Password is required");
  } 
  else if(password === confirmPassword){
    // var salt = bcrypt.genSaltSync(10);
    // var pwHash = bcrypt.hashSync(password, salt);

  //  console.log(bcrypt.compareSync(password, pwHash)); // true

var mnemonic_enc = encrypt(mnemonic, Buffer.from(password));
var word13_enc = encrypt(word13, Buffer.from(password));


var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

console.log("ABOUT TO LOAD TABLES")

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
// insertWallet = 
dropActiveWallet = doNothingStmt;
createActiveWallet = doNothingStmt;
// insertActiveWallet = "INSERT INTO active_wallet VALUES("+nextWalledId+")";
dropActiveAddress = doNothingStmt;
createActiveAddress = doNothingStmt;
// insertActiveAddress = ;
dropToken = doNothingStmt;
createToken = doNothingStmt;
dropAddress = doNothingStmt;
createAddress = doNothingStmt;
// insertAddressFirstPart = ;
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
        // alert("Next wallet ID: " + nextWalledId)
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
                // alert("Next address ID: " + nextAddressId)
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


// db.transaction((tx) => {
//   tx.executeSql('DROP TABLE IF EXISTS id', [], (tx, results) => {
//     console.log("Drop id table completed");
//     db.transaction((tx) => {
//       tx.executeSql(`CREATE TABLE id (
//         table_name TEXT,
//         next_id INTEGER
//     )`, [], (tx, results) => {
//         console.log("Create id table completed");
//         db.transaction((tx) => {
//           tx.executeSql("INSERT INTO id VALUES('wallet',1)", [], (tx, results) => {
//             console.log("Inserts into id table completed");
            
//           }, errorCB);
//         });
//       }, errorCB);
//     });
//   }, errorCB);
// });


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
                                      // setAppPw("");
                                      // setAppPwConfirm(""); 
                                      // setIsActive(false);
                                      // 
                                      
                                    //   const resetAction = StackActions.reset({
                                    //     index: 0,
                                    //     actions: [NavigationActions.navigate({ routeName: 'Raddish Wallet' })],
                                    // });
                                    // navigation.dispatch(resetAction);
                                    // navigation.navigate('Raddish Wallet');
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
                      // db.transaction((tx) => {
                      //   tx.executeSql("INSERT INTO token (rri, name, symbol, decimals, logo_url) VALUES ('xrd_rr1qy5wfsfh','Radix','XRD',18,null)", [], (tx, results) => {
                      //     console.log("Inserts into token table completed");
                        

                          // db.transaction((tx) => {
                          //   tx.executeSql('DROP TABLE IF EXISTS wallet_x_token', [], (tx, results) => {
                          //     console.log("Drop wallet_x_token table completed");
                          //     db.transaction((tx) => {
                          //       tx.executeSql(`CREATE TABLE wallet_x_token (
                          //         id INTEGER PRIMARY KEY,
                          //         wallet_id INTEGER,
                          //         rri TEXT,
                          //     enabled_flag INTEGER
                          //     )`, [], (tx, results) => {
                          //         console.log("Create wallet_x_token table completed");
                                  // db.transaction((tx) => {
                                  //   tx.executeSql('INSERT INTO wallet_x_token (wallet_id, token_id, enabled_flag) select distinct a.id, b.id, 1 from wallet a, token b', [], (tx, results) => {
                                  //     console.log("Inserts into wallet_x_token token completed");
                                    
                                  //   }, errorCB);
                                  // });
                                  
                          //       }, errorCB);
                          //     });
                          //   }, errorCB);
                          // });
                          
                          
              //           }, errorCB);
              //         });
                    }, errorCB);
                  });
                }, errorCB);
              });



              var seed = bip39.mnemonicToSeedSync(mnemonic,word13).toString('hex');
     
              var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))
              
              

              db.transaction((tx) => {
                tx.executeSql(dropAddress, [], (tx, results) => {
                  console.log("Drop address table completed");
                  db.transaction((tx) => {
                    tx.executeSql(createAddress, [], (tx, results) => {
                      console.log("Create address table completed");
                      var enabled_flag=1;
                      for (let i = 1; i < 16; i++) {
                    
                        db.transaction((tx) => {
                    
                          var childkey = hdkey.derive("m/44'/1022'/0'/0/"+(i-1).toString()+"'")
                          var privatekey_enc = encrypt(childkey.privateKey.toString('hex'), Buffer.from(password));
                          var publicKey = childkey.publicKey.toString('hex');
                          var readdr_bytes = Buffer.concat([Buffer.from([0x04]), childkey.publicKey]);
                          var readdr_bytes5 = convertbits(Uint8Array.from(readdr_bytes), 8, 5, true);
                          var rdx_addr = bech32.encode("rdx", readdr_bytes5);
                      
                          if(i==2){enabled_flag=0}
                          
                          tx.executeSql("INSERT INTO address (wallet_id,name,radix_address,publickey,privatekey_enc,enabled_flag) VALUES ("+nextWalledId+",'My Address (#"+i.toString()+")','"+rdx_addr+"','"+publicKey+"','"+privatekey_enc+"','"+enabled_flag+"')", [], (tx, results) => {
                            console.log("Insert into address table completed");
                            

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

const AppDataSave = ({route, navigation}) => {

  const { mnemonicStr, word13Str, firstTimeStr} = route.params;
  var mnemonic = JSON.stringify(mnemonicStr).replaceAll('"','');
  var word13 = JSON.stringify(word13Str).replaceAll('"','');
  var firstTimeString = JSON.stringify(firstTimeStr).replaceAll('"','');

  var firstTime=true
  if(firstTimeString=="false"){firstTime=false}
  console.log("first time: "+firstTime)

  const [, updateState] = React.useState();
const forceUpdate = React.useCallback(() => updateState({}), []);
const [appPw, setAppPw] = useState("");
const [appPwConfirm, setAppPwConfirm] = useState("");
var isActive=false;

  
  return (
    <SafeAreaView style={styles.container}>
      <Separator/>
      <Separator/>
     <View > 

     { isActive
  &&
  <ActivityIndicator />
  }

{ isActive
  &&
  <Text style={styles.title}>Setting up wallet for the first time. Please wait...</Text>
  }
<Separator/>
<Separator/>
    <Text style={styles.title}>Enter a password to protect the data in this wallet.</Text>
 <PasswordInputText style={styles.title}
onChangeText={(password) => setAppPw( password )}
label='Wallet Password' />

<PasswordInputText style={styles.title}
onChangeText={(password) => setAppPwConfirm( password )}
label='Confirm Wallet Password' />

 <Separator/>
 <Button
        title="Continue"
        enabled = {!isActive}
        onPress={() => navigateHome(navigation, appPw, appPwConfirm, mnemonic, word13, firstTime)}
      />
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
    borderWidth: StyleSheet.hairlineWidth,
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
