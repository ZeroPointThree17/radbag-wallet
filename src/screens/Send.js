import React, {useState, useEffect, useRef} from 'react';
import { Keyboard, TouchableOpacity, Linking, Alert, ScrollView, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
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
import IconFeather from 'react-native-vector-icons/Feather';
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const Separator = () => (
  <View style={styles.separator} />
);

function errorCB(err) {
  console.log("SQL Error: " + err.message);
}

function openCB() {
  console.log("Database OPENED");
}


function buildTxn(rri, sourceXrdAddr,xrdAddr, symbol, amount, public_key, privKey_enc, setShow, setTxHash){

  Keyboard.dismiss; 
  // alert(rri)
  if(xrdAddr == undefined || xrdAddr.length==0){
    alert("Destination address is required")
  }
  else 
  if ( isNaN(amount) ){
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
                  // "address": "rdx1qspqle5m6trzpev63fy3ws23qlryw3g6t24gpjctjzsdkyuwzj870mg4mgjdz"
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
        // alert(JSON.stringify(json))
         if(json.code == 400 && json.message == "Account address is invalid"){
           alert("You've entered an invalid address")
         }
         else if(json.code == 400 && json.details.type == "NotEnoughTokensForTransferError"){
          alert("Insufficient balance for this transaction")
         }
         else{
        // alert(JSON.stringify(json))
       
        Alert.alert(
          "Commit Transaction?",
          "Fee will be " + json.transaction_build.fee.value/1000000000000000000 + " XRD\n for a tranfer of "+amount+" "+symbol+"\n\nDo you want to commit this transaction?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => submitTxn(json.transaction_build.payload_to_sign, json.transaction_build.unsigned_transaction, public_key, privKey_enc, setShow, setTxHash) }
          ]
        );

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
        
         Keyboard.dismiss; 
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
 
  const { xrdLiquidBalance, defaultSymbol, balancesMap, sourceXrdAddr } = route.params;
  console.log("Default symbol: "+defaultSymbol)
  const [privKey_enc, setPrivKey_enc] = useState();
  const [public_key, setPublic_key] = useState();
  const [destAddr, onChangeDestAddr] = useState();
  const [amount, onChangeAmount] = useState(null);
  const [symbol, onChangeSymbol] = useState(defaultSymbol);
  const [txnHash, setTxHash] = useState(null);
  const [show, setShow] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(false);
  const [symbols, setSymbols] = useState([defaultSymbol]);
  const [rri, setRRI] = useState();

 
  var reverseTokenMetadataMap = new Map();
  

  useEffect( () => {

    var symbolsTemp = [];
    var currentValTemp = null;
    var currentSymbolTemp="";
    var rriTemp="";

    balancesMap.forEach((balance, rri) => {
  
    // alert("Send: "+balance[1] + "rri: "+rri)
 
    symbolsTemp.push(balance[1])
    reverseTokenMetadataMap.set(balance[1], rri);
    

    if(balance[1] == symbol && symbol!="XRD"){
      currentValTemp = balance[0];
      currentSymbolTemp = balance[1];
      rriTemp=rri;
    } else if(balance[1] == "XRD"){
      currentValTemp = xrdLiquidBalance;
      currentSymbolTemp = balance[1];
      rriTemp=rri;
    }
  });

  setCurrentBalance(currentValTemp);
  setSymbols(symbolsTemp);
  onChangeSymbol(currentSymbolTemp);
  setRRI(rriTemp);
  
},[symbol]);


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

  onSuccess = e => {
    onChangeDestAddr(e.data);
    setCameraOn(false);
  };

  console.log(symbols)

  const addrFromRef = useRef();
  const addrToRef = useRef();
  const amountRef = useRef();


 return ( 
   <View style={styles.container}>
     <ScrollView> 

     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Address you are sending from:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={addrFromRef}
        style={{padding:10, borderWidth:StyleSheet.hairlineWidth, height:50, width:300, backgroundColor:"#d3d3d3", flex:1}}
        disabled="true"
        multiline={true}
        numberOfLines={4}
        autoCapitalize='none'
        placeholder='Radix Address sending from'
        value={sourceXrdAddr}
        // onChangeText={value => onChangeXrdAddr(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>
 
      { cameraOn &&
      <QRCodeScanner
      cameraStyle={{width:'auto', height:200}}
        onRead={this.onSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
      />
      }
<View style={styles.sendRowStyle}>
      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12, flex:1}}>{"\n"}Address to send to:</Text>
      <TouchableOpacity style={{justifyContent:'center'}} onPress={() => {setCameraOn(!cameraOn)} }>
      <Text style={{ textAlign:'center', marginHorizontal: 0, fontSize:8}}>Scan QR</Text>
  
 <IconMaterial style={{justifyContent:'center', alignSelf:'center'}} name="qrcode-scan" size={20} color="black" />
 </TouchableOpacity>
 </View>

      <View style={styles.rowStyle}>

<TextInput ref={addrToRef}
style={{padding:10, borderWidth:StyleSheet.hairlineWidth, flex:1}}
        placeholder='Destination Radix Address'
        placeholderTextColor="#d3d3d3"
        value={destAddr}
        onChangeText={value => onChangeDestAddr(value)}
        autoCapitalize='none'
        multiline={true}
        numberOfLines={4}
        // value="rdx1qsp3xmjp8q7jr6yeqluaqs9dhl7fr9qvfkrq6mpp3kk7rdtdhftunggghslzh"
      />
       <Separator/>

</View>

<Separator/>

<Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Amount to send:</Text>
<View style={styles.rowStyle}>
<TextInput ref={amountRef}
        style={{padding:10, borderWidth:StyleSheet.hairlineWidth, flex:1}}
        placeholder='Amount'
        autoCapitalize='none'
        placeholderTextColor="#d3d3d3"
         value={amount}
        onChangeText={value => onChangeAmount(value)}
      />

<SelectDropdown
 buttonStyle={{backgroundColor:"#183A81", flex:0.5, borderWidth:StyleSheet.hairlineWidth, marginRight:10}}
 buttonTextStyle={{color:"white"}}
	data={symbols}
  defaultValue={symbol}
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
<Text style={{fontSize: 12, color:"black"}}>Current liquid balance: {Number(currentBalance/1000000000000000000).toLocaleString()} {symbol}</Text>



<Separator/>
<Separator/>
<Separator/>
<TouchableOpacity style={styles.button} onPress={() => {addrFromRef.current.blur();addrToRef.current.blur();amountRef.current.blur();buildTxn(rri, sourceXrdAddr, destAddr, symbol, amount, public_key, privKey_enc, setShow, setTxHash)}}>
        <View style={styles.sendRowStyle}>
        <IconFeather name="send" size={20} color="black" />
        <Text style={{fontSize: 18, color:"black"}}> Send</Text>
        </View>
        </TouchableOpacity>
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


  </ScrollView>
  </View>)
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 25,
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
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical:5
  },
  sendRowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical:0
  },
});

export default Send;
