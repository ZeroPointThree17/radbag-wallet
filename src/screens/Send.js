import React, {useState} from 'react';
import { Alert, ScrollView,KeyboardAvoidingView, Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { decrypt } from '../helpers/encrypt';
var SQLite = require('react-native-sqlite-storage');
import PasswordInputText from 'react-native-hide-show-password-input';
import { catchError } from 'rxjs/operators';
import SelectDropdown from 'react-native-select-dropdown'
import Clipboard from '@react-native-clipboard/clipboard';
import { Input, Icon } from 'react-native-elements';
const secp256k1 = require('secp256k1');
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


function buildTxn(sourceXrdAddr,xrdAddr, rri, amount, setFee, public_key, privKey_enc){

  var amountStr = (amount * 1000000000000000000).toString();

  alert("src addr: "+sourceXrdAddr+" dest: "+xrdAddr+ " token id: "+rri + " amount "+amountStr)
  fetch('https://mainnet-gateway.radixdlt.com/transaction/build', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
      
          {
            "network_identifier": {
              "network": "mainnet"
            },
            "actions": [
              {
                "type": "TransferTokens",
                "from_account": {
                  "address": sourceXrdAddr
                },
                "to_account": {
                  "address": xrdAddr
                },
                "amount": {
                  "token_identifier": {
                    "rri": rri
                  },
                  "value": amountStr
                }
              }
            ],
            "fee_payer": {
              "address": sourceXrdAddr
            },
            "disable_token_mint_and_burn": true
          } 
      
        )
      }).then((response) => response.json()).then((json) => {

       
        Alert.alert(
          "Commit Transaction?",
          "Fee will be " + json.transaction_build.fee.value/1000000000000000000 + " XRD \n Do you want to commit this transaction?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => submitTxn(json.transaction_build.payload_to_sign, json.transaction_build.unsigned_transaction, public_key, privKey_enc) }
          ]
        );
          // activeAddressBalances
          if(!(json === undefined) && json.hasOwnProperty("transaction_build") ){
            
            // alert(privKey_enc);
            setFee(json.transaction_build.fee.value);
             
          }


      }).catch((error) => {
          console.error(error);
      });
}








function submitTxn(message,unsigned_transaction,public_key,privKey_enc){

  //// var message = '9a25747cd03f9764de539934e1800edc8160a4978aa27b1a6fb8411a11543697'
  var signature = "";
  var privatekey = new Uint8Array(decrypt(privKey_enc, Buffer.from("c")).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  // privatekey = decrypt(privKey_enc, Buffer.from("c"));
  // alert("Privekey unc: "+privatekey)
   signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(message,'hex')), Uint8Array.from(privatekey))


var result=new Uint8Array(72);
secp256k1.signatureExport(signature.signature,result);

var finalSig = Buffer.from(result).toString('hex');

// alert("Message: " +message + " Unsigned Txn: " + unsigned_transaction + " PubkEY: " +public_key+ " PRIVKEY: " +privKey_enc)

