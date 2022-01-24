import React, {useState, useRef, useEffect} from 'react';
import { Keyboard, TouchableOpacity, TouchableHighlight, Linking, Alert, ScrollView, Image, Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { decrypt } from '../helpers/encryption';
var SQLite = require('react-native-sqlite-storage');
import PasswordInputText from 'react-native-hide-show-password-input';
import { catchError } from 'rxjs/operators';
import SelectDropdown from 'react-native-select-dropdown'
import { Input, Icon } from 'react-native-elements';
import IconIonicons from 'react-native-vector-icons/Ionicons';
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
var Raddish = require("../assets/radish_nobackground.png");
import { Separator, SeparatorBorder, SeparatorBorderMargin } from '../helpers/jsxlib';
import { shortenAddress, useInterval, openCB, errorCB, copyToClipboard } from '../helpers/helpers';

var radio_props = [
  {label: 'Yes', value: true },
  {label: 'No', value: false }
];


function startTxn(public_key, privKey_enc, setShow, setTxHash, sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, tknGranularity ){
  //  settknName, settknDesc,settknIconUrl, settknUrl, settknSymbol, settknIsSuppMut, settknSupply, settknRRI, 

  if(tknName == undefined || tknDesc  == undefined || tknIconUrl == undefined || tknUrl == undefined || 
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




function getStakeData(currAddr, setValAddr, setStakingScreenActive, setStakeValidators, setValidatorData, setTotalUnstaking, setRenderedStakeValidatorRows){

  fetch('https://mainnet-gateway.radixdlt.com/account/stakes', {
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
          // "address": currAddr
          "address": "rdx1qspnfus07y7pjcy8ez4alquuuxhzma5gwd5mk25czlacv7pz2x2nw4q0h87mn"
        }
      }
    )
  }).then((response) => response.json()).then((json) => {
      // alert(JSON.stringify(json))
     
    if(json.code == 400 || json.code == 500){
      // alert(JSON.stringify(json.message));
     }
     else{
      var stakeValidatorsArr = []

       json.stakes.forEach(element => {
        stakeValidatorsArr.push({address: element.validator_identifier.address, delegated_stake: element.delegated_stake.value})
       });
      //  alert(JSON.stringify(stakeValidatorsArr));
       setStakeValidators(stakeValidatorsArr);

       getValidatorData(currAddr, setValAddr, setStakingScreenActive, stakeValidatorsArr, setValidatorData, new Map(), setTotalUnstaking, setRenderedStakeValidatorRows)
    }
  }).catch((error) => {
      console.error(error);
  });
 
}


function getValidatorData(currAddr, setValAddr, setStakingScreenActive, stakeValidators, setValidatorData, inputMap, setTotalUnstaking, setRenderedStakeValidatorRows){

  var origStakeValidators = stakeValidators.slice();
  // alert("GV SL Len: "+stakeValidators.length)
  if(stakeValidators.length>0){
    // alert("stakeValidators: "+JSON.stringify(stakeValidators))

  var validatorAddr = stakeValidators.pop().address;
  // alert("val addr: "+validatorAddr)
  var validatorData = new Map(inputMap);

  fetch('https://mainnet-gateway.radixdlt.com/validator', {
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
        "validator_identifier": {
          "address": validatorAddr
        }
      }
    )
  }).then((response) => response.json()).then((json) => {
   
    if(json.code == 400 || json.code == 500){
      // alert(JSON.stringify(json.message));
     }
     else{

        validatorData.set(validatorAddr, json.validator.properties);
 console.log(stakeValidators.length)
       if(stakeValidators.length==0){
        // alert(JSON.stringify(json))
     
         setValidatorData(validatorData)

         getUnstakeData(currAddr, setValAddr, setStakingScreenActive, setTotalUnstaking, setRenderedStakeValidatorRows, origStakeValidators, validatorData)
         
       } else{
        getValidatorData(currAddr, setValAddr, setStakingScreenActive, stakeValidators, setValidatorData, validatorData, setTotalUnstaking, setRenderedStakeValidatorRows)
       }
    }
  }).catch((error) => {
      console.error(error);
  });

}
 
}


