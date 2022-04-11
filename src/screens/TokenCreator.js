import React, {useState, useRef, useEffect} from 'react';
import { Keyboard, TouchableOpacity, Linking, Alert, ScrollView, Image, Text, TextInput, View, StyleSheet } from 'react-native';
import { decrypt } from '../helpers/encryption';
var SQLite = require('react-native-sqlite-storage');
import IconFA5 from 'react-native-vector-icons/FontAwesome5';
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
import RadioForm from 'react-native-simple-radio-button';
var GenericToken = require("../assets/generic_token.png");
import { Separator } from '../helpers/jsxlib';
import { getAppFont, useInterval, openCB, errorCB, formatNumForDisplay, setNewGatewayIdx } from '../helpers/helpers';
var bigDecimal = require('js-big-decimal');
import prompt from 'react-native-prompt-android';
import AsyncStorage from '@react-native-async-storage/async-storage';


var radio_props = [
  {label: 'Yes', value: true },
  {label: 'No', value: false }
];


function startTxn(gatewayIdx, public_key, privKey_enc, setShow, setTxHash, sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, tknGranularity ){
 
  if(tknSupply != undefined){
    tknSupply = tknSupply.replace(/,/g, '');
  }

  if(privKey_enc == "HARDWARE_WALLET"){
    alert("Minting tokens from a hardware wallet is currently not allowed.")
  }
  else if(tknName == undefined || tknDesc  == undefined || tknIconUrl == undefined || tknUrl == undefined || 
     tknSymbol == undefined || tknIsSuppMut == undefined || tknSupply == undefined || tknGranularity == undefined){
       alert("All fields are required")
     }
  else if( isNaN(tknSupply) ){
    alert("Token supply must be a number")
  } else if ( 
    
    !((tknIconUrl.startsWith('http://') || tknIconUrl.startsWith('https://')) && (tknUrl.startsWith('http://') || tknUrl.startsWith('https://')))
  
  ){
    alert("URLs must start with http:// or https://")
  }

  else if((!(tknIconUrl==undefined) && !(tknUrl==undefined)) && tknIconUrl.replace('http://',"").replace('https://',"").length==0){
      alert("URL part after http(s):// must not be empty")
    }

  else if(tknUrl.replace('http://',"").replace('https://',"").length==0){
      alert("URL part after http(s):// must not be empty")
  } else {
  var rri=""
  fetch(global.gateways[gatewayIdx] + '/token/derive', {
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

        if(json.code == 400 || json.code == 500){
          alert(JSON.stringify(json.message));
         }
         else{

        rri = JSON.stringify(json.token_identifier.rri).replace(/["']/g, "")

        buildTxn(gatewayIdx, public_key, privKey_enc, setShow, setTxHash, sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, rri, tknGranularity )
        }
      }).catch((error) => {
        console.error(error);
        setNewGatewayIdx(gatewayIdx);
      });
    }
}

function buildTxn(gatewayIdx, public_key, privKey_enc, setShow, setTxHash,sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, rri, tknGranularity ){

  var tknSupplyStr = new bigDecimal(tknSupply).multiply(new bigDecimal(1000000000000000000)).getValue();

var jsonBody = {
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
};


  fetch(global.gateways[gatewayIdx] + '/transaction/build', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          jsonBody
        )
      }).then((response) => response.json()).then((json) => {
        
         if(json.code == 400 || json.code == 500){
          alert(JSON.stringify(json.message));
         }
         else{
       
        Alert.alert(
          "Commit Transaction?",
          "Fee will be " + formatNumForDisplay(json.transaction_build.fee.value) + "\n\nDo you want to commit this transaction?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => submitTxn(gatewayIdx, json.transaction_build.payload_to_sign, json.transaction_build.unsigned_transaction, public_key, privKey_enc, setShow, setTxHash) }
          ]
        );

        }
      }).catch((error) => {
        console.error(error);
        setNewGatewayIdx(gatewayIdx);
      });
}