// alert("Sig: "+result)
  fetch('https://mainnet-gateway.radixdlt.com/transaction/finalize', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
      
          {
            "network_identifier": {
              "network": "mainnet"
            },
            "unsigned_transaction": unsigned_transaction,
            "signature": {
              "public_key": {
                "hex": public_key
              },
              "bytes": finalSig
            },
            "submit": true
          }
      
        )
      }).then((response) => response.json()).then((json) => {

       alert(JSON.stringify(json))
  

      }).catch((error) => {
          console.error(error);
      });
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



 const Send = ({route, navigation}) => {
 
  const { balancesMap, sourceXrdAddr, setStringObj, cpdataObj } = route.params;
  const [password, setPassword] = useState();
  const [mnemonic_enc, setMnemonic_enc] = useState();
  const [show, setShow] = useState(false);
  const [mnemonic, setMnemonic] = useState();
  const [word13_enc, setword13_enc] = useState();
  const [word13, setword13] = useState();
  const [walletName, setWalletName] = useState();
  const [privKey_enc, setPrivKey_enc] = useState();
  const [public_key, setPublic_key] = useState();

  



  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

  db.transaction((tx) => {
    tx.executeSql("SELECT address.privatekey_enc, address.publickey FROM address INNER JOIN active_address ON address.id=active_address.id", [], (tx, results) => {
      var len = results.rows.length;
      var tempPrivkey_enc = "default_val";
      var tempPubkey = "default_val";
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);
            tempPrivkey_enc = row.privatekey_enc;
            tempPubkey = row.publickey;
        }

        setPrivKey_enc(tempPrivkey_enc);
        setPublic_key(tempPubkey);

      });
    }, errorCB);


  var rris = []
  balancesMap.forEach((balance, rri) => {
    rris.push(rri)
  });
  

  const [xrdAddr, onChangeXrdAddr] = useState(sourceXrdAddr);
  const [destAddr, onChangeDestAddr] = useState("rdx1qspqle5m6trzpev63fy3ws23qlryw3g6t24gpjctjzsdkyuwzj870mg4mgjdz");
  const [amount, onChangeAmount] = useState(null);
  const [rri, onChangeRRI] = useState(null);
  const [fee, setFee] = useState(null);
 
 return ( 
     <View style={styles.container} removeClippedSubviews={false}> 

             <ScrollView style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}>

      <Separator/>
      <Separator/>
      <Text style={{fontWeight:"bold",textAlign:'center', marginHorizontal: 25, fontSize:20}}>Wallet Name</Text>
      <Separator/>
        <Text style={{textAlign:'center', marginHorizontal: 25, fontSize:20}}>Enter the Radix address to send to:</Text>
        <Input
        placeholder='INPUT WITH ICON'
        value={xrdAddr}
        onChangeText={value => onChangeXrdAddr(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />

<Input
        placeholder='INPUT WITH ICON'
        value={destAddr}
        onChangeText={value => onChangeDestAddr(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
       <Separator/>
{/* <KeyboardAvoidingView>
        <TextInput
        style={{inputWidth:'auto', paddingHorizontal:10, marginHorizontal: 10, height: 300, borderWidth:StyleSheet.hairlineWidth}}
        // onChangeText={onChangeXrdAddr}
        // value={copiedText}
        placeholder="Radix address"
      />
</KeyboardAvoidingView> */}


<Input
        placeholder='Amount'
         value={amount}
        onChangeText={value => onChangeAmount(value)}
        // value="rdx1qsp3xmjp8q7jr6yeqluaqs9dhl7fr9qvfkrq6mpp3kk7rdtdhftunggghslzh"
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />

<SelectDropdown
	data={rris}
	onSelect={(selectedItem, index) => {
		onChangeRRI(selectedItem)
	}}
	buttonTextAfterSelection={(selectedItem, index) => {
		// text represented after item is selected
		// if data array is an array of objects then return selectedItem.property to render after item is selected
		return selectedItem
	}}
	rowTextForSelection={(item, index) => {
		// text represented for each item in dropdown
		// if data array is an array of objects then return item.property to represent item in dropdown
		return item
	}}
/>

{/* <TextInput
        style={{paddingHorizontal:10, marginHorizontal: 10, height: 30, borderWidth:StyleSheet.hairlineWidth}}
        onChangeText={onChangeAmount}
        value={xrdAddr}
        placeholder="Amount"
      /> */}



        <Button  style={{marginHorizontal: 25}}
                title="Send"
                enabled
                onPress={() => buildTxn(sourceXrdAddr, destAddr, rri, amount,setFee, public_key, privKey_enc)}
              />
              <Separator/>
              <Separator/>
              <Separator/>
              <Text>Fee: {fee/1000000000000000000} XRD</Text>
              <Text>Priv Key Enc: {privKey_enc}</Text>
              <Text>Pub Key : {public_key}</Text>
{/* <Text>Copied Text: {cpdataObj}</Text>
              

         */}

<Separator/>

</ScrollView>
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

export default Send;