function getUnstakeData(currAddr, setValAddr, setStakingScreenActive, setTotalUnstaking, setRenderedStakeValidatorRows, stakeValidators, validatorData){
 
  fetch('https://mainnet-gateway.radixdlt.com/account/unstakes', {
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
          // "address": currAddr
          "address": "rdx1qspnfus07y7pjcy8ez4alquuuxhzma5gwd5mk25czlacv7pz2x2nw4q0h87mn"
        }
      }
    )
  }).then((response) => response.json()).then((json) => {
      // alert(JSON.stringify(json))
     
    if(json.code == 400 || json.code == 500){
      // alert(JSON.stringify(json.message));
     }
     else{
      var totalUnstaking = 0

       json.unstakes.forEach(element => {
        totalUnstaking = totalUnstaking + element.unstaking_amount.value
       });

       setTotalUnstaking(totalUnstaking);

       setRenderedStakeValidatorRows(renderStakeValidatorRows(setValAddr, setStakingScreenActive, stakeValidators, validatorData))
  }
  }).catch((error) => {
      console.error(error);
  });
 
}



function renderStakeValidatorRows(setValAddr, setStakingScreenActive, stakeValidators, validatorData){

  // alert("stked val len: " + stakeValidators.length);
  if( stakeValidators.length > 0  && validatorData.size > 0){

      var rows = []

      stakeValidators.forEach((validatorDetails) =>  
 {

  try{
    //  alert("Val deets: "+JSON.stringify(validatorDetails))
          rows.push(
             
          <View key={validatorDetails.address}>



<View>
    {/* <View style={styles.addrRowStyle}> */}

    <Text style={{color:"black",flex:1,marginTop:0,fontSize:14,justifyContent:'flex-start' }}>{validatorData.get(validatorDetails.address).name}</Text>
    <Text style={{color:"black",flex:1,marginTop:0,fontSize:14,justifyContent:'flex-start' }}>Staked: {Number(validatorDetails.delegated_stake/1000000000000000000).toLocaleString()} XRD</Text>
    <Text style={{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end' }}>Fee: {validatorData.get(validatorDetails.address).validator_fee_percentage}%</Text>
    <Text style={{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end' }}>Addr: {shortenAddress(validatorDetails.address)}</Text>

    <View style={styles.rowStyle}>
    <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(validatorDetails.address)}}>
    < Text style={{color:"blue",marginTop:0,fontSize:14, justifyContent:'flex-end' }}>[Copy Address]</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={ () => {setValAddr(validatorDetails.address); setStakingScreenActive(false)}}>
    < Text style={{color:"blue",marginTop:0,fontSize:14, justifyContent:'flex-end' }}>  [Reduce Stake]</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={ () => {setValAddr(validatorDetails.address); setStakingScreenActive(true)}}>
    < Text style={{color:"blue",marginTop:0,fontSize:14, justifyContent:'flex-end' }}>  [Add to Stake]</Text>
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

  }

}







 const Staking = ({route, navigation}) => {
 
  const { currAddr,currLiqBal, currStaked } = route.params;

  const [privKey_enc, setPrivKey_enc] = useState();
  const [public_key, setPublic_key] = useState();
  const [sourceXrdAddr, setSourceXrdAddr] = useState();
  const [tknName, settknName] = useState("rdx2343422332423434323432434234423342234324");
    const [tknDesc, settknDesc] = useState();
      const [tknIconUrl, settknIconUrl] = useState();
        const [tknUrl, settknUrl] = useState();
          const [tknSymbol, settknSymbol] = useState();
            const [tknIsSuppMut, settknIsSuppMut] = useState(true);
              const [tknSupply, settknSupply] = useState();
                const [txnHash, setTxHash] = useState(null);
                const [show, setShow] = useState(false);
                const [tknGranularity, settknGranularity] = useState(1);

                const [totalUnstaking, setTotalUnstaking] = useState(0);
                const [stakeValidators, setStakeValidators] = useState([]);
                const [validatorData, setValidatorData] = useState(new Map());
                const [renderedStakeValidatorRows, setRenderedStakeValidatorRows] = useState([]);
                const [valAddr, setValAddr] = useState();
                const [stakingScreenActive, setStakingScreenActive] = useState(true);
                const [unstakeAmt, setUnstakeAmt] = useState();

  const stakeValRef = useRef();
  const stakeAmtRef = useRef();
  const unstakeValRef = useRef();
  const unstakeAmtRef = useRef();


  useEffect(() => {

    getStakeData(currAddr, setValAddr, setStakingScreenActive, setStakeValidators, setValidatorData, setTotalUnstaking, setRenderedStakeValidatorRows)
}, []);


// useEffect(() => {
//   alert("3")
  
//   setRenderedStakeValidatorRows(renderStakeValidatorRows(stakeValidators, validatorData))
// }, [stakeValidators, validatorData]);


 
 return ( 
  <ScrollView style={{backgroundColor:"white"}}> 
     <Separator/>
     <View style={styles.addrRowStyle}>
     <TouchableHighlight 
     activeOpacity={0.6}
     underlayColor="#DDDDDD"
     style={styles.button} onPress={() => {setStakingScreenActive(true)}}>
  <Text style={{marginHorizontal: 0, fontSize:22, color:"blue", textAlign:"center", alignSelf:'center', textDecorationLine: stakingScreenActive? 'underline' : 'none'}}>Staking</Text>
</TouchableHighlight>
<Text style={{marginHorizontal: 0, fontSize:22, color:"blue", textAlign:"center", alignSelf:'center'}}>    </Text>
<TouchableHighlight 
activeOpacity={0.6}
underlayColor="#DDDDDD"
style={styles.button} onPress={() => {setStakingScreenActive(false)}}>
  <Text style={{marginHorizontal: 0, fontSize:22, color:"blue", textAlign:"center", alignSelf:'center', textDecorationLine: stakingScreenActive? 'none' : 'underline'}}>Unstaking</Text>
  </TouchableHighlight>
    </View>

{stakingScreenActive && <React.Fragment>
  <View style={styles.container}>
<Text style={{textAlign:'left', marginHorizontal: 0, fontSize:20, fontWeight:'bold', alignSelf:'center'}}>Stake</Text>
      
       <LinearGradient colors={['#183A81','#4DA892', '#4DA892']} useAngle={true} angle={11} style={styles.surface}>
       <Image style={{margin: 0, width: 50, height: 70, marginBottom:4, alignSelf:'center'}}
    source={Raddish}/>
       <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12, color:"white", textAlign:"center", alignSelf:'center'}}>Please consider staking with Raddish.io to support products like this wallet app and more to come!{"\n"}We are a top validator with a low 1% fee!{"\n"}{"\n"}Any stakes of 100 XRD or greater to the Raddish.io validator will enable the{"\n"}BONUS SECTION: "TOKEN CREATOR" in this app!</Text>
       </LinearGradient>
       <Separator/>
       <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12, fontWeight:"bold"}}>Current Address: {currAddr}</Text>
     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Current Liquid Balance: {Number(currLiqBal/1000000000000000000).toLocaleString()} XRD</Text>
     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Current Staked Balance: {Number(currStaked/1000000000000000000).toLocaleString()} XRD</Text>
     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Current Unstaking Balance: {Number(totalUnstaking/1000000000000000000).toLocaleString()} XRD</Text>
     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Total Balance: {Number((currLiqBal+currStaked)/10000000000000000000).toLocaleString()} XRD</Text>
     <Separator/>
      <View style={styles.rowStyle}>
     <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12, flex:1}}>Validator Address (Default: Raddish.io):</Text>
     <Text
       style={{color: 'blue', textAlign: "center" , fontSize:12, flex:0.5}}
       onPress={() => {Linking.openURL('https://explorer.radixdlt.com/#/validators')}}
     >
       [Validator List]
     </Text>
     </View>
     <View style={styles.rowStyle}>
 
        <TextInput ref={stakeValRef}
        style={{padding:8, borderWidth:StyleSheet.hairlineWidth, height:44, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        multiline={true}
        numberOfLines={4}
        placeholder='Validator Address'
        placeholderTextColor="#d3d3d3"
        value={valAddr}
        maxLength={199}
        onChangeText={value => setValAddr(value)}
      />
      </View>
      <Separator/>

      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Amount to Stake:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={stakeAmtRef}
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:300, backgroundColor:"white", flex:0.5}}
        disabled="false"
        autoCapitalize='none'
        placeholder='Amount'
        placeholderTextColor="#d3d3d3"
        value={tknSupply}
        onChangeText={value => settknSupply(value)}
      />
      </View>

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
  startTxn(public_key, privKey_enc, setShow, setTxHash,sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, tknGranularity )}}>

        <View style={styles.sendRowStyle}>
        <IconIonicons name="arrow-down-circle-outline" size={20} color="black" />
        <Text style={{fontSize: 18, color:"black"}}> Stake</Text>
        </View>
        </TouchableOpacity>
 

           
</View>
</React.Fragment>
}



