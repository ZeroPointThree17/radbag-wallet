import React, {useState, useRef, useEffect} from 'react';
import { Button, Keyboard, TouchableOpacity, TouchableHighlight, Linking, Alert, ScrollView, Image, Text, TextInput, View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo

import { decrypt } from '../helpers/encryption';
var SQLite = require('react-native-sqlite-storage');
import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconFeather from 'react-native-vector-icons/Feather';
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
var Raddish = require("../assets/radish_nobackground.png");
import { Separator, SeparatorBorder, SeparatorBorderMargin } from '../helpers/jsxlib';
import { fetchTxnHistory, getAppFont, shortenAddress, useInterval, openCB, errorCB, copyToClipboard, formatNumForDisplay, startScan, getUSB, setNewGatewayIdx } from '../helpers/helpers';
var bigDecimal = require('js-big-decimal');
import prompt from 'react-native-prompt-android';
import TransportHid from '@ledgerhq/react-native-hid';
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { HDPathRadix } from '@radixdlt/crypto'
import { from, Observable, of, Subject, Subscription, throwError } from 'rxjs'
import { Transaction } from '@radixdlt/tx-parser'
import { APDUGetPublicKeyInput, RadixAPDU } from '../helpers/apdu'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showMessage} from "react-native-flash-message";
var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);


function buildTxn(gatewayIdx, public_key, privKey_enc, setShow, setTxHash, sourceXrdAddr, destAddr, amount , actionType, currentlyStaked, setCurrentlyStaked, totalUnstaking, setTotalUnstaking, currentlyLiquid, setCurrentlyLiquid, hdpathIndex, isHW, transport, deviceID, setSubmitEnabled, usbConn){

  Keyboard.dismiss; 

  if(destAddr == undefined || destAddr.length==0){
    alert("Validator address is required")
  }
 else if(amount == undefined || amount.length==0){
  alert("Amount is required")
}
  else if ( isNaN(amount) ){
    alert("Amount entered must be a number")
  }
  else if(amount==0){
    alert("Amount must be greater than 0")
  }
  else{

  var xrdAddr=destAddr.trim();
  var amountStr = new bigDecimal(amount).multiply(new bigDecimal(1000000000000000000)).getValue();

  var jsonBody = null;
  var alertWording = "";

  if(actionType == "stake"){

    alertWording = "to"

    jsonBody =
    {
      "network_identifier": {
        "network": "mainnet"
      },
      "actions": [
        {
          "type": "StakeTokens",
          "from_account": {
            "address": sourceXrdAddr
          },
          "to_validator": {
            "address": xrdAddr
            // "address": "rdx1qspqle5m6trzpev63fy3ws23qlryw3g6t24gpjctjzsdkyuwzj870mg4mgjdz"
          },
          "amount": {
            "token_identifier": {
              "rri": "xrd_rr1qy5wfsfh"
            },
            "value": amountStr
          }
        }
      ],
      "fee_payer": {
        "address": sourceXrdAddr
      },
      "disable_token_mint_and_burn": true
    };
  } else if (actionType == "unstake"){

    alertWording = "from"
    
    jsonBody =
    {
      "network_identifier": {
        "network": "mainnet"
      },
      "actions": [
        {
          "type": "UnstakeTokens",
          "from_validator": {
            "address": xrdAddr
          },
          "to_account": {
            "address": sourceXrdAddr
            // "address": "rdx1qspqle5m6trzpev63fy3ws23qlryw3g6t24gpjctjzsdkyuwzj870mg4mgjdz"
          },
          "amount": {
            "token_identifier": {
              "rri": "xrd_rr1qy5wfsfh"
            },
            "value": amountStr
          }
        }
      ],
      "fee_payer": {
        "address": sourceXrdAddr
      },
      "disable_token_mint_and_burn": true
    };
  }

  fetch(global.gateways[gatewayIdx] + '/transaction/build', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBody)
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
          "Fee will be " + formatNumForDisplay(json.transaction_build.fee.value) + " XRD\n for this "+actionType+" action of "+amount+" XRD "+ alertWording + " " + shortenAddress(xrdAddr)+"\n\nDo you want to commit this transaction?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "OK", onPress: () => submitTxn(gatewayIdx, json.transaction_build.payload_to_sign, json.transaction_build.unsigned_transaction, public_key, privKey_enc, setShow, setTxHash, currentlyStaked, setCurrentlyStaked, totalUnstaking, setTotalUnstaking, actionType, amount, currentlyLiquid, setCurrentlyLiquid, hdpathIndex, isHW, transport, deviceID, setSubmitEnabled, usbConn) }
          ]
        );

        }
      }).catch((error) => {
        setNewGatewayIdx(gatewayIdx);
      });
}
}



