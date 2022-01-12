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


function showMnemonic(mnemonic_enc, word25_enc, password, setShow, setMnemonic, setWord25){
  
  try{
  var mnemonic = decrypt(mnemonic_enc, Buffer.from(password));
  var word25 = decrypt(word25_enc, Buffer.from(password));
  setMnemonic(mnemonic);
  setWord25(word25);
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
          tx.executeSql("SELECT wallet.word25_enc FROM wallet INNER JOIN active_wallet ON wallet.id=active_wallet.id", [], (tx, results) => {
            var len = results.rows.length;
            var tempWord25_enc = "default_val";
              for (let i = 0; i < len; i++) {
                  let row = results.rows.item(i);
                  tempWord25_enc = row.word25_enc
              }
      
              setWord25_enc(tempWord25_enc);
            });
          }, errorCB);
      });
    }, errorCB);


  
  
    const [password, setPassword] = useState();
  const [mnemonic_enc, setMnemonic_enc] = useState();
  const [show, setShow] = useState(false);
  const [mnemonic, setMnemonic] = useState();
  const [word25_enc, setWord25_enc] = useState();
  const [word25, setWord25] = useState();

  

 return ( 
     <View > 
<Text style={styles.title}>Enter your wallet password to display the mnemonic</Text>
 <PasswordInputText style={styles.title}
onChangeText={(password) => setPassword( password )}
label='App Password' />

<Button
        title="Show Mnemonic"
        enabled
        onPress={() => showMnemonic(mnemonic_enc, word25_enc, password, setShow, setMnemonic,setWord25)}
      />
{ show && 
<Text>{mnemonic} {word25}</Text>
 }
  
  </View>)
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
    paddingTop: 22
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
    marginVertical: 0,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default MnemonicDisplay;
