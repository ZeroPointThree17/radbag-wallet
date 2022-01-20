import React, {useRef, useState, useEffect} from 'react';
import { TouchableOpacity, Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import Clipboard, {useClipboard} from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
import { StackActions, NavigationActions } from '@react-navigation/native';
var SQLite = require('react-native-sqlite-storage');

const Separator = () => (
  <View style={styles.separator} />
);

function errorCB(err) {
  console.log("SQL Error: " + err.message);
}

function openCB() {
  console.log("Database OPENED");
}

function updateWalletName(name, walletId){

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
            
      alert("The wallet has been removed");

      const pushAction = StackActions.push('Raddish Wallet');
                                
      navigation.dispatch(pushAction);

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
}, errorCB)}



}, errorCB);
 
  });
}




const WalletOptions = ({route, navigation}) => {
 
[walletName, setWalletName] = useState();
[walletId, setWalletId] = useState();

  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  useEffect(() => {
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
}, []);

  const copyToClipboard = (string) => {
    Clipboard.setString(string);
// alert(string)
        showMessage({
  message: "Address copied to clipboard",
  type: "info",
});
  }

 return ( 
    //  <View >
            
      <View style={styles.container}> 
       <Text style={{textAlign:'left', fontWeight:'bold'}}>Wallet Name:</Text>
      
       <View style={styles.rowStyle}>
       <TextInput
        style={{padding:10, borderWidth:StyleSheet.hairlineWidth, flex: 1}}
        placeholder='Wallet Name'
        placeholderTextColor="#d3d3d3"
         value={walletName}
        onChangeText={value => setWalletName(value)}
      />
  
              </View>
              <Button  style={{marginHorizontal: 25}}
                title="Change Wallet Name"
                enabled
                onPress={() => updateWalletName(walletName, walletId)}
              />

   <Separator/>
   <Separator/>

   <Button  color="red" style={{marginHorizontal: 25}}
                title="Remove Wallet"
                enabled
                onPress={() => removeWallet(walletId, navigation)}
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

export default WalletOptions;
