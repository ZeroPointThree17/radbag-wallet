import React, {useRef, useState, useEffect} from 'react';
import { Alert, TouchableOpacity, Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import Clipboard, {useClipboard} from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
import { StackActions, NavigationActions } from '@react-navigation/native';
var SQLite = require('react-native-sqlite-storage');

const Separator = () => (
  <View style={styles.separator} />
);

// function useInterval(callback, delay) {
//   const savedCallback = useRef();

//   // Remember the latest callback.
//   useEffect(() => {
//     savedCallback.current = callback;
//   }, [callback]);

//   // Set up the interval.
//   useEffect(() => {
//     function tick() {
//       savedCallback.current();
//     }
//     if (delay !== null) {
//       let id = setInterval(tick, delay);
//       return () => clearInterval(id);
//     }
//   }, [delay]);
// }

function errorCB(err) {
  console.log("SQL Error: " + err.message);
}

function openCB() {
  console.log("Database OPENED");
}

function updateAddresssName(name, addressId){

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


const AddressOptions = ({route, navigation}) => {
 
[activeAddress, setActiveAddress] = useState();
[addressName, setAddressName] = useState();
[radixAddress, setRadixAddress] = useState();
[walletId, setWalletId] = useState();

// useInterval(() => {

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  useEffect(() => {
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
}, []);

// }, 1000);

 return ( 
    //  <View >
            
      <View style={styles.container}> 
       <Text style={{textAlign:'left', fontWeight:'bold'}}>Address Name:</Text>
      
       <View style={styles.rowStyle}>
       <TextInput
        style={{padding:10, borderWidth:StyleSheet.hairlineWidth, flex: 1}}
        placeholder='Address Name'
        placeholderTextColor="#d3d3d3"
         value={addressName}
        onChangeText={value => setAddressName(value)}
      />
  
              </View>
              <Button  style={{marginHorizontal: 25}}
                title="Change Address Name"
                enabled
                onPress={() => updateAddresssName(addressName, activeAddress)}
              />

   <Separator/>
   <Separator/>

   <Button  color="red" style={{marginHorizontal: 25}}
                title="Remove Address"
                enabled
                onPress={() => removeAddress(activeAddress, walletId, navigation, setActiveAddress)}
              />
  </View>
  // </View>
  )
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 30,
    margin: 0,
    backgroundColor: "white",
 
   },

   separator: {
    marginVertical: 10,
    borderBottomColor: '#737373',
    borderBottomWidth: 0,
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
