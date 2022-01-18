import React, {useState} from 'react';
import { Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { decrypt } from '../helpers/encrypt';
var SQLite = require('react-native-sqlite-storage');
import PasswordInputText from 'react-native-hide-show-password-input';
import { catchError } from 'rxjs/operators';

const Separator = () => (
  <View style={styles.separator} />
);


function errorCB(err) {
  alert("SQL Error: " + err.message);
}

function successCB() {
  console.log("SQL executed fine");
}

function openCB() {
  // console.log("Database OPENED");
}


function showMnemonic(mnemonic_enc, word13_enc, password, setShow, setMnemonic, setword13){
  
  try{
  var mnemonic = decrypt(mnemonic_enc, Buffer.from(password));
  var word13 = decrypt(word13_enc, Buffer.from(password));
  setMnemonic(mnemonic);
  setword13(word13);
  setShow(true);
  } catch(err){
    alert("Password was incorrect")
  }
}




 const MnemonicDisplay = ({route}) => {



  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  db.transaction((tx) => {
    tx.executeSql("SELECT wallet.mnemonic_enc FROM wallet INNER JOIN active_wallet ON wallet.id=active_wallet.id", [], (tx, results) => {
      var len = results.rows.length;
      var tempMnemonic = "default_val";
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);
            tempMnemonic = row.mnemonic_enc
        }

        setMnemonic_enc(tempMnemonic);

        db.transaction((tx) => {
          tx.executeSql("SELECT wallet.word13_enc FROM wallet INNER JOIN active_wallet ON wallet.id=active_wallet.id", [], (tx, results) => {
            var len = results.rows.length;
            var tempword13_enc = "default_val";
              for (let i = 0; i < len; i++) {
                  let row = results.rows.item(i);
                  tempword13_enc = row.word13_enc
              }
      
              setword13_enc(tempword13_enc);

              
        db.transaction((tx) => {
          tx.executeSql("SELECT wallet.name FROM wallet INNER JOIN active_wallet ON wallet.id=active_wallet.id", [], (tx, results) => {
            var len = results.rows.length;
            var wallet_name = "default_val";
              for (let i = 0; i < len; i++) {
                  let row = results.rows.item(i);
                  wallet_name = row.name
              }
      
              setWalletName("Selected Wallet Name: \n" + wallet_name);

            });
          }, errorCB);
              
            });
          }, errorCB);
      });
    }, errorCB);


  const [password, setPassword] = useState();
  const [mnemonic_enc, setMnemonic_enc] = useState();
  const [show, setShow] = useState(false);
  const [mnemonic, setMnemonic] = useState();
  const [word13_enc, setword13_enc] = useState();
  const [word13, setword13] = useState();

  const [walletName, setWalletName] = useState();

  

 return ( 
     <View style={styles.container}> 
      <Separator/>
      <Separator/>
      <Text style={{fontWeight:"bold",textAlign:'center', marginHorizontal: 25, fontSize:20}}>{walletName}</Text>
      <Separator/>
        <Text style={{textAlign:'center', marginHorizontal: 25, fontSize:20}}>Enter the Radix address to send to:</Text>
        <Separator/>
        <PasswordInputText  style={{marginHorizontal: 25}}
        onChangeText={(password) => setPassword( password )}
        label='App Password' />

        <Button  style={{marginHorizontal: 25}}
                title="Show Mnemonic"
                enabled
                onPress={() => showMnemonic(mnemonic_enc, word13_enc, password, setShow, setMnemonic,setword13)}
              />
              <Separator/>
              <Separator/>
              <Separator/>

              
              { show && 
       <Text style={{textAlign:'center', marginHorizontal: 25, fontSize:20}}>Mnemonic Phrase:</Text> 
        
        }

<Separator/>

        { show && 
       
        <Text style={{textAlign:'center', marginHorizontal: 25, fontSize:20}}>{mnemonic} {word13}</Text>
        }
  
  </View>)
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: "white",
    justifyContent: "flex-start"
   },

   separator: {
    marginVertical: 10,
    borderBottomColor: '#737373',
    borderBottomWidth: 0,
  },
});

export default MnemonicDisplay;