function transport_send(gatewayIdx, setSubmitEnabled, transport, apdus, unsigned_transaction, public_key, setShow, setTxHash){

  var currApdu = apdus.shift();

  if(apdus.length == 0){

    alert("Please sign this transaction on the device to finalize");

     transport.send(currApdu.cla, currApdu.ins, currApdu.p1, currApdu.p2, currApdu.data, currApdu.requiredResponseStatusCodeFromDevice).then((result) => {
      
      var finalSig = result.slice(1,result.length-2).toString('hex');
      console.log("INSIDE RESULTS FINAL: "+finalSig)

      if(finalSig.length < 10){
        alert("Transaction not submitted.")
      } else{
        alert("Transaction submitted.")

        finalizeTxn(gatewayIdx, setSubmitEnabled, unsigned_transaction, public_key, finalSig, setShow, setTxHash);

      }
    })
  } else{
     transport.send(currApdu.cla, currApdu.ins, currApdu.p1, currApdu.p2, currApdu.data, currApdu.requiredResponseStatusCodeFromDevice).then((result) => {
      console.log("INSIDE RESULTS: "+result.toString('hex'))
      transport_send(gatewayIdx, setSubmitEnabled, transport, apdus, unsigned_transaction, public_key, setShow, setTxHash)
    })
  }
}


function finalizeTxn(gatewayIdx, setSubmitEnabled, unsigned_transaction, public_key, finalSig, setShow, setTxHash){
  
// alert(unsigned_transaction +" "+public_key+" "+ finalSig)

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
// alert(JSON.stringify(json))
   var txnHash = JSON.stringify(json.transaction_identifier.hash).replace(/["']/g, "")
  
   Keyboard.dismiss;
   setShow(true);
   setTxHash(txnHash);
   setSubmitEnabled(true);

  }).catch((error) => {
    setNewGatewayIdx(gatewayIdx);
  });
}



async function submitTxn(gatewayIdx, message,unsigned_transaction,public_key,privKey_enc, setShow, setTxHash, currentlyStaked, setCurrentlyStaked, totalUnstaking, setTotalUnstaking, actionType, amount, currentlyLiquid, setCurrentlyLiquid, hdpathIndex, isHW, transport, deviceID, setSubmitEnabled, usbConn){

  setShow(false);

  var passwordStr = ""
  var promptFunc = null
  
  if(Platform.OS === 'ios'){
    promptFunc = Alert.prompt;
  } else{
    promptFunc = prompt
  }

  if(isHW != true){

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
         // privatekey = decrypt(privKey_enc, Buffer.from("c"));
  // alert("Privekey unc: "+privatekey)
  signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(message,'hex')), Uint8Array.from(privatekey))


  var result=new Uint8Array(72);
  secp256k1.signatureExport(signature.signature,result);
  
  var finalSig = Buffer.from(result).toString('hex');

  finalizeTxn(gatewayIdx, setSubmitEnabled, unsigned_transaction, public_key, finalSig, setShow, setTxHash);

   
} catch(err){
    alert("Password incorrect")
  }
  
        }
      }
    ],
    "secure-text"
  );

} else{
    
  if (usbConn == true) {
    transport = await TransportHid.create()
  }
  
  if(transport == undefined && deviceID == undefined){
    alert("Please open the hardware wallet and the Radix app in the wallet first")
  } else{

    if(deviceID != undefined){
      transport = await TransportBLE.open(deviceID);
    }

     const hdpath = HDPathRadix.create({ address: { index: hdpathIndex, isHardened: true } });

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
  
      // alert("numberOfInstructions: "+numberOfInstructions)

     var apdu1 =  RadixAPDU.signTX.initialSetup({
        path: hdpath,
        txByteCount: unsigned_transaction.length / 2, // 2 hex chars per byte
        numberOfInstructions,
        // nonNativeTokenRriHRP: input.nonXrdHRP,
    })

   console.log("BEFORE SEND HW")


          transport.send(apdu1.cla, apdu1.ins, apdu1.p1, apdu1.p2, apdu1.data, apdu1.requiredResponseStatusCodeFromDevice).then((result0) => {
    
            alert("Please confirm this transaction on the device.");

            console.log("AFTER SEND HW")


            var apdus = []

      while( instructions.length > 0){

            const instructionToSend = instructions.shift() // "pop first"

            console.log("INSTRUCTIONS: "+instructions)
            const instructionBytes = instructionToSend.toBuffer();

            const displayInstructionContentsOnLedgerDevice = false
            const displayTXSummaryOnLedgerDevice = false

            var apdu2 =  RadixAPDU.signTX.singleInstruction({
              instructionBytes,
              isLastInstruction: instructions.length==0?true:false,
              displayInstructionContentsOnLedgerDevice,
              displayTXSummaryOnLedgerDevice,
            })
            apdus.push(apdu2)
      }
            
            transport_send(gatewayIdx, setSubmitEnabled, transport, apdus, unsigned_transaction, public_key, setShow, setTxHash);

        }).catch((error) => {
        alert("Please open the hardware wallet and the Radix app in the wallet first")
      })
      }
    }
}





