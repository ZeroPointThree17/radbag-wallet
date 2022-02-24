import React, {useState, useEffect, useRef} from 'react';
import { Keyboard, Image,ImageBackground, TouchableOpacity, Linking, Alert, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { decrypt } from '../helpers/encryption';
var SQLite = require('react-native-sqlite-storage');
import SelectDropdown from 'react-native-select-dropdown'
import IconFeather from 'react-native-vector-icons/Feather';
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { Separator } from '../helpers/jsxlib';
import { getAppFont, openCB, errorCB, useInterval, shortenAddress, last4, formatNumForDisplay } from '../helpers/helpers';
import { isElementAccessExpression, validateLocaleAndSetLanguage } from 'typescript';
var bigDecimal = require('js-big-decimal');
var GenericToken = require("../assets/generic_token.png");
import * as Progress from 'react-native-progress';
import prompt from 'react-native-prompt-android';
import { APDUGetPublicKeyInput, RadixAPDU } from '../helpers/apdu'
import TransportHid from '@ledgerhq/react-native-hid';
import { HDPathRadix } from '@radixdlt/crypto'
import { from, Observable, of, Subject, Subscription, throwError } from 'rxjs'
import { Transaction } from '@radixdlt/tx-parser'
import { InstructionT } from '@radixdlt/tx-parser'
import {
	GetPublicKeyInput,
	HardwareSigningKeyT,
	HardwareWalletT,
	HardwareWalletWithoutSK,
	KeyExchangeInput,
	path000H,
	SemVerT,
	SignHashInput,
	SemVer,
	signingKeyWithHardWareWallet,
	SignTransactionInput,
	SignTXOutput,
} from '@radixdlt/hardware-wallet'
import { log, BufferReader } from '@radixdlt/util'


const parseSignatureFromLedger = (
  buf,
) => {
  // Response `buf`: pub_key_len (1) || pub_key (var) || chain_code_len (1) || chain_code (var)
  const bufferReader = BufferReader.create(buf)

  const signatureDERlengthResult = bufferReader.readNextBuffer(1)
  if (signatureDERlengthResult.isErr()) {
    const errMsg = `Failed to parse length of signature from response buffer: ${msgFromError(
      signatureDERlengthResult.error,
    )}`
    log.error(errMsg)
    return err(hardwareError(errMsg))
  }
  const signatureDERlength = signatureDERlengthResult.value.readUIntBE(
    0,
    1,
  )
  const signatureDERBytesResult = bufferReader.readNextBuffer(
    signatureDERlength,
  )

  if (signatureDERBytesResult.isErr()) {
    const errMsg = `Failed to parse Signature DER bytes from response buffer: ${msgFromError(
      signatureDERBytesResult.error,
    )}`
    log.error(errMsg)
    return err(hardwareError(errMsg))
  }
  const signatureDERBytes = signatureDERBytesResult.value

  // We ignore remaining bytes, being: `Signature.V (1)`

  return Signature.fromDER(signatureDERBytes).map(signature => ({
    signature,
    remainingBytes: bufferReader.remainingBytes(),
  }))
}


function buildTxn(rri, sourceXrdAddr, destAddr, symbol, amount, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW){

  Keyboard.dismiss; 

  if (amount != undefined){
    amount = amount.replace(/,/g, '');
  }

  // alert(rri)
  if(destAddr == undefined || destAddr.length==0){
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

  var xrdAddr = destAddr.trim();
  var amountStr = new bigDecimal(amount).multiply(new bigDecimal(1000000000000000000)).getValue();


  // alert("src addr: "+sourceXrdAddr+" dest: "+xrdAddr+ " token rri: "+reverseTokenMetadataMap.get(symbol) + " amount "+amountStr)
  fetch('https://raddish-node.com:6208/transaction/build', {
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
                  // "address": xrdAddr
                  "address": "rdx1qsp75a9gj0uy477kgrzn2y5derv5fa9ce5gf5ar2fs4tkm6vr7q5gugnnw9me"
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
         if(json.code == 400 && json.message == "Account address is invalid"){
           alert("You've entered an invalid address")
         }
         else if(json.code == 400 && json.details.type == "NotEnoughTokensForTransferError"){
          alert("Insufficient balance for this transaction")
         }
         else if(json.code == 400 || json.code == 500){
          alert(json.message)
         }
         else{
       
        Alert.alert(
          "Commit Transaction?",
          "Fee will be " + formatNumForDisplay(json.transaction_build.fee.value) + " XRD\n for a tranfer of "+amount+" "+symbol+" to "+shortenAddress(xrdAddr)+"\n\nDo you want to commit this transaction?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => submitTxn(json.transaction_build.payload_to_sign, json.transaction_build.unsigned_transaction, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW) }
          ]
        );

        }
      }).catch((error) => {
          console.error(error);
      });
}

}


