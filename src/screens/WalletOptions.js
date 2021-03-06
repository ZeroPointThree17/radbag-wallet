import React, {useRef, useState, useEffect} from 'react';
import { Alert, Keyboard, Button, Text, TextInput, ScrollView, View, StyleSheet } from 'react-native';
import {showMessage} from "react-native-flash-message";
import { StackActions } from '@react-navigation/native';
var SQLite = require('react-native-sqlite-storage');
import { Separator } from '../helpers/jsxlib';
import { getAppFont, useInterval, openCB, errorCB } from '../helpers/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';


function updateWalletName(name, walletId){

  if(name == undefined){
    alert("Name cannot be empty")
  } else{

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  db.transaction((tx) => {
    tx.executeSql("UPDATE wallet SET name='"+name+"' WHERE id="+walletId, [], (tx, results) => {

          showMessage({
            message: "Wallet name changed",
            type: "info",
          });

      });
    }, errorCB);
  }
}


function removeWallet(walletId, navigation){

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  db.transaction((tx) => {
    tx.executeSql("SELECT COUNT(*) AS count FROM wallet", [], (tx, results) => {

      var len = results.rows.length;

      var count=0;
  for (let i = 0; i < len; i++) {
      let row = results.rows.item(i);

      count = row.count
  }

  if(count==1){
    alert("Cannot remove the last wallet in this app")
  }
    else{

      Alert.alert(
        "Remove Wallet",
        "Are you sure you want to remove this wallet? All associated addresses will also be removed.",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "Yes", onPress: () => {

  db.transaction((tx) => {
    tx.executeSql("DELETE FROM address WHERE wallet_id="+walletId, [], (tx, results) => {

      db.transaction((tx) => {
        tx.executeSql("DELETE FROM wallet WHERE id="+walletId, [], (tx, results) => {
    
          db.transaction((tx) => {
            tx.executeSql("SELECT MAX(id) AS id FROM wallet", [], (tx, results) => {
        
              var len = results.rows.length;
              var maxId = 0
              for (let i = 0; i < len; i++) {
                  let row = results.rows.item(i);
                  maxId = row.id ;
              }

              db.transaction((tx) => {
                tx.executeSql("UPDATE active_wallet SET id="+maxId, [], (tx, results) => {
            
                  db.transaction((tx) => {
                    tx.executeSql("SELECT MAX(id) AS id FROM address WHERE enabled_flag=1 AND wallet_id="+maxId, [], (tx, results) => {
                
                      var len = results.rows.length;
                      var maxAddressId = 0
                      for (let i = 0; i < len; i++) {
                          let row = results.rows.item(i);
                          maxAddressId = row.id ;
                      }

                      db.transaction((tx) => {
                        tx.executeSql("UPDATE active_address SET id="+maxAddressId, [], (tx, results) => {
                    
                            AsyncStorage.removeItem('@HiddenTokensWallet-' + walletId).then(() => {
                                
                                alert("The wallet has been removed");
                                const pushAction = StackActions.push('Raddish Wallet');
                                navigation.dispatch(pushAction);
                            });

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
              }, errorCB)


} }
]
);



}



}, errorCB);
 
  });
}


function getWalletDataFromDatabase(db, setWalletId, setWalletName){
  db.transaction((tx) => {
    tx.executeSql("SELECT wallet.id, wallet.name FROM wallet INNER JOIN active_wallet ON wallet.id=active_wallet.id", [], (tx, results) => {
      var len = results.rows.length;
  
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);
            setWalletId(row.id);
            setWalletName(row.name)
        }
  
    
  }, []);
  }, errorCB);

}

const WalletOptions = ({route, navigation}) => {
 
[walletName, setWalletName] = useState();
[newWalletName, setNewWalletName] = useState();
[walletId, setWalletId] = useState();

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  useEffect(() => {
      getWalletDataFromDatabase(db, setWalletId, setWalletName)
  }, []);

  useInterval(() => {
    getWalletDataFromDatabase(db, setWalletId, setWalletName)
}, 1000);

const walletNameRef = useRef();

return ( 
            
      <View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}> 
      <ScrollView>
      <Text style={[{textAlign:'left', fontWeight:'bold', textAlign:'center'},getAppFont("black")]}>Current Wallet Name:</Text><Text style={[{textAlign:'center', fontSize:20}, getAppFont("black")]}>{walletName}</Text>
       <Separator/>
       <Separator/>
       <Text style={[{textAlign:'left', fontWeight:'bold'},getAppFont("black")]}>Enter new Wallet Name:</Text>
      
       <View style={styles.rowStyle}>
       <TextInput ref={walletNameRef}
        style={[{borderColor:global.modeTranslation, padding:4, paddingLeft:10, height:40, borderRadius: 15, borderWidth:StyleSheet.hairlineWidth, flex: 1}, getAppFont("black")]}
        placeholder='Wallet Name'
        placeholderTextColor="#d3d3d3"
        autoCapitalize='none'
        onChangeText={value => setNewWalletName(value)}
      />
  
              </View>
              {Platform.OS != 'ios' && <Separator/>}
              <Button  style={[{marginHorizontal: 25}, getAppFont("black")]}
                title="Change Wallet Name"
                enabled
                onPress={() => {walletNameRef.current.blur();Keyboard.dismiss;updateWalletName(newWalletName, walletId)}}
              />

   <Separator/>
   <Separator/>

   <Button  color="red" style={[{marginHorizontal: 25}, getAppFont("black")]}
                title="Remove Wallet"
                enabled
                onPress={() => removeWallet(walletId, navigation)}
              />
    </ScrollView>
  </View>

  )
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 30,
    margin: 0,
    backgroundColor: "white",
   },
      rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:5
      },
});

export default WalletOptions;
