import React, {useState, useRef, useEffect} from 'react';
import { TouchableOpacity, Linking, Alert, ScrollView, Image, Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
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
import IconFA5 from 'react-native-vector-icons/FontAwesome5';
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
var Poof = require("../assets/poof.png");

const Separator = () => (
  <View style={styles.separator} />
);

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


var radio_props = [
  {label: 'Yes', value: true },
  {label: 'No', value: false }
];

function errorCB(err) {
  console.log("SQL Error: " + err.message);
}

function openCB() {
  console.log("Database OPENED");
}

function startTxn(public_key, privKey_enc, setShow, setTxHash, sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, tknGranularity ){
  //  settknName, settknDesc,settknIconUrl, settknUrl, settknSymbol, settknIsSuppMut, settknSupply, settknRRI, 

  if( isNaN(tknSupply) ){
    alert("Token supply must be a number")
  } else if (
    
    !((tknIconUrl.startsWith('http://') || tknIconUrl.startsWith('https://')) && (tknUrl.startsWith('http://') || tknUrl.startsWith('https://')))
  
  ){
    alert("URLs must start with http:// or https://")
  }

  else if(tknIconUrl.replace('http://',"").replace('https://',"").length==0){
      alert("URL part after http(s):// must not be empty")
    }

  else if(tknUrl.replace('http://',"").replace('https://',"").length==0){
      alert("URL part after http(s):// must not be empty")
  } else {
  var rri=""
  // alert("src addr: "+sourceXrdAddr+" dest: "+xrdAddr+ " token rri: "+reverseTokenMetadataMap.get(symbol) + " amount "+amountStr)
  fetch('https://mainnet-gateway.radixdlt.com/token/derive', {
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
            "public_key": {
              "hex": public_key
            },
            "symbol": tknSymbol
          }
        )
      }).then((response) => response.json()).then((json) => {
        //  alert(JSON.stringify(json))
         
        if(json.code == 400 || json.code == 500){
          alert(JSON.stringify(json.message));
         }
         else{
        // alert(JSON.stringify(json))
        rri = JSON.stringify(json.token_identifier.rri).replace(/["']/g, "")
        // alert(rri)
        buildTxn(public_key, privKey_enc, setShow, setTxHash, sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, rri, tknGranularity )
        }
      }).catch((error) => {
          console.error(error);
      });
    }
}

function buildTxn(public_key, privKey_enc, setShow, setTxHash,sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, rri, tknGranularity ){
//  settknName, settknDesc,settknIconUrl, settknUrl, settknSymbol, settknIsSuppMut, settknSupply, settknRRI, 

var tknSupplyStr = (tknSupply * 1000000000000000000).toString();

// alert(sourceXrdAddr+" "+ tknName+" "+  tknDesc+" "+ tknIconUrl+" "+  tknUrl+" "+  tknSymbol+" "+ tknIsSuppMut+" "+ tknSupply+" "+  rri)
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
                "type": "CreateTokenDefinition",
                "token_properties": {
                  "name": tknName,
                  "description": tknDesc,
                  "icon_url": tknIconUrl,
                  "url": tknUrl,
                  "symbol": tknSymbol,
                  "is_supply_mutable": tknIsSuppMut,
                  "granularity": tknGranularity,
                  "owner": {
                    "address": sourceXrdAddr
                  }
                },
                "token_supply": {
                  "value": tknSupplyStr,
                  "token_identifier": {
                    "rri": rri
                  }
                },
                "to_account": {
                  "address": sourceXrdAddr
                }
              }
            ],
            "fee_payer": {
              "address": sourceXrdAddr
            }
          } 
      
        )
      }).then((response) => response.json()).then((json) => {
        //  alert(JSON.stringify(json))
         
         if(json.code == 400 || json.code == 500){
          alert(JSON.stringify(json.message));
         }
         else{
        // alert(JSON.stringify(json))
       
        Alert.alert(
          "Commit Transaction?",
          "Fee will be " + json.transaction_build.fee.value/1000000000000000000 + "\n\nDo you want to commit this transaction?",
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












 const TokenCreator = ({route, navigation}) => {
 
  // const { defaultSymbol, balancesMap, sourceXrdAddr, tokenMetadataObj } = route.params;

  const [privKey_enc, setPrivKey_enc] = useState();
  const [public_key, setPublic_key] = useState();
  const [sourceXrdAddr, setSourceXrdAddr] = useState();
  const [tknName, settknName] = useState();
    const [tknDesc, settknDesc] = useState();
      const [tknIconUrl, settknIconUrl] = useState();
        const [tknUrl, settknUrl] = useState();
          const [tknSymbol, settknSymbol] = useState();
            const [tknIsSuppMut, settknIsSuppMut] = useState();
              const [tknSupply, settknSupply] = useState();
                const [txnHash, setTxHash] = useState(null);
                const [show, setShow] = useState(false);
                const [tknGranularity, settknGranularity] = useState(1);

                
              
              


  var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);
 
  useInterval(() => {

  db.transaction((tx) => {
    tx.executeSql("SELECT address.radix_address,address.privatekey_enc, address.publickey FROM address INNER JOIN active_address ON address.id=active_address.id", [], (tx, results) => {
      var len = results.rows.length;
      var tempPrivkey_enc = "default_val";
      var tempPubkey = "default_val";
      var radix_addr = "default_val";
      
        for (let i = 0; i < len; i++) {
            let row = results.rows.item(i);
            tempPrivkey_enc = row.privatekey_enc;
            tempPubkey = row.publickey;
            radix_addr = row.radix_address
        }

        setPrivKey_enc(tempPrivkey_enc);
        setPublic_key(tempPubkey);
        setSourceXrdAddr(radix_addr);

      });
    }, errorCB);


  }, 5000);


 return ( 
  <ScrollView style={styles.scrollView}>
     <View style={styles.container} > 
     <Image style={{width: 100, height: 100, alignSelf:'center'}}
    source={Poof}
      />
      <Separator/>
      <Separator/>
     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Token Name:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Name'
        value={tknName}
        maxLength={199}
        onChangeText={value => settknName(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>
 
      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Token Description</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth,  height: 125, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        multiline={true}
        numberOfLines={5}
        maxLength={255}
        placeholder='Token Description'
        value={tknDesc}
        onChangeText={value => settknDesc(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>

      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Token Symbol (must be lowercase and alphanumeric)</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:50, backgroundColor:"white", flex:0.33}}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Symbol'
        value={tknSymbol}
        onChangeText={value => settknSymbol(value.toLowerCase())}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>


      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Token Icon URL (must begin with http:// or https://)</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Icon URL'
        value={tknIconUrl}
        onChangeText={value => settknIconUrl(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>

      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Project URL (must begin with http:// or https://)</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        placeholder='Project URL'
        value={tknUrl}
        onChangeText={value => settknUrl(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>


      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Token Supply</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Supply'
        value={tknSupply}
        onChangeText={value => settknSupply(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>
      <Separator/>


      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Make supply mutable?</Text>
      <View style={styles.rowStyle}>
 
     <RadioForm
          radio_props={radio_props}
          initial={true}
          onPress={(value) => settknIsSuppMut(value)}
          formHorizontal={false}
          selectedButtonColor="black"
          buttonColor="black"
          buttonInnerColor="black"
          buttonOuterColor="black"
          buttonSize={10}
          buttonOuterSize={20}
          buttonWrapStyle={{marginLeft: 0}}
        />
</View>
      <Separator/>

      {/* <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Token Granularity</Text>
     <View style={styles.rowStyle}>
 
        <TextInput
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Granularity'
        value={tknGranularity}
        onChangeText={value => settknGranularity(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View> 
 <Separator/> */}

<TouchableOpacity style={styles.button} onPress={() => startTxn(public_key, privKey_enc, setShow, setTxHash,sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, tknGranularity )}>
        <View style={styles.sendRowStyle}>
        <IconFA5 name="coins" size={20} color="black" />
        <Text style={{fontSize: 18, color:"black"}}> Mint Tokens</Text>
        </View>
        </TouchableOpacity>
              <Separator/>
              <Separator/>
              {/* <Text>Fee: {fee/1000000000000000000} XRD</Text>
              <Text>Priv Key Enc: {privKey_enc}</Text>
              <Text>Pub Key : {public_key}</Text> */}

<Separator/>
<Separator/>
{ show == true &&
<Text
       style={{color: 'blue', textAlign: "center"}}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/transactions/'+txnHash)}}
     >
       Transaction has been submitted.{"\n\n"}Transaction hash is: {txnHash}{"\n\n"}Click here for transaction details. Refresh page if transaction does not immediately display.
     </Text>
 }

<Separator/>
<Separator/>
  </View>
  
  </ScrollView>
  )
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

export default TokenCreator;