function getStakeData(gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, setStakeValidators, setValidatorData, setTotalUnstaking, setRenderedStakeValidatorRows,setPrivKey_enc,setPublic_key,setPendingStake, setPendingUnstake, setCurrentlyLiquid, setCurrentlyStaked){

  fetch(global.gateways[gatewayIdx] + '/account/stakes', {
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
          "address": currAddr
          // "address": "rdx1qspnfus07y7pjcy8ez4alquuuxhzma5gwd5mk25czlacv7pz2x2nw4q0h87mn"
        }
      }
    )
  }).then((response) => response.json()).then((json) => {
      //  alert(JSON.stringify(json))
     
    if(json.code == 400 || json.code == 500){
      // alert(JSON.stringify(json.message));
     }
     else{
      var stakeValidatorsArr = []

      var pendingStake=new bigDecimal(0);

      json.pending_stakes.forEach(element => {
        pendingStake = pendingStake.add(new bigDecimal(element.delegated_stake.value))
       });

       json.stakes.forEach(element => {
        stakeValidatorsArr.push({address: element.validator_identifier.address, delegated_stake: element.delegated_stake.value})
       });

       setStakeValidators(stakeValidatorsArr);
      //  alert(JSON.stringify(stakeValidatorsArr));
       setPendingStake(pendingStake.getValue());

       getValidatorData(gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, stakeValidatorsArr, setValidatorData, new Map(), setTotalUnstaking, setRenderedStakeValidatorRows,setPrivKey_enc,setPublic_key, setPendingUnstake, setCurrentlyLiquid, setCurrentlyStaked)
    }
  }).catch((error) => {
    setNewGatewayIdx(gatewayIdx);
  });
}


function getValidatorData(gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, stakeValidators, setValidatorData, inputMap, setTotalUnstaking, setRenderedStakeValidatorRows,setPrivKey_enc,setPublic_key, setPendingUnstake, setCurrentlyLiquid, setCurrentlyStaked){

  // alert("GV SL Len: "+stakeValidators.length)
  var jsonBody = null;
  var stakeValsPresent = false;

  if(stakeValidators.length>0){
    // alert("stakeValidators: "+JSON.stringify(stakeValidators))

  var stakeValidator = stakeValidators.pop();
  var validatorAddr = stakeValidator.address;
  var validatorDelegatedStk = stakeValidator.delegated_stake;
  jsonBody = {
      "network_identifier": {
        "network": "mainnet"
      },
      "validator_identifier": {
        "address": validatorAddr
      }
    };
    stakeValsPresent = true;
  } else {
    jsonBody =
    {
      "network_identifier": {
        "network": "mainnet"
      },
      "validator_identifier": {
        "address": "rv1qt7dmsekqnrel6uxf9prqwujhn4udnu9yl9yzrlrkprmq4zrwmppvxn2gqf"
      }
    };

  }
 
  //  alert("val addr: "+validatorAddr)
  var validatorData = new Map(inputMap);

  fetch(global.gateways[gatewayIdx]  + '/validator', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      jsonBody
    )
  }).then((response) => response.json()).then((json) => {
   
    // alert(JSON.stringify(json));
    if(json.code == 400 || json.code == 500){
      // alert(JSON.stringify(json.message));
     }
     else{

      if(stakeValsPresent == true){
        var valProps = json.validator.properties;
        valProps["delegated_stake"] = validatorDelegatedStk;
        validatorData.set(validatorAddr, valProps);
      }

      // alert(JSON.stringify(valProps))

       if(stakeValidators.length==0){
        // validatorData.forEach((val) => {alert(JSON.stringify(val))})
     
         setValidatorData(validatorData)

         getUnstakeData(gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, setTotalUnstaking, setRenderedStakeValidatorRows, validatorData,setPrivKey_enc,setPublic_key,setPendingUnstake, setCurrentlyLiquid, setCurrentlyStaked)
         
       } else{
        getValidatorData(gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, stakeValidators, setValidatorData, validatorData, setTotalUnstaking, setRenderedStakeValidatorRows,setPrivKey_enc,setPublic_key, setPendingUnstake, setCurrentlyLiquid, setCurrentlyStaked)
       }
    }
  }).catch((error) => {
    setNewGatewayIdx(gatewayIdx);
  });

}