// async function submitTxn(){


  function transport_send(transport, apdus){

    var currApdu = apdus.shift();
    if(apdus.length == 0){
      transport.send(currApdu.cla, currApdu.ins, currApdu.p1, currApdu.p2, currApdu.data, currApdu.requiredResponseStatusCodeFromDevice).then((result) => {
        
        console.log("INSIDE RESULTS: "+result.toString('hex'))
        const parsedResult = parseSignatureFromLedger(result)
        console.log("INSIDE RESULTS2")
        const signature = parsedResult.value.signature
        console.log("INSIDE RESULTS3")
        const remainingBytes = parsedResult.value.remainingBytes
        console.log("INSIDE RESULTS4")
        const signatureV = remainingBytes.readUInt8(0)
        console.log("INSIDE RESULTS5")
        console.log(`Signature: ${signature}`)
        console.log(`Signature V: ${signatureV}`)
        alert(`Signature: ${signature}`)
        alert(`Signature V: ${signatureV}`)

        
        var finalSig = signature;
      })
    } else{
       transport.send(currApdu.cla, currApdu.ins, currApdu.p1, currApdu.p2, currApdu.data, currApdu.requiredResponseStatusCodeFromDevice).then((result) => {
        transport_send(transport, apdus)
      })
    }
  }
  

  export const submitTxn = async (
    message,unsigned_transaction,public_key,privKey_enc, setShow, setTxHash, hdpathIndex, isHW
  
  ) => {
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

    var finalSig = ""
    // alert("IS HARDWARE: " +isHW)

    if(isHW){
      // alert("IN hw wallet LOGIC. HDPATH IDX: "+hdpathIndex)
      const hdpath = HDPathRadix.create({ address: { index: hdpathIndex, isHardened: true } });
      // alert("AFTER HD CREATE: " + hdpath)
      // var signAPDURequest = RadixAPDU.doSignHash({
      //   path: hdpath,
      //   hashToSign: unsigned_transaction,
      // })

      const transactionRes = Transaction.fromBuffer(
        Buffer.from(unsigned_transaction, 'hex'),
      )
      if (transactionRes.isErr()) {
        const errMsg = `Failed to parse tx, underlying error: ${msgFromError(
          transactionRes.error,
        )}`
        log.error(errMsg)
        return throwError(() => hardwareError(errMsg))
      }
      const transaction = transactionRes.value
      const instructions = transaction.instructions
      const numberOfInstructions = instructions.length
  
      alert("numberOfInstructions: "+numberOfInstructions)

     var apdu1 =  RadixAPDU.signTX.initialSetup({
        path: hdpath,
        txByteCount: unsigned_transaction.length / 2, // 2 hex chars per byte
        numberOfInstructions,
        // nonNativeTokenRriHRP: input.nonXrdHRP,
    })

   

      // alert(signAPDURequest.cla + " " + signAPDURequest.ins + " " + signAPDURequest.p1 + " " + signAPDURequest.p2 + " " + signAPDURequest.data)
      TransportHid.list().then((devices) => {


      if (!devices[0]) {
        alert("No device found.")
        // throw new Error('No device found.')
      } else {
        alert("BEFORE TRANSPORT CREATE")
        TransportHid.create().then((transport) => {
          alert("AFTER TRANSPORT CREATE")
          transport.send(apdu1.cla, apdu1.ins, apdu1.p1, apdu1.p2, apdu1.data, apdu1.requiredResponseStatusCodeFromDevice).then((result0) => {
  

            var apdus = []
      while( instructions.length > 0){

            const instructionToSend = instructions.shift() // "pop first"

            const instructionBytes = instructionToSend.toBuffer();

            const displayInstructionContentsOnLedgerDevice = true
            const displayTXSummaryOnLedgerDevice = true

            var apdu2 =  RadixAPDU.signTX.singleInstruction({
              instructionBytes,
              isLastInstruction: instructions.length==0?true:false,
              displayInstructionContentsOnLedgerDevice,
              displayTXSummaryOnLedgerDevice,
            })
            apdus.push(apdu2)
          }
            

            transport_send(transport, apdus);

      // }
        })
        })
      }
    })


      // expected output: "Success!"

      // signAPDURequest.
  } else{

    var signature = "";
  var privatekey = new Uint8Array(decrypt(privKey_enc, Buffer.from(password)).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(message,'hex')), Uint8Array.from(privatekey))


  var result=new Uint8Array(72);
  secp256k1.signatureExport(signature.signature,result);


   finalSig = Buffer.from(result).toString('hex');
  
}
  

    fetch('https://raddish-node.com:6208/transaction/finalize', {
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


function getTokenSymbols(setGettingBalances, rris, inputSymbols, inputSymToRRIs, setSymbols, setSymbolToRRI,setPrivKey_enc,setPublic_key,initialIconsMap,setIconURIs, initialNamesMap, setTokenNames, symbolCnts, appendStr){

  var rri = rris.shift();
  var symbolsArr = inputSymbols.slice();
  var symbolToRRI = new Map(inputSymToRRIs);
  var iconsMap = new Map(initialIconsMap);
  var namesMap = new Map(initialNamesMap);
  var updatedSymbolCnts = new Map(symbolCnts);

  fetch('https://raddish-node.com:6208/token', {
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
            "token_identifier": {
              "rri": rri
            }
          }    
  
    )
  }).then((response) => response.json()).then((json) => {

    if(json.token != undefined){
 
        var symbol = json.token.token_properties.symbol.toUpperCase();
        var localSymbol = json.token.token_properties.symbol.toUpperCase();

        if(updatedSymbolCnts.get(symbol) != undefined){     
          // alert(updatedSymbolCnts.get(symbol))  
          updatedSymbolCnts.set(symbol, updatedSymbolCnts.get(symbol)+1);
          
            // alert(updatedSymbolCnts.get(symbol))  

          for(var cnt = 0; cnt < parseInt(updatedSymbolCnts.get(symbol)); cnt++){
            // alert(cnt)

            if(Platform.OS === 'ios'){
              localSymbol = localSymbol + " ";
            } else{
              localSymbol = " " + localSymbol + " ";
            }

          }

          //  alert(symbol)
        } else{
          updatedSymbolCnts.set(symbol,1);
        }

        if(rri != "xrd_rr1qy5wfsfh"){
          symbolsArr.push(localSymbol)
        }

        symbolToRRI.set(localSymbol, rri);
        iconsMap.set(rri, json.token.token_properties.icon_url); 
        namesMap.set(rri, json.token.token_properties.name)     
    }

    if(rris.length == 0){

        setSymbols(symbolsArr);
        setSymbolToRRI(symbolToRRI);
        setIconURIs(iconsMap);
        setTokenNames(namesMap)
   
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
                      setGettingBalances(false);
                    });
                  }, errorCB);
                }
              
              else{
                getTokenSymbols(setGettingBalances,rris, symbolsArr, symbolToRRI, setSymbols, setSymbolToRRI,setPrivKey_enc,setPublic_key,iconsMap,setIconURIs, namesMap, setTokenNames, updatedSymbolCnts, appendStr)
              }
            }
              ).catch((error) => {
                  console.error(error);
              });
          
}