function submitTxn(gatewayIdx, message,unsigned_transaction,public_key,privKey_enc, setShow, setTxHash){

  setShow(false);

  var passwordStr = ""
  var promptFunc = null
  
  if(Platform.OS === 'ios'){
    promptFunc = Alert.prompt;
  } else{
    promptFunc = prompt
  }

  promptFunc(
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
  signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(message,'hex')), Uint8Array.from(privatekey))


  var result=new Uint8Array(72);
  secp256k1.signatureExport(signature.signature,result);
  
  var finalSig = Buffer.from(result).toString('hex');
  
    fetch(global.gateways[gatewayIdx] + '/transaction/finalize', {
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
          setNewGatewayIdx(gatewayIdx);
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
 
  const [privKey_enc, setPrivKey_enc] = useState();
  const [public_key, setPublic_key] = useState();
  const [sourceXrdAddr, setSourceXrdAddr] = useState();
  const [tknName, settknName] = useState();
  const [tknDesc, settknDesc] = useState();
  const [tknIconUrl, settknIconUrl] = useState('http://');
  const [tknUrl, settknUrl] = useState('http://');
  const [tknSymbol, settknSymbol] = useState();
  const [tknIsSuppMut, settknIsSuppMut] = useState(false);
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

  const tknNameRef = useRef();
  const tknDescRef = useRef();
  const tknSymbolRef = useRef();
  const tknIconURLRef = useRef();
  const tknURLRef = useRef();
  const tknSupplyRef = useRef();

 return ( 
  <ScrollView style={styles.scrollView}>
     <View style={styles.container} > 

     {/* <Image style={{margin: 0, width: 85, height: 85, alignSelf:'center'}}
    source={GenericToken}
      /> */}
    
      {/* <Separator/> */}
     <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Token Name:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={tknNameRef}
        style={[{padding:4, paddingLeft:10, borderWidth:1, height:30, width:300, backgroundColor:"white", flex:1, borderRadius: 15,}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Name'
        placeholderTextColor="#d3d3d3"
        value={tknName}
        maxLength={199}
        onChangeText={value => settknName(value)}
      />
      </View>
      <Separator/>
 
      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Token Description</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={tknDescRef}
        style={[{padding:4, paddingLeft:10, borderWidth:1,  height: 125, width:300, backgroundColor:"white", flex:1, borderRadius: 15, textAlignVertical: 'top'}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        multiline={true}
        numberOfLines={5}
        maxLength={255}
        placeholder='Token Description'
        placeholderTextColor="#d3d3d3"
        value={tknDesc}
        onChangeText={value => settknDesc(value)}
      />
      </View>
      <Separator/>

      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Token Symbol (must be lowercase and alphanumeric)</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={tknSymbolRef}
        style={[{padding:4, paddingLeft:10, borderWidth:1, height:30, width:50, backgroundColor:"white", flex:0.33, borderRadius: 15,}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Symbol'
        placeholderTextColor="#d3d3d3"
        value={tknSymbol}
        onChangeText={value => settknSymbol(value.toLowerCase())}
      />
      </View>
      <Separator/>


      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Token Icon URL (must begin with http:// or https://)</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={tknIconURLRef}
        style={[{padding:4, paddingLeft:10, borderWidth:1, height:30, width:300, backgroundColor:"white", flex:1, borderRadius: 15,}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Icon URL'
        placeholderTextColor="#d3d3d3"
        value={tknIconUrl}
        onChangeText={value => settknIconUrl(value)}
      />
      </View>
      <Separator/>

      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Project URL (must begin with http:// or https://)</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={tknURLRef}
        style={[{padding:4, paddingLeft:10, borderWidth:1, height:30, width:300, backgroundColor:"white", flex:1, borderRadius: 15,}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        placeholder='Project URL'
        placeholderTextColor="#d3d3d3"
        value={tknUrl}
        onChangeText={value => settknUrl(value)}
      />
      </View>
      {/* <Separator/>



      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Make supply mutable?</Text>
      <View style={styles.rowStyle}>
 
     <RadioForm 
          radio_props={radio_props}
          onPress={(value) => settknIsSuppMut(value)}
          formHorizontal={false}
          value={tknIsSuppMut}
          selectedButtonColor="black"
          buttonColor="black"
          buttonInnerColor="black"
          buttonOuterColor="black"
          buttonSize={10}
          buttonOuterSize={20}
          buttonWrapStyle={{marginLeft: 0}}
        /> 
</View>*/}

<Separator/>

      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Token Supply (must be a number)</Text>
     <View style={styles.rowStyle}>
        <TextInput ref={tknSupplyRef}
        style={[{padding:4, paddingLeft:10, borderWidth:1, height:30, width:300, backgroundColor:"white", flex:1, borderRadius: 15,}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        placeholder='Token Supply'
        placeholderTextColor="#d3d3d3"
        value={tknSupply}
        onChangeText={value => {

          var cleanedVal = value.replace(/^0+/, '').replace(/,/g, '');
          
          if(!isNaN(cleanedVal)){
           settknSupply(new bigDecimal(cleanedVal).getPrettyValue())
          } else{
            settknSupply(value);
          }
         }
       }
      />
     </View>
     <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>NOTE: Fixed supply only. Setting a mutable supply is not yet supported.</Text>
  
      <Separator/>
      <Separator/>
      <Separator/>
<TouchableOpacity style={styles.button} onPress={() => {
     tknNameRef.current.blur();
     tknDescRef.current.blur();
     tknSymbolRef.current.blur();
     tknIconURLRef.current.blur();
     tknURLRef.current.blur();
     tknSupplyRef.current.blur();
     Keyboard.dismiss;
     AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
      startTxn(gatewayIdx, public_key, privKey_enc, setShow, setTxHash,sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, tknGranularity )
     }
     )}
 }>
 
        <View style={[styles.sendRowStyle]}>
        <View style ={[styles.sendRowStyle,{borderWidth:1, borderRadius:15, padding: 10, backgroundColor:"#183A81"}]}>
        <IconFA5 name="coins" size={20} color="white" />
        <Text style={{fontSize: 18}, getAppFont("white")}> Mint Tokens</Text>
        </View>
        </View>
        </TouchableOpacity>
              <Separator/>
{ show == true &&
<Text
       style={[{textAlign: "center"}, getAppFont("blue")]}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/transactions/'+txnHash)}}
     >
       Transaction has been submitted.{"\n\n"}Transaction hash is: {txnHash}{"\n\n"}Click here for transaction details. Refresh page if transaction does not immediately display.
     </Text>
 }

    <Separator/>
    <Separator/>
    <Separator/>
    <Separator/>
    <Separator/>
    <Separator/>
    <Separator/>
    <Separator/>
    <Separator/>
    <Separator/>
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
