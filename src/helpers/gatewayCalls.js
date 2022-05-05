import { Keyboard, Alert } from 'react-native';
import { rdxToPubKey, openCB, errorCB, shortenAddress, formatNumForDisplay, setNewGatewayIdx } from '../helpers/helpers';
const secp256k1 = require('secp256k1');
import { Transaction } from '@radixdlt/tx-parser'
import { RadixAPDU } from '../helpers/apdu'
import TransportHid from '@ledgerhq/react-native-hid';
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { HDPathRadix, PublicKey, PrivateKey, MessageEncryption } from '@radixdlt/crypto'
import { throwError } from 'rxjs'
var SQLite = require('react-native-sqlite-storage');
import { decrypt } from '../helpers/encryption';
import prompt from 'react-native-prompt-android';
var bigDecimal = require('js-big-decimal');


export async function buildTxn(gatewayIdx, usbConn, setSubmitEnabled, rri, sourceXrdAddr, destAddr, symbol, amount, message, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, encryptMsgflag){

  Keyboard.dismiss; 
  setSubmitEnabled(false);

  if (amount != undefined){
    amount = amount.replace(/,/g, '');
  }

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


  if(isHW != true){
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

            decrypt(privKey_enc, Buffer.from(password))

            if(encryptMsgflag ){
                
            if(message != undefined && message.length > 0){

                var targetPubKey = PublicKey.fromBuffer(Buffer.from(rdxToPubKey(destAddr),'hex'),'hex')
                var privKeyObj = PrivateKey.fromHex(decrypt(privKey_enc, Buffer.from(password)))
      
                var to = targetPubKey.value;
      
                var plaintext = message
                MessageEncryption.encrypt({
                  plaintext,
                  diffieHellmanPoint: privKeyObj.value.diffieHellman.bind(
                    null,
                    to,
                  ),
                }).then( (res) => {
                  buildTxnFetch(gatewayIdx, usbConn, setSubmitEnabled, rri, sourceXrdAddr, xrdAddr, symbol, amount, amountStr, res.value.combined().toString('hex'), public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, password)
                })
              }  
            } else{

              if(message != undefined && message.length > 0){
                  message = "0000" + message.hexEncode();
              }
              // alert(privKey_enc)
              buildTxnFetch(gatewayIdx, usbConn, setSubmitEnabled, rri, sourceXrdAddr, xrdAddr, symbol, amount, amountStr, message, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, password)

          }
    
        } catch(err){
    
          alert("Password incorrect")
        }
        
              }
            }
          ],
          "secure-text"
        );

    } else{


        if(encryptMsgflag){
            if(message != undefined && message.length > 0){
                message = "0000" + message.hexEncode();
            }
            buildTxnFetch(gatewayIdx, usbConn, setSubmitEnabled, rri, sourceXrdAddr, xrdAddr, symbol, amount, amountStr, message, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, password)
      } else{
        if(message != undefined && message.length > 0){
            message = "0000" + message.hexEncode();
        }
            buildTxnFetch(gatewayIdx, usbConn, setSubmitEnabled, rri, sourceXrdAddr, xrdAddr, symbol, amount, amountStr, message, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, password)
      }
    }
  }
}
  
  
export function buildTxnFetch(gatewayIdx, usbConn, setSubmitEnabled, rri, sourceXrdAddr, xrdAddr, symbol, amount, amountStr, message, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, password){
  
  fetch(global.gateways[gatewayIdx] + '/transaction/build', {
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
                  // "address": "rdx1qsp75a9gj0uy477kgrzn2y5derv5fa9ce5gf5ar2fs4tkm6vr7q5gugnnw9me"
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
            "message": message,
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
            { text: "OK", onPress: () => submitTxn(gatewayIdx, rri, usbConn, setSubmitEnabled, json.transaction_build.payload_to_sign, json.transaction_build.unsigned_transaction, public_key, privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, password) }
          ]
        );

        }
      }).catch((error) => {
          console.error(error);
          setNewGatewayIdx(gatewayIdx);
        });
}