function getUnstakeData(gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, setTotalUnstaking, setRenderedStakeValidatorRows, validatorData,setPrivKey_enc, setPublic_key, setPendingUnstake,setCurrentlyLiquid, setCurrentlyStaked){
 
  fetch(global.gateways[gatewayIdx] + '/account/unstakes', {
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
          "address": currAddr
          // "address": "rdx1qspnfus07y7pjcy8ez4alquuuxhzma5gwd5mk25czlacv7pz2x2nw4q0h87mn"
        }
      }
    )
  }).then((response) => response.json()).then((json) => {
      // alert(JSON.stringify(json))
     
    if(json.code == 400 || json.code == 500){
      // alert(JSON.stringify(json.message));
     }
     else{

      var pendingUnstakes = new bigDecimal(0)

      json.pending_unstakes.forEach(element => {
        pendingUnstakes = pendingUnstakes.add(new bigDecimal(element.unstaking_amount.value))
       });

      setPendingUnstake(pendingUnstakes.getValue());

      var totalUnstaking = new bigDecimal(0)

       json.unstakes.forEach(element => {
        //  alert(element.unstaking_amount.value)
        totalUnstaking = totalUnstaking.add(new bigDecimal(element.unstaking_amount.value))
       });

       setTotalUnstaking(totalUnstaking.getValue());

      //  validatorData.forEach((el)=> alert(JSON.stringify(el)))
       setRenderedStakeValidatorRows(renderStakeValidatorRows(setValAddr, setUnstakeValAddr, setStakingScreenActive, validatorData))

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
             getBalances(gatewayIdx, currAddr, setCurrentlyLiquid, setCurrentlyStaked)
           });
         }, errorCB);
      }
    }).catch((error) => {
      setNewGatewayIdx(gatewayIdx);
    });
}



function getBalances(gatewayIdx, currAddr, setCurrentlyLiquid, setCurrentlyStaked){
   
  fetch(global.gateways[gatewayIdx] + '/account/balances', {
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
              "address": currAddr
            }
          }      
    
      )
    }).then((response) => response.json()).then((json) => {

      // alert("Get Balances call: "+JSON.stringify(json));
      
        var liquid_balance = 0;
        if(!(json === undefined) && json.code != 400 && json.ledger_state.epoch > 0 ){

          json.account_balances.liquid_balances.forEach( (balance) =>{
            if(balance.token_identifier.rri == "xrd_rr1qy5wfsfh"){
              liquid_balance = balance.value;
            }

          } );

          var staked_balance = json.account_balances.staked_and_unstaking_balance.value
          // alert(liquid_balance)
          setCurrentlyLiquid(new bigDecimal(liquid_balance).getValue());
          setCurrentlyStaked(new bigDecimal(staked_balance).getValue());
        }
      }).catch((error) => {
        setNewGatewayIdx(gatewayIdx);
      });

  }
 