{stakingScreenActive==false && <React.Fragment>
<View style={styles.container} > 
    
      
      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:20, fontWeight:'bold', alignSelf:'center'}}>Unstake</Text>
       <Separator/>
  
    
       <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Validator to unstake from:</Text>
        <TextInput ref={unstakeValRef}
        style={{padding:8, borderWidth:StyleSheet.hairlineWidth, height:44, width:300, backgroundColor:"white", flex:1}}
        disabled="false"
        autoCapitalize='none'
        multiline={true}
        numberOfLines={4}
        placeholder='Validator Address'
        placeholderTextColor="#d3d3d3"
        value={valAddr}
        maxLength={199}
        onChangeText={value => setValAddr(value)}
        // leftIcon={{ type: 'font-awesome', name: 'chevron-left' }}
      />
     
      <Separator/>

      <Text style={{textAlign:'left', marginHorizontal: 0, fontSize:12}}>Amount to Unstake:</Text>
     <View style={styles.rowStyle}>
 
        <TextInput ref={unstakeAmtRef}
        style={{padding:4, borderWidth:StyleSheet.hairlineWidth, height:30, width:300, backgroundColor:"white", flex:0.5}}
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
<TouchableOpacity style={styles.button} onPress={() => {
     tknNameRef.current.blur();
     tknDescRef.current.blur();
     tknSymbolRef.current.blur();
     tknIconURLRef.current.blur();
     tknURLRef.current.blur();
     tknSupplyRef.current.blur();
     Keyboard.dismiss;
  startTxn(public_key, privKey_enc, setShow, setTxHash,sourceXrdAddr, tknName, tknDesc,tknIconUrl, tknUrl, tknSymbol, tknIsSuppMut, tknSupply, tknGranularity )}}>
        <View style={styles.sendRowStyle}>
        <IconIonicons name="arrow-up-circle-outline" size={20} color="black" />
        <Text style={{fontSize: 18, color:"black"}}> Unstake</Text>
        </View>
        </TouchableOpacity>

</View>

</React.Fragment>
}

<View style={styles.container} > 
<Text style={{fontSize: 16, color:"black"}}>Current Stakes</Text>
              <SeparatorBorderMargin/>
{renderedStakeValidatorRows}
</View>
 
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
<Separator/>
<Separator/>
<Separator/>
<Separator/>
<Separator/>
<Separator/>
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
});

export default Staking;