export async function submitTxn (gatewayIdx, rri, usbConn, setSubmitEnabled, message,unsigned_transaction,public_key,privKey_enc, setShow, setTxHash, hdpathIndex, isHW, transport, deviceID, password){

  setShow(false);

  var passwordStr = ""
  var promptFunc = null


  if(isHW != true){


  var finalSig = ""

  console.log("unsigned_transaction: "+unsigned_transaction)

  var signature = "";

  var privatekey = new Uint8Array(decrypt(privKey_enc, Buffer.from(password)).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));


  signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(message,'hex')), Uint8Array.from(privatekey))


  var result=new Uint8Array(72);
  secp256k1.signatureExport(signature.signature,result);


  finalSig = Buffer.from(result).toString('hex');


  finalizeTxn(gatewayIdx, setSubmitEnabled, unsigned_transaction, public_key, finalSig, setShow, setTxHash);

  } else{

  if (usbConn == true) {
    transport = await TransportHid.create()
  }

  if(transport == undefined && deviceID == undefined){
    alert("Please open the Radix app in the hardware wallet first")
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

      var rri_prefix = rri.split('_')[0];

      var apdu1 =  RadixAPDU.signTX.initialSetup({
        path: hdpath,
        txByteCount: unsigned_transaction.length / 2, // 2 hex chars per byte
        numberOfInstructions,
        nonNativeTokenRriHRP: rri_prefix == 'xrd' ? undefined : rri_prefix
    })
    
    transport.send(apdu1.cla, apdu1.ins, apdu1.p1, apdu1.p2, apdu1.data, apdu1.requiredResponseStatusCodeFromDevice).then((result0) => {

    alert("Please confirm this transaction on the device");

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


export function getTokenSymbols(gatewayIdx, defaultRri, setGettingBalances, rris, inputSymbols, inputSymToRRIs, setSymbols, setSymbolToRRI,setPrivKey_enc,setPublic_key,initialIconsMap,setIconURIs, initialNamesMap, setTokenNames, symbolCnts, appendStr){

    var rri = rris.shift();
    var symbolsArr = inputSymbols.slice();
    var symbolToRRI = new Map(inputSymToRRIs);
    var iconsMap = new Map(initialIconsMap);
    var namesMap = new Map(initialNamesMap);
    var updatedSymbolCnts = new Map(symbolCnts);

    if(defaultRri == rri || defaultRri == undefined){
      fetch(global.gateways[gatewayIdx] + '/token', {
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
    
          var localSymbol = json.token.token_properties.symbol.toUpperCase();

          if(rri != "xrd_rr1qy5wfsfh"){
            symbolsArr.push(localSymbol + ' (' + shortenAddress(rri) + ')')
          }

          symbolToRRI.set(localSymbol + " ("+shortenAddress(rri)+")", rri);
          iconsMap.set(localSymbol + " ("+shortenAddress(rri)+")", json.token.token_properties.icon_url); 
          namesMap.set(localSymbol + " ("+shortenAddress(rri)+")", json.token.token_properties.name)     
      }

      if(rris.length == 0 || defaultRri == rri){

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
                  getTokenSymbols(gatewayIdx, defaultRri,setGettingBalances,rris, symbolsArr, symbolToRRI, setSymbols, setSymbolToRRI,setPrivKey_enc,setPublic_key,iconsMap,setIconURIs, namesMap, setTokenNames, updatedSymbolCnts, appendStr)
                }
              }).catch((error) => {
                console.error(error);
                setNewGatewayIdx(gatewayIdx);
              });
        } else{
          getTokenSymbols(gatewayIdx, defaultRri,setGettingBalances,rris, symbolsArr, symbolToRRI, setSymbols, setSymbolToRRI,setPrivKey_enc,setPublic_key,iconsMap,setIconURIs, namesMap, setTokenNames, updatedSymbolCnts, appendStr)
    
        }
          
}




export function getBalances(gatewayIdx, defaultRri, firstTime, setGettingBalances, sourceXrdAddr, setSymbols, setSymbolToRRI, setBalances,setPrivKey_enc,setPublic_key, setIconURIs, setTokenNames){
   
    setGettingBalances(firstTime);
  
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
                "address": sourceXrdAddr
              }
            }      
      
        )
      }).then((response) => response.json()).then((json) => {
  
          if(!(json === undefined) && json.code != 400 && json.ledger_state.epoch > 0 ){
  
            var balances = new Map();
            var rris = ["xrd_rr1qy5wfsfh"]
            var symbols = ["XRD (" + shortenAddress("xrd_rr1qy5wfsfh") + ")"]
   
            json.account_balances.liquid_balances.forEach( (balance) =>{
  
                balances.set(balance.token_identifier.rri, balance.value);       
                rris.push(balance.token_identifier.rri)
                
            } );
  
          setBalances(balances);
  
           var initialSymbolToRRIMap = new Map();
           initialSymbolToRRIMap.set("XRD" + " (" + shortenAddress("xrd_rr1qy5wfsfh") + ")","xrd_rr1qy5wfsfh")
  
           var initialIconsMap = new Map();
           initialIconsMap.set("XRD" + " (" + shortenAddress("xrd_rr1qy5wfsfh") + ")", "https://assets.radixdlt.com/icons/icon-xrd-32x32.png")
  
           var initialNamesMap = new Map();
           initialNamesMap.set("XRD" + " (" + shortenAddress("xrd_rr1qy5wfsfh") + ")", "Radix")
  
           var initialTokenCnts = new Map();
           initialTokenCnts.set("XRD", 1)
  
          var appendStr = "";
  
          getTokenSymbols(gatewayIdx, defaultRri, setGettingBalances, rris, symbols, initialSymbolToRRIMap, setSymbols, setSymbolToRRI,setPrivKey_enc,setPublic_key, initialIconsMap, setIconURIs, initialNamesMap, setTokenNames, initialTokenCnts, appendStr)     
  
          }
        }).catch((error) => {
          console.error(error);
          setNewGatewayIdx(gatewayIdx);
        });
  
}
  
export function finalizeTxn(gatewayIdx, setSubmitEnabled, unsigned_transaction, public_key, finalSig, setShow, setTxHash){
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
         setSubmitEnabled(true);
      
        }).catch((error) => {
          console.error(error);
          setNewGatewayIdx(gatewayIdx);
        });
}