function getBalances(firstTime, setGettingBalances, sourceXrdAddr, setSymbols, setSymbolToRRI, setBalances,setPrivKey_enc,setPublic_key, setIconURIs, setTokenNames){
   
  setGettingBalances(firstTime);

  fetch('https://raddish-node.com:6208/account/balances', {
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
            "account_identifier": {
              "address": sourceXrdAddr
            }
          }      
    
      )
    }).then((response) => response.json()).then((json) => {

      // alert("Get Balances call: "+JSON.stringify(json));
      
        if(!(json === undefined) && json.code != 400 && json.ledger_state.epoch > 0 ){

          var balances = new Map();
          var rris = ["xrd_rr1qy5wfsfh"]
          var symbols = ["XRD"]
 
          json.account_balances.liquid_balances.forEach( (balance) =>{

              balances.set(balance.token_identifier.rri, balance.value);       
              rris.push(balance.token_identifier.rri)
              
          } );

        setBalances(balances);

         var initialSymbolToRRIMap = new Map();
         initialSymbolToRRIMap.set("XRD","xrd_rr1qy5wfsfh")

         var initialIconsMap = new Map();
         initialIconsMap.set("xrd_rr1qy5wfsfh", "https://assets.radixdlt.com/icons/icon-xrd-32x32.png")

         var initialNamesMap = new Map();
         initialNamesMap.set("xrd_rr1qy5wfsfh", "Radix")

         var initialTokenCnts = new Map();
         initialNamesMap.set("XRD", 1)

        var appendStr = "";

         getTokenSymbols(setGettingBalances, rris, symbols, initialSymbolToRRIMap, setSymbols, setSymbolToRRI,setPrivKey_enc,setPublic_key, initialIconsMap, setIconURIs, initialNamesMap, setTokenNames, initialTokenCnts, appendStr)
        }
    }).catch((error) => {
        console.error(error);
    });

  }



 const Send = ({route, navigation}) => {
 
  const { defaultSymbol, sourceXrdAddr, hdpathIndex, isHW } = route.params;
  const [privKey_enc, setPrivKey_enc] = useState();
  const [public_key, setPublic_key] = useState();
  const [destAddr, onChangeDestAddr] = useState();
  const [amount, onChangeAmount] = useState(null);
  const [symbol, onChangeSymbol] = useState(defaultSymbol);
  const [txnHash, setTxHash] = useState(null);
  const [show, setShow] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  // const [currentBalance, setCurrentBalance] = useState(false);
  const [symbols, setSymbols] = useState([]);
  // const [rri, setRRI] = useState();
  const [balances, setBalances] = useState(new Map());
  const [symbolToRRI, setSymbolToRRI] = useState(new Map());
  const [iconURIs, setIconURIs] = useState(new Map());
  const [tokenNames, setTokenNames] = useState(new Map());
  const [gettingBalances, setGettingBalances] = useState();


  useEffect( () => {
    // var symbolsTemp = [];
    // var currentValTemp = null;
    // var currentSymbolTemp="";
    // var rriTemp="";

  
    getBalances(true, setGettingBalances,sourceXrdAddr, setSymbols, setSymbolToRRI, setBalances,setPrivKey_enc,setPublic_key, setIconURIs, setTokenNames);
   
    // onChangeSymbol(currentSymbolTemp);
  
},[]);

useInterval(() => {
  getBalances(false, setGettingBalances,sourceXrdAddr, setSymbols, setSymbolToRRI, setBalances,setPrivKey_enc,setPublic_key, setIconURIs, setTokenNames);
}, 3500);


// alert(defaultSymbol)
  onSuccess = e => {
    onChangeDestAddr(e.data);
    setCameraOn(false);
  };

  console.log(symbols)

  const addrFromRef = useRef();
  const addrToRef = useRef();
  const amountRef = useRef();
  const [error, setError]=useState(false);

 return ( 
   <View style={styles.container}>
     <ScrollView> 

<View style={[styles.rowStyle, {alignSelf: "center"}]}>

{ gettingBalances &&
<Progress.Circle style={{alignSelf:"center", marginBottom:10, marginRight: 12}} size={25} indeterminate={true} />
}
<ImageBackground
    style={{
      width: 25,
      height: 25
    }}
    source={
      require("../assets/generic_token.png") //Indicator
    }>
<Image style={{width: 25, height: 25}}
    defaultSource={GenericToken}
    source={
      {uri: iconURIs.get(symbolToRRI.get(symbol))}
    }
    
      /> 
      </ImageBackground>
  <Text style={[{fontSize:20}, getAppFont("black")]}> {tokenNames.get(symbolToRRI.get(symbol))} ({symbol.trim()})</Text>

     </View>
     <Text style={[{color: 'black', textAlign: "center"}, getAppFont("black")]}>Token RRI: {shortenAddress(symbolToRRI.get(symbol))}</Text>
     <Text
       style={[{marginVertical:4, textAlign: "center", textDecorationLine: "underline"}, getAppFont("blue")]}
       disabled = {symbolToRRI.get(symbol) == undefined}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/tokens/'+symbolToRRI.get(symbol))}}
     >Token Details</Text>
     <Separator/>
   
     <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Address you are sending from:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={addrFromRef}
        style={[{padding:10, borderWidth:1, height:55, backgroundColor:"#d3d3d3", flex:1, borderRadius: 15}, getAppFont("black")]}
        disabled="true"
        multiline={true}
        numberOfLines={2}
        autoCapitalize='none'
        placeholder='Radix Address sending from'
        value={sourceXrdAddr}
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
      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12, flex:1}, getAppFont("black")]}>{"\n"}Address to send to:</Text>
      <TouchableOpacity style={{justifyContent:'center'}} onPress={() => {setCameraOn(!cameraOn)} }>
      <Text style={[{ textAlign:'center', marginHorizontal: 0, fontSize:8}, getAppFont("black")]}>Scan QR</Text>
  
 <IconMaterial style={{justifyContent:'center', alignSelf:'center'}} name="qrcode-scan" size={20} color="black" />
 </TouchableOpacity>
 </View>

      <View style={styles.rowStyle}>

