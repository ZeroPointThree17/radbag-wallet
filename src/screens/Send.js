import React, {useState} from 'react';
import { Linking, Alert, ScrollView,KeyboardAvoidingView, Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
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
import { shortenAddress } from './Home';
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


function buildTxn(reverseTokenMetadataMap, sourceXrdAddr,xrdAddr, symbol, amount, setFee, public_key, privKey_enc, setShow, setTxHash){

  if ( isNaN(amount)){
    alert("Amount entered must be a number")
  } else if(amount == undefined || amount.length==0){
    alert("Amount is required")
  }
  else if(amount==0){
    alert("Amount must be greater than 0")
  }
  else{

  var amountStr = (amount * 1000000000000000000).toString();


  // alert("src addr: "+sourceXrdAddr+" dest: "+xrdAddr+ " token rri: "+reverseTokenMetadataMap.get(symbol) + " amount "+amountStr)
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
                    "rri": reverseTokenMetadataMap.get(symbol)
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

         if(json.code == 400 && json.message == "Account address is invalid"){
           alert("You've entered an invalid address")
         }
         else{
        // alert(JSON.stringify(json))
       
        Alert.alert(
          "Commit Transaction?",
          "Fee will be " + json.transaction_build.fee.value/1000000000000000000 + " XRD \n Do you want to commit this transaction?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => submitTxn(json.transaction_build.payload_to_sign, json.transaction_build.unsigned_transaction, public_key, privKey_enc, setShow, setTxHash) }
          ]
        );
          // activeAddressBalances
          if(!(json === undefined) && json.hasOwnProperty("transaction_build") ){
            
            // alert(privKey_enc);
            setFee(json.transaction_build.fee.value);
             
          }

        }
      }).catch((error) => {
          console.error(error);
      });
}

}






function submitTxn(message,unsigned_transaction,public_key,privKey_enc, setShow, setTxHash){

  setShow(false);

  var passwordStr = ""
  Alert.prompt(
    "Enter wallet password",
    "Enter the wallet password to perform this transaction",
    [
      {
        text: "Cancel",
        onPress: () => alert("Transaction not performed"),
        style: "cancel"
      },
      {
        text: "OK",
        onPress: password => {

  try{
    var signature = "";
  var privatekey = new Uint8Array(decrypt(privKey_enc, Buffer.from(password)).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
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
  
         var txnHash = JSON.stringify(json.transaction_identifier.hash).replace(/["']/g, "")
        
         setShow(true);
         setTxHash(txnHash);
  
        }).catch((error) => {
            console.error(error);
        });  
} catch(err){
    alert("Password incorrect")
  }
  
        }
      }
    ],
    "secure-text"
  );

}












 const Send = ({route, navigation}) => {
 
  const { defaultSymbol, balancesMap, sourceXrdAddr, tokenMetadataObj } = route.params;
  const [password, setPassword] = useState();
  const [privKey_enc, setPrivKey_enc] = useState();
  const [public_key, setPublic_key] = useState();

  // alert(defaultSymbol)
  



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


  var symbols = []
  var reverseTokenMetadataMap = new Map();
  balancesMap.forEach((balance, rri) => {
    symbols.push(JSON.stringify(tokenMetadataObj.get(rri).symbol.toUpperCase()).replace(/["']/g, ""))
    reverseTokenMetadataMap.set(JSON.stringify(tokenMetadataObj.get(rri).symbol.toUpperCase()).replace(/["']/g, ""), rri);
    // alert(JSON.stringify(tokenMetadataObj.get(rri).symbol.toUpperCase()).replace(/["']/g, ""));
  });
  

  const [xrdAddr, onChangeXrdAddr] = useState(sourceXrdAddr);
  const [destAddr, onChangeDestAddr] = useState("rdx1qspqle5m6trzpev63fy3ws23qlryw3g6t24gpjctjzsdkyuwzj870mg4mgjdz");
  const [amount, onChangeAmount] = useState(null);
  const [symbol, onChangeSymbol] = useState(defaultSymbol);
  const [fee, setFee] = useState(null);
  const [txnHash, setTxHash] = useState(null);
  const [show, setShow] = useState(false);

 return ( 
     <View style={styles.container} > 

             

     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:16}}>Address you are sending from:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:10, borderWidth:StyleSheet.hairlineWidth, height:50, width:300, backgroundColor:"#d3d3d3"}}
        disabled="true"
        multiline={true}
        numberOfLines={4}
        placeholder='INPUT WITH ICON'
        value={sourceXrdAddr}
        // onChangeText={value => onChangeXrdAddr(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>

      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:16}}>Address to send to:</Text>
      <View style={styles.rowStyle}>

<TextInput
style={{padding:10, borderWidth:StyleSheet.hairlineWidth, height:50, width:300}}
        placeholder='Destination Radix Address'
        value={destAddr}
        onChangeText={value => onChangeDestAddr(value)}
        multiline={true}
        numberOfLines={4}
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
</View>

<Separator/>

<Text style={{textAlign:'left', marginHorizontal: 0, fontSize:16}}>Amount to send:</Text>
<View style={styles.rowStyle}>
<TextInput
        style={{padding:10, borderWidth:StyleSheet.hairlineWidth, height:40, width:180}}
        placeholder='Amount'
         value={amount}
        onChangeText={value => onChangeAmount(value)}
        // value="rdx1qsp3xmjp8q7jr6yeqluaqs9dhl7fr9qvfkrq6mpp3kk7rdtdhftunggghslzh"
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />

<SelectDropdown
 buttonStyle={{backgroundColor:"#183A81", height: 40, width:100, borderWidth:StyleSheet.hairlineWidth, margin:10}}
 buttonTextStyle={{color:"white"}}
	data={symbols}
  defaultValue={defaultSymbol}
	onSelect={(selectedItem, index) => {
		onChangeSymbol(selectedItem)
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
</View>
{/* <TextInput
        style={{paddingHorizontal:10, marginHorizontal: 10, height: 30, borderWidth:StyleSheet.hairlineWidth}}
        onChangeText={onChangeAmount}
        value={xrdAddr}
        placeholder="Amount"
      /> */}

<Separator/>

        <Button  style={{fontSize:16, marginHorizontal: 0, color:"black", borderWidth:StyleSheet.hairlineWidth, borderColor:'black'}}
                title="Send"
                enabled
                onPress={() => buildTxn(reverseTokenMetadataMap, sourceXrdAddr, destAddr, symbol, amount,setFee, public_key, privKey_enc, setShow, setTxHash)}
              />

{/* <TouchableOpacity style={styles.button} onPress={() =>  navigation.navigate('Send',{defaultSymbol:"XRD", balancesMap: balances, sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address, tokenMetadataObj: tokenMetadata})}>
        <View style={styles.rowStyle}>
        <IconFeather name="send" size={20} color="white" />
        <Text style={{fontSize: 16, color:"white"}}> Send</Text>
        </View>
        </TouchableOpacity> */}
              <Separator/>
              <Separator/>
              {/* <Text>Fee: {fee/1000000000000000000} XRD</Text>
              <Text>Priv Key Enc: {privKey_enc}</Text>
              <Text>Pub Key : {public_key}</Text> */}

<Separator/>

{ show == true &&
<Text
       style={{color: 'blue', textAlign: "center"}}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/transactions/'+txnHash)}}
     >
       Transaction has been submitted.{"\n\n"}Transaction hash is: {txnHash}{"\n\n"}Click here for transaction details. Refresh page if transaction does not immediately display.
     </Text>
 }


  </View>)
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 50,
    margin: 0,
    backgroundColor: "white",
    justifyContent: "flex-start"
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

export default Send;
