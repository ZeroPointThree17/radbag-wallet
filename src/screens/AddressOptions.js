import React, {useRef, useState, useEffect} from 'react';
import { Alert, Keyboard, Button, Text, TextInput, ScrollView, View, StyleSheet } from 'react-native';
import {showMessage} from "react-native-flash-message";
import { StackActions } from '@react-navigation/native';
var SQLite = require('react-native-sqlite-storage');
import { Separator } from '../helpers/jsxlib';
import { getAppFont, useInterval, openCB, errorCB } from '../helpers/helpers';


function updateAddresssName(name, addressId){

  if(name == undefined){
    alert("Name cannot be empty")
  } else{

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  db.transaction((tx) => {
    tx.executeSql("UPDATE address SET name='"+name+"' WHERE id="+addressId, [], (tx, results) => {
          showMessage({
            message: "Address name changed",
            type: "info",
          });
      });
    }, errorCB);
  }
}


function removeAddress(addressId, walletId, navigation,setActiveAddress){

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  db.transaction((tx) => {
    tx.executeSql("SELECT COUNT(*) AS count FROM address WHERE enabled_flag=1 AND wallet_id="+walletId, [], (tx, results) => {

      var len = results.rows.length;

      var count=0;
  for (let i = 0; i < len; i++) {
      let row = results.rows.item(i);

      count = row.count
  }
 
  if(count==1){
    alert("Cannot remove the last address from the wallet")
  }
    else{

      db.transaction((tx) => {

        tx.executeSql("SELECT * FROM wallet where id = "+walletId, [], (tx, results) => {
  
                let row = results.rows.item(0);

                if(row.mnemonic_enc == "HW_WALLET"){
                  alert("Cannot remove hardware wallet addresses")
                } else{
                  Alert.alert(
                    "Remove address",
                    "Are you sure you want to remove this address from this wallet?",
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                      },
                      { text: "Yes", onPress: () => {
            
              db.transaction((tx) => {
                tx.executeSql("UPDATE address SET enabled_flag=0 WHERE id="+addressId, [], (tx, results) => {
            
                  db.transaction((tx) => {
                    tx.executeSql("SELECT MAX(id) AS id from address WHERE enabled_flag=1 and wallet_id="+walletId, [], (tx, results) => {
                
                      var len = results.rows.length;
            
                      var maxAddressId=0;
                  for (let i = 0; i < len; i++) {
                      let row = results.rows.item(i);
            
                      maxAddressId = row.id
                  }
            
                  db.transaction((tx) => {
                    tx.executeSql("UPDATE active_address SET id="+maxAddressId, [], (tx, results) => {
                
                  alert("The address has been removed");
            
                  const pushAction = StackActions.push('Raddish Wallet');
                                            
                  navigation.dispatch(pushAction);
            
                      });
                     }, errorCB);
                  });
                }, errorCB);
            
              });
            }, errorCB);
            
            
            
            } }
            ]
            );
            
                }
        });
      }, errorCB);
}

});
}, errorCB);
    
}


function getAddressDataFromDatabase(db, setActiveAddress, setAddressName, setRadixAddress, setWalletId){

db.transaction((tx) => {
  tx.executeSql("SELECT address.id, address.name, address.radix_address FROM address INNER JOIN active_address ON address.id=active_address.id", [], (tx, results) => {
    var len = results.rows.length;

      for (let i = 0; i < len; i++) {
          let row = results.rows.item(i);
          setActiveAddress(row.id);
          setAddressName(row.name)
          setRadixAddress(row.radix_address)
      }

      db.transaction((tx) => {
        tx.executeSql("SELECT id FROM active_wallet", [], (tx, results) => {
          var len = results.rows.length;

          for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);
              setWalletId(row.id);
          }
    });
  }, errorCB);
}, []);
}, errorCB);

}


const AddressOptions = ({route, navigation}) => {
 
[activeAddress, setActiveAddress] = useState();
[addressName, setAddressName] = useState();
[newAddressName, setNewAddressName] = useState();
[radixAddress, setRadixAddress] = useState();
[walletId, setWalletId] = useState();


var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

useEffect(() => {
  getAddressDataFromDatabase(db, setActiveAddress, setAddressName, setRadixAddress, setWalletId)
}, []);

useInterval(() => {
  getAddressDataFromDatabase(db, setActiveAddress, setAddressName, setRadixAddress, setWalletId)
}, 1000);

const addressNameRef = useRef();

 return ( 
            
      <View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}> 
      <ScrollView>
       <Text style={[{textAlign:'left', fontWeight:'bold', textAlign:'center'},getAppFont("black")]}>Current Address Name:</Text><Text style={[{textAlign:"center", fontSize:20}, getAppFont("black")]}>{addressName}</Text>
       <Separator/>
       <Separator/>
       <Text style={[{textAlign:'left', fontWeight:'bold'}, getAppFont("black")]}>Enter New Address Name:</Text>
      
       <View style={styles.rowStyle}>
       <TextInput ref={addressNameRef}
        style={[{borderColor:global.modeTranslation, padding:10, borderWidth:StyleSheet.hairlineWidth, flex: 1},getAppFont("black")]}
        placeholder='Address Name'
        placeholderTextColor="#d3d3d3"
        autoCapitalize='none'
         value={newAddressName}
        onChangeText={value => setNewAddressName(value)}
      />
  
              </View>
              {Platform.OS != 'ios' && <Separator/>}
              <Button style={[{marginHorizontal: 25}, getAppFont("black")]}
                title="Change Address Name"
                enabled
                onPress={() => {addressNameRef.current.blur(); Keyboard.dismiss; updateAddresssName(newAddressName, activeAddress)}}
              />

   <Separator/>
   <Separator/>

   <Button  color="red" style={[{marginHorizontal: 25}, getAppFont("black")]}
                title="Remove Address"
                enabled
                onPress={() => removeAddress(activeAddress, walletId, navigation, setActiveAddress)}
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

export default AddressOptions;