function renderStakeValidatorRows(setValAddr, setUnstakeValAddr, setStakingScreenActive, validatorData){

  // alert("stked val len: " + stakeValidators.length);
  // if(  validatorData.size > 0){

      var rows = []
      // alert(rows)

      validatorData.forEach((validatorDetails, valAddr) =>  
 {
// console.log(JSON.stringify(validatorDetails))
  try{
      // alert("Val deets: "+JSON.stringify(validatorDetails)) 
          rows.push(
             
          <View key={valAddr} style={[{backgroundColor:global.reverseModeTranslation}]}>



<View style={[{backgroundColor:global.reverseModeTranslation}]}>
    {/* <View style={styles.addrRowStyle}> */}

    <Text style={[{color:"black",flex:1,marginTop:0,fontSize:14,justifyContent:'flex-start'}, getAppFont("black")]}>{validatorDetails.name}</Text>
    <Text style={[{color:"black",flex:1,marginTop:0,fontSize:14,justifyContent:'flex-start'}, getAppFont("black")]}>Staked: {formatNumForDisplay(validatorDetails.delegated_stake)} XRD</Text>
    <Text style={[{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end'}, getAppFont("black")]}>Fee: {validatorDetails.validator_fee_percentage}%</Text>
    <Text style={[{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end'}, getAppFont("black")]}>Address: {shortenAddress(valAddr)}</Text>

    <View style={styles.rowStyle}>
    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(valAddr)}}>
    <Text style={[{marginTop:0,fontSize:14, justifyContent:'flex-end'}, getAppFont("#4DA892")]}>[Copy Address]</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={ () => {  showMessage({
    message: "Validator selected",
    type: "info",
    }); setUnstakeValAddr(valAddr); setStakingScreenActive(false)}}>
    <Text style={[{marginTop:0,fontSize:14, justifyContent:'flex-end'}, getAppFont("#4DA892")]}>  [Reduce Stake]</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={ () => {  showMessage({
    message: "Validator selected",
    type: "info",
    });setValAddr(valAddr); setStakingScreenActive(true)}}>
    <Text style={[{marginTop:0,fontSize:14, justifyContent:'flex-end'}, getAppFont("#4DA892")]}>  [Add to Stake]</Text>
    </TouchableOpacity>
     </View>   

    </View>   

    <SeparatorBorderMargin/>
  </View>        
  )

  }    
  catch(err){
      console.log(err)
 }
 });
         
  return (rows)

  // }

}


 const Staking = ({route, navigation}) => {
 
      const { currAddr, hdpathIndex, isHWBool } = route.params;

      const [privKey_enc, setPrivKey_enc] = useState();
      const [public_key, setPublic_key] = useState();
    
      const [txnHash, setTxHash] = useState(null);
      const [show, setShow] = useState(false);

      const [currentlyLiquid, setCurrentlyLiquid] = useState();
      const [currentlyStaked, setCurrentlyStaked] = useState();
      const [pendingStake, setPendingStake] = useState(0);
      const [totalUnstaking, setTotalUnstaking] = useState(0);
      const [pendingUnstake, setPendingUnstake] = useState(0);
      const [stakeValidators, setStakeValidators] = useState([]);
      const [validatorData, setValidatorData] = useState(new Map());
      const [renderedStakeValidatorRows, setRenderedStakeValidatorRows] = useState([]);
      const [valAddr, setValAddr] = useState("rv1qt7dmsekqnrel6uxf9prqwujhn4udnu9yl9yzrlrkprmq4zrwmppvxn2gqf");
      const [unstakeValAddr, setUnstakeValAddr] = useState();
      const [stakingScreenActive, setStakingScreenActive] = useState(true);
      const [stakeAmt, setStakeAmt] = useState();
      const [unstakeAmt, setUnstakeAmt] = useState();
      const [showStakingStats, setShowStakingStats] = useState(false);
      const [transport, setTransport] = useState();
      const [deviceID, setDeviceID] = useState();
      const [submitEnabled, setSubmitEnabled] = useState(true);
      const [usbConn, setUsbConn] = useState(false);
      const [deviceName, setDeviceName] = useState("Looking for device...");
      const [historyRows, setHistoryRows] = useState([]);
      const [hashToDecrypt, setHashToDecrypt] = useState([])
      const [decryptedMap, setDecryptedMap] = useState(new Map())

      const stakeValRef = useRef();
      const stakeAmtRef = useRef();
      const unstakeValRef = useRef();
      const unstakeAmtRef = useRef();


      // stakeValidators.forEach((val)=>{alert(JSON.stringify(val))})

  useEffect(() => {
    AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
    getStakeData(gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, setStakeValidators, setValidatorData, setTotalUnstaking, setRenderedStakeValidatorRows,setPrivKey_enc,setPublic_key,setPendingStake, setPendingUnstake,setCurrentlyLiquid, setCurrentlyStaked)
    })
  }, []);

useInterval(() => {
  AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {     
    getStakeData(gatewayIdx, gatewayIdx, currAddr, setValAddr, setUnstakeValAddr, setStakingScreenActive, setStakeValidators, setValidatorData, setTotalUnstaking, setRenderedStakeValidatorRows,setPrivKey_enc,setPublic_key,setPendingStake, setPendingUnstake, setCurrentlyLiquid, setCurrentlyStaked)
    fetchTxnHistory(db, gatewayIdx, currAddr, setHistoryRows, true, hashToDecrypt, setHashToDecrypt, setDecryptedMap, decryptedMap, isHWBool, usbConn, transport, deviceID, hdpathIndex);
  })

  if (transport == undefined) {
    startScan(setTransport, setDeviceID, setDeviceName);
    getUSB(setTransport, setUsbConn, setDeviceName);
  }

}, 2000);
 
// alert(historyRows.length)

const stakingStats = (showStakingStats) => {

  if(showStakingStats == true){
  return (
    <View>
    <Separator/>
    <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12, fontWeight:"bold"}, getAppFont("black")]}>Current Address: {currAddr}</Text>
    <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Liquid Balance: {formatNumForDisplay(currentlyLiquid)} XRD</Text>
    <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Staked Balance: {formatNumForDisplay(currentlyStaked)} XRD</Text>
    <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Pending Stake Balance: {formatNumForDisplay(pendingStake)} XRD</Text>
    {/* <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Unstaking Balance: {(formatNumForDisplay(totalUnstaking)) + formatNumForDisplay(pendingUnstake))).toLocaleString()} XRD</Text> */}
    <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Unstaking Balance: {formatNumForDisplay(totalUnstaking)} XRD</Text>
    <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Pending Unstake Balance: {formatNumForDisplay(pendingUnstake)} XRD</Text>
    <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Total Balance: {new bigDecimal(((new bigDecimal(formatNumForDisplay(currentlyLiquid).replace(/,/g, '')).add(new bigDecimal(formatNumForDisplay(currentlyStaked).replace(/,/g, '')))).getValue())).getPrettyValue()} XRD</Text>
    <Separator/>
    <LinearGradient colors={[global.appBlue, global.appGreen, global.appGreen]} useAngle={true} angle={11} style={styles.surface}>  
    {/* <LinearGradient colors={['#183A81','#4DA892', '#4DA892']} useAngle={true} angle={11} style={styles.surface}>     */}
       <Image style={{margin: 0, width: 70, height: 90, marginBottom:4, alignSelf:'center'}}
    source={Raddish}/>
       <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:10, color:"white", textAlign:"center", alignSelf:'center'}, getAppFont("white")]}>Please consider staking with the RadBag Validator to support products like this wallet app and more to come!{"\n"}We are one of the top Radix validators with a low 1% fee!</Text>
       </LinearGradient>

    </View>
  );
  }
}


 return ( 
  <ScrollView contentContainerStyle={{backgroundColor:global.reverseModeTranslation}}> 
     <Separator/>
     <View style={[styles.addrRowStyle,{backgroundColor:global.reverseModeTranslation}]}>
     <TouchableHighlight 
     activeOpacity={0.6}
     underlayColor="black"
    onPress={() => {setStakingScreenActive(true)}}>
  <Text style={[{marginHorizontal: 0, fontSize:22, color:"black", textAlign:"center", alignSelf:'center', textDecorationLine: stakingScreenActive? 'underline' : 'none'}, getAppFont("black")]}>Staking</Text>
</TouchableHighlight>
<Text style={{marginHorizontal: 0, fontSize:22, color:"black", textAlign:"center", alignSelf:'center'}}>    </Text>
<TouchableHighlight 
activeOpacity={0.6}
underlayColor="#DDDDDD"
onPress={() => {setStakingScreenActive(false)}}>
  <Text style={[{marginHorizontal: 0, fontSize:22, color:"black", textAlign:"center", alignSelf:'center', textDecorationLine: stakingScreenActive? 'none' : 'underline'}, getAppFont("black")]}>Unstaking</Text>
  </TouchableHighlight>
    </View>

{stakingScreenActive && <React.Fragment>
  <View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}>
 
  <TouchableOpacity style={[styles.appButtonContainer,{backgroundColor: global.appGreenAlt}]} onPress={ () => setShowStakingStats(!showStakingStats) }>
  < Text style={[styles.appButtonText, getAppFont("white")]}>{showStakingStats==false?"Show":"Hide"} Staking Stats</Text>
    </TouchableOpacity>

{stakingStats(showStakingStats)}


    <Separator/>
      <View style={[styles.rowStyle,{backgroundColor:global.reverseModeTranslation}]}>
     <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12, flex:1, borderRadius: 15}, getAppFont("black")]}>Validator Address{"\n"}(Default: RadBag Validator):</Text>
     <Text
       style={[{textAlign: "center" , fontSize:12, flex:0.5}, getAppFont("#4DA892")]}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/validators')}}
     >
       [Validator List]
     </Text>
     </View>
     <View style={[styles.rowStyle]}>
 
        <TextInput ref={stakeValRef}
        style={[{padding:8, borderWidth:1, backgroundColor:global.reverseModeTranslation, borderColor: global.modeTranslation, flex:1, borderRadius: 15, textAlignVertical: 'top'}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        multiline={true}
        numberOfLines={2}
        placeholder='Validator Address'
        placeholderTextColor="#d3d3d3"
        value={valAddr}
        maxLength={199}
        onChangeText={value => setValAddr(value)}
      />
      </View>
      <Separator/>

      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Amount to Stake (Min 90):</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={stakeAmtRef}
        style={[{ padding:4, paddingLeft:10,  borderWidth:1, backgroundColor:global.reverseModeTranslation, borderColor: global.modeTranslation, flex:0.5, borderRadius: 15}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        placeholder='Amount'
        placeholderTextColor="#d3d3d3"
        value={stakeAmt}
        onChangeText={value => setStakeAmt(value)}
      />
      </View>

      <Separator/>
      <Separator/>
<TouchableOpacity style={styles.button} onPress={() => {
     stakeValRef.current.blur();
     stakeAmtRef.current.blur();
     Keyboard.dismiss;

     AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
         
     buildTxn(gatewayIdx, public_key, privKey_enc, setShow, setTxHash, currAddr, valAddr, stakeAmt , "stake", currentlyStaked, setCurrentlyStaked, totalUnstaking, setTotalUnstaking, currentlyLiquid, setCurrentlyLiquid, hdpathIndex, isHWBool, transport, deviceID, setSubmitEnabled, usbConn) 
     })
     
     }}>

        <View style={[styles.sendRowStyle]}>
        <View style ={[styles.sendRowStyle,{borderWidth:1, borderRadius:15, padding: 8, backgroundColor:"#183A81"}]}>

        <Text style={[{fontSize: 18, color:"black", alignSelf:"center"}, getAppFont("white")]}>
        <IconFeather name="arrow-down-circle" size={18} color="white"/> Stake</Text>
        </View>
        </View>
        </TouchableOpacity>
        {isHWBool==true && <React.Fragment><Separator/><Separator/>
        <Text style={[{fontSize: 12, color:"black"}, getAppFont("black")]}>Hardware Wallet: {deviceName}</Text></React.Fragment>}
  </View>
</React.Fragment>
}


{stakingScreenActive==false && <React.Fragment>
<View style={[styles.container,{backgroundColor:global.reverseModeTranslation}]}>
      
<TouchableOpacity style={[styles.appButtonContainer, {backgroundColor: global.appGreenAlt}]} onPress={ () => setShowStakingStats(!showStakingStats) }>
    < Text style={[styles.appButtonText, getAppFont("white")]}>{showStakingStats==false?"Show":"Hide"} Staking Stats</Text>
    </TouchableOpacity>

       {stakingStats(showStakingStats)}
      <Separator/>
     <Separator/>
       <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Validator to unstake from:</Text>
        <TextInput ref={unstakeValRef}
        style={[{padding:8, borderWidth:1, backgroundColor:global.reverseModeTranslation, borderColor: global.modeTranslation,flex:1, borderRadius: 15}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        multiline={true}
        numberOfLines={2}
        placeholder='Click REDUCE STAKE on a validator below (no list will show if you do not have any stakes)'
        placeholderTextColor="#d3d3d3"
        value={unstakeValAddr}
        maxLength={199}
        onChangeText={value => setUnstakeValAddr(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
     
      <Separator/>

      <Text style={[{textAlign:'left', marginHorizontal: 0, fontSize:12}, getAppFont("black")]}>Amount to Unstake:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={unstakeAmtRef}
        style={[{ padding:4, paddingLeft:10, borderWidth:1, backgroundColor:global.reverseModeTranslation, borderColor: global.modeTranslation, flex:0.5, borderRadius: 15}, getAppFont("black")]}
        disabled="false"
        autoCapitalize='none'
        placeholder='Amount'
        placeholderTextColor="#d3d3d3"
        value={unstakeAmt}
        onChangeText={value => setUnstakeAmt(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
      </View>

      <Separator/>
      <Separator/>
      <Text style={[{fontSize: 18, color:"black", alignSelf:"center"}, getAppFont("red")]}>REMEMBER TO PRESS "REDUCE STAKE" FROM THE CORRECT VALIDATOR IN THE LIST BELOW. LIST WILL NOT APPEAR IF YOU DO NOT HAVE ANY STAKES.</Text>
      <Separator/>
      <Separator/>
      <TouchableOpacity style={styles.button} onPress={() => {
            unstakeValRef.current.blur();
            unstakeAmtRef.current.blur();
            Keyboard.dismiss;

            AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {  
              buildTxn(gatewayIdx, public_key, privKey_enc, setShow, setTxHash, currAddr, unstakeValAddr, unstakeAmt , "unstake", currentlyStaked, setCurrentlyStaked, totalUnstaking, setTotalUnstaking, currentlyLiquid, setCurrentlyLiquid, hdpathIndex, isHWBool, transport, deviceID, setSubmitEnabled )
            })
            }}>
          <View style={[styles.sendRowStyle]}>
          <View style ={[styles.sendRowStyle,{borderWidth:1, borderRadius:15, padding: 8, backgroundColor:"#183A81"}]}>

          <Text style={[{fontSize: 18, color:"black", alignSelf:"center"}, getAppFont("white")]}>
          <IconFeather name="arrow-down-circle" size={18} color="white"/> Unstake</Text>
          </View>
          </View>
        </TouchableOpacity>
        {isHWBool==true && <React.Fragment><Separator/><Separator/>
        <Text style={[{fontSize: 12, color:"black"}, getAppFont("black")]}>Hardware Wallet: {deviceName}</Text></React.Fragment>}
</View>

</React.Fragment>
}

{ show == true &&
<React.Fragment>
<Text
       style={[{textAlign: "center"}, getAppFont("#4DA892")]}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/transactions/'+txnHash)}}
     >
       Transaction has been submitted.{"\n\n"}Transaction hash is: {txnHash}{"\n\n"}Click here for transaction details. Refresh page if transaction does not immediately display.
     </Text>
     <Separator/>
     </React.Fragment>
 }

<View style={[styles.container, {backgroundColor:global.reverseModeTranslation}]} > 
<View >
<Text style={[{fontSize: 16}, getAppFont("black")]}>Current Stakes</Text>
<Text style={[{fontSize: 12}, getAppFont("black")]}>(excludes amounts pending and being unstaked) </Text>
</View>
              <SeparatorBorderMargin/>
{renderedStakeValidatorRows}

<Separator/>
<Separator/>
<Separator/>
<Separator/>
<Separator/>
{historyRows.length > 0 && 
<React.Fragment>
<Text style={[{fontSize: 16}, getAppFont("black")]}>Staking History</Text>
<Text style={[{fontSize: 12}, getAppFont("black")]}>(only from within last 30 transactions)</Text>
<SeparatorBorderMargin/>
  {historyRows}
</React.Fragment>
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
<Separator/>
</View>
  </ScrollView>
 )
};


const styles = StyleSheet.create({
  surface: {
    flex: 1,
    padding: 10,
    margin: 6,
    height: 'auto',
    width: 'auto',
    // alignItems: 'flex-start',
    // justifyContent: 'center',
    // elevation: 4,
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: '#4DA892',
 
  },
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
  addrRowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical:0
  },
  appButtonContainer: {
    elevation: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    alignSelf: "center"
  }
});

export default Staking;