<TextInput ref={addrToRef}
style={[{padding:10, borderWidth:1, flex:1, borderRadius: 15, textAlignVertical: 'top'}, getAppFont("black")]}
        placeholder='Destination Radix Address'
        placeholderTextColor="#d3d3d3"
        value={destAddr}
        onChangeText={value => onChangeDestAddr(value)}
        autoCapitalize='none'
        multiline={true}
        numberOfLines={2}
      />
       <Separator/>

</View>

<Separator/>

<Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Amount to send:</Text>
<View style={styles.rowStyle}>
<TextInput ref={amountRef}
        style={[{padding:10, borderWidth:1, flex:1, borderRadius: 15}, getAppFont("black")]}
        placeholder='Amount'
        autoCapitalize='none'
        placeholderTextColor="#d3d3d3"
         value={amount}
        onChangeText={value => {
          
          var cleanedVal = value.replace(/^0+/, '').replace(/,/g, '');
          
          if(!isNaN(cleanedVal)){
            onChangeAmount(new bigDecimal(cleanedVal).getPrettyValue())
          } else{
            onChangeAmount(value);
          }
        }  
      }
      />

{ symbols.length > 0 &&
<SelectDropdown
 buttonStyle={[{backgroundColor:"#183A81", flex:0.5, borderWidth:1, marginRight:10, borderRadius: 15}, getAppFont("black")]}
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
/> }
</View>
<Text style={[{fontSize: 12, color:"black"}, getAppFont("black")]}>Current liquid balance: {formatNumForDisplay(balances.get(symbolToRRI.get(symbol)))} {symbol.trim()}</Text>



<Separator/>
<Separator/>
<Separator/>
<TouchableOpacity onPress={() => {addrFromRef.current.blur();addrToRef.current.blur();amountRef.current.blur();buildTxn(symbolToRRI.get(symbol), sourceXrdAddr, destAddr, symbol, amount, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW)}}>
        <View style={styles.sendRowStyle}>
        <IconFeather name="send" size={18} color="black" />
        <Text style={[{fontSize: 18, color:"black"}, getAppFont("black")]}> Send</Text>
        </View>
        </TouchableOpacity>
<Separator/>
<Separator/>
<Separator/>

{ show == true &&
<Text
       style={[{color: 'blue', textAlign: "center"}, getAppFont("blue")]}
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
