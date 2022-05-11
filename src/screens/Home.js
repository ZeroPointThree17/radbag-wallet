import { RefreshControl, TextInput, Image, useColorScheme,ScrollView, TouchableOpacity, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
var GenericToken = require("../assets/generic_token.png");
var GenericTokenInverted = require("../assets/generic_token_inverted.png");
 var SQLite = require('react-native-sqlite-storage');
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import NetInfo from "@react-native-community/netinfo";
import { StackActions } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import IconFeather from 'react-native-vector-icons/Feather';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Progress from 'react-native-progress';
import { Separator } from '../helpers/jsxlib';
import { getAppFont, shortenAddress, useInterval, openCB, errorCB, copyToClipboard, formatNumForHomeDisplay, formatCurrencyForHomeDisplay, currencyList, setNewGatewayIdx } from '../helpers/helpers';
import { ifError } from 'assert';
var VerifiedIcon = require("../assets/check.png");
var WarningIcon = require("../assets/alert.png");
var bigDecimal = require('js-big-decimal');
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchList from 'react-native-search-list';



function getPrices(setTokenPrices, getCurrData, setCurrValue, setCurrLabel){
   
   fetch('https://raddish-node.com:8082/rad_token_prices', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json()).then((json) => {

      setTokenPrices(json);
      getCurrData(setCurrValue, setCurrLabel);
        
    }).catch((error) => {
      setTokenPrices(undefined);
      getCurrData(setCurrValue, setCurrLabel);
    })
}



    const SeparatorBorder = () => (
    <View style={styles.separatorBorder} />
    );

function getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances) {

    db.transaction((tx) => {

        tx.executeSql("SELECT * FROM wallet", [], (tx, results) => {
          var len = results.rows.length;
          var wallets = [];
          var hwWallets = []
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);

                var suffix = ""
               
                if(row.mnemonic_enc == "HW_WALLET"){
                  suffix = " [HARDWARE]"
                  hwWallets.push(row.id)
                }

                var data = {label: row.name + suffix, value: row.id}
                 wallets.push(data);
            }
            
             setWallets(wallets);
    
             getActiveWallet(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, db, setActiveWallet,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances, hwWallets, setIsHW);
             
             console.log("inside get wallets");
      }, errorCB);
        });
        
}

function getEnabledAddresses(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, wallet_id,db,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){

        var addresses = new Map();

            db.transaction((tx) => {
    
            tx.executeSql("SELECT * FROM address WHERE wallet_id='"+wallet_id+"' AND enabled_flag='1'", [], (tx, results) => {

          var len = results.rows.length;
      
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);
                    var addrLabel = row.name + " - " + shortenAddress(row.radix_address);
                    var data = {label: addrLabel, value: row.id, radix_address:row.radix_address}
                    addresses.set(row.id, data);
            }

            setEnabledAddresses(addresses);
            getActiveAddress(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, db, setActiveAddress, addresses, addressBalances, setAddressBalances);

          }, errorCB); 
        });
}

function addAddress(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, wallet_id,db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){

    db.transaction((tx) => {

        tx.executeSql("SELECT MIN(id) AS id FROM address WHERE wallet_id='"+wallet_id+"' AND enabled_flag='0'", [], (tx, results) => {
          var len = results.rows.length;
          var next_id = 0;
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);
                    next_id = row.id;
             }

            if(next_id === null){
                alert("You cannot have more than 15 addresses per wallet");
            } else{
            db.transaction((tx) => {
                tx.executeSql("UPDATE address SET enabled_flag=1 WHERE wallet_id='"+wallet_id+"' AND id='"+next_id+"'", [], (tx, results) => {
                  
                  updateActiveAddress(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, next_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);

                  }, errorCB);
                });
            }
          }, errorCB);
        });

}


function renderAddressRows(tokenFilter, isFocus, setIsFocus, storeCurrData, setCurrLabel, setCurrValue, currLabel, tokenPrices, currValue, balances, stakedAmount, liquid_rdx_balance, navigation, enabledAddresses, activeAddress, hdpathIndexInput, isHW){

    if( balances.size > 0 && enabledAddresses.size > 0 ){

        var totalWalletValue = new bigDecimal(0);
        var rows = []
        var xrdRow = []      
        var symbolCnts = new Map();
        var blackListed = "rpg_rr1q0zrguwzdze0kpqfcr7lk8lfwlx6hxx7kjf46tcava4q99dj6h";
        var possScamToken = false;
        var appendStr = ""

        // balances.forEach((balance, rri) =>  {
        //   symbolCnts.set(balance[1],0)
        // })

        // var newBalances = new Map([...balances.entries()].sort((a, b) => b[1].toString().toUpperCase() < a[1].toString().toUpperCase()));

        // var balancesSorted = Array.from(balances.values());

        // var ordered = []
      
        // // Array.from(balances.values()).forEach( (balance) => {ordered.push(balance[2].toUpperCase())})
        // Array.from(balances.values()).forEach( (balance) => {ordered.push(balance[2].toUpperCase())})


      var balancesArry = Array.from(balances.entries())

      balancesArry.sort(function(a, b){
          return a[1][2].toUpperCase() > b[1][2].toUpperCase();
      });

      // alert(JSON.stringify(balancesJSON))
        // ordered.forEach( (name) => {ordered.push(balance[2].toUpperCase())})

      //   balances[Symbol.iterator] = function* () {
      //     yield* [...this.entries()].sort((a, b) => a[1][2] - b[1][2]);
      // }

      // alert(balances.keys())

      balancesArry.forEach((entry) =>  
   {

    var balance = entry[1]
    var rri = entry[0]

    if(!balance[2].toUpperCase().includes(tokenFilter.toUpperCase()) 
        && !balance[1].toUpperCase().includes(tokenFilter.toUpperCase())
          // && !rri.toUpperCase().includes(tokenFilter.toUpperCase())
          ){
      return;
    }

    try{
// alert(balance[2])
      var symbol = balance[1];

      // symbolCnts.set(balance[1],symbolCnts.get(balance[1])+1)

      // // alert(symbolCnts.get(balance[1]))
      // if(symbolCnts.get(balance[1]) > 1){
      //   appendStr = symbolCnts.get(balance[1]);

      //   for(let cnt = 0; cnt < parseInt(symbolCnts.get(balance[1])); cnt++){
      //     //  alert(cnt)

      //     if(Platform.OS === 'ios'){
      //       symbol = symbol + " ";
      //     } else{
      //       symbol = " " + symbol + " ";
      //     }
          
      //   }
      // }

      // alert(symbol)
      // alert(balance[1] + "|"+symbolCnts.get(balance[1]));

      if(rri=="xrd_rr1qy5wfsfh"){

        var xrdPrice = undefined;

        if(tokenPrices !=undefined){

          xrdPrice = tokenPrices.radix[currValue]

          totalWalletValue = totalWalletValue.add(new bigDecimal(balance[0]).multiply(new bigDecimal(xrdPrice)))
          
        }
         
        // var finalNum = new bigDecimal(bigDecimal.multiply(balance[0],0.000000000000000001,1800));
        //  alert(balance[0].getPrettyValue())

        xrdRow.push(
               
            <View key={rri}>

   <SeparatorBorder/>
    <TouchableOpacity disabled={isNaN(stakedAmount)} onPress={ () => {navigation.navigate('Send',{defaultRri: "xrd_rr1qy5wfsfh", defaultSymbol: balance[1] + " (" + shortenAddress(rri) + ")", sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address, hdpathIndex: hdpathIndexInput, isHWBool: isHW})}}>

    <View style={styles.addrRowStyle}>


    {/* <ImageBackground
    style={{
      width: 36,
      height: 36,
      justifyContent: "flex-start",
     
    }}
    source={
      require("../assets/generic_token.png") //Indicator
    }> */}
    {/* {checkImageURL(balance[3])} */}
  <Image style={{width: 36, height: 36,  justifyContent: "flex-start", alignSelf:"flex-start"}}
  defaultSource={global.isDarkMode ? GenericTokenInverted : GenericToken}
  source={{uri: balance[3]}} />
    
    {/* </ImageBackground> */}

    <View style={{flex:1.8}}>
        <Text style={[{color:"black",marginTop:0,fontSize:14,justifyContent:'flex-start',paddingLeft: 10},getAppFont("black")]}>{balance[2]} ({symbol.trim()}) </Text>
        <Text style={[{fontSize:12,paddingLeft: 10},getAppFont("black")]}>{"Token RRI: "+shortenAddress(rri)} </Text>
        </View>
    {/* <Text style={{color:"black",marginTop:0,fontSize:14,justifyContent:'flex-start', fontFamily:"AppleSDGothicNeo-Regular"}}>  Warning</Text> */}
    <View style={{flex:1.7}}>
    <Text style={[{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end', textAlign:"right"},getAppFont("black")]}>{ formatNumForHomeDisplay(balance[0]) } {balance[1]}</Text>
    {xrdPrice && <Text style={[{color:"black",marginTop:0,fontSize:12, textAlign:"right"},getAppFont("black")]}>{ formatCurrencyForHomeDisplay(new bigDecimal(balance[0]).multiply(new bigDecimal(xrdPrice)).getValue(), currValue==undefined?"USD":currValue.toUpperCase())}</Text>}
    </View> 
    </View> 
    </TouchableOpacity>
    </View>        )
      } else{


        var dogecubePrice = undefined;
  
        if(rri=="dgc_rr1qvnre767vp607yr9pqzqhlprg72q2ny5pj4agn53k0pqy6huxw"){

          if(tokenPrices !=undefined){
  
            dogecubePrice = tokenPrices.dogecube[currValue]
            // alert(dogecubePrice)
            totalWalletValue = totalWalletValue.add(new bigDecimal(balance[0]).multiply(new bigDecimal(dogecubePrice)))
          
          }
        }

        if(rri == blackListed){
          possScamToken = true;
        } else {
          possScamToken = false;
        }

        rows.push(
               
          <View key={rri}>

 <SeparatorBorder/>
  <TouchableOpacity disabled={isNaN(stakedAmount)} onPress={ () => {navigation.navigate('Send',{defaultRri: rri, defaultSymbol: symbol  + " (" + shortenAddress(rri) + ")", sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address, hdpathIndex: hdpathIndexInput, isHWBool: isHW})}}>

  <View style={styles.addrRowStyle}>

  {/* <ImageBackground
    style={{
      width: 36,
      height: 36,
      justifyContent: "flex-start",
     
    }}
    source={
      require("../assets/generic_token.png") //Indicator
    }> */}
  <Image style={{width: 36, height: 36,  justifyContent: "flex-start", alignSelf:"flex-start"}}
  defaultSource={global.isDarkMode ? GenericTokenInverted : GenericToken}
  source={{uri: balance[3]}} />
    {/* </ImageBackground> */}

    <View style={{flex:2}}>
        <Text style={[{color:"black",marginTop:0,fontSize:14,justifyContent:'flex-start',paddingLeft: 10},getAppFont("black")]}>{balance[2]} ({symbol.trim()}) </Text>
        <Text style={[{fontSize:12,paddingLeft: 10},getAppFont("black")]}>{"Token RRI: "+shortenAddress(rri)} </Text>
        </View>
    {/* <Text style={{color:"black",flex:1,marginTop:0,fontSize:14,justifyContent:'flex-start', fontFamily:"AppleSDGothicNeo-Regular"}}>  {balance[2]}  <Text style={{fontSize:12}}>{"\n   rri: "+shortenAddress(rri) + "\n "} </Text><Image style={possScamToken?{width:12, height:12}:{width:0, height:0}} source={possScamToken?WarningIcon:null} /><Text style={possScamToken?{color:"red",marginTop:0,fontSize:12}:null}> {possScamToken?"WARNING: Possible scam token!":null}</Text></Text> */}
  <View style={{ textAlign:"right", flex:1.5}}>
  <Text style={[{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end', textAlign:"right"},getAppFont("black")]}>{ formatNumForHomeDisplay(balance[0]) } {symbol.trim()}</Text>
  {dogecubePrice && <Text style={[{color:"black",marginTop:0,fontSize:12, textAlign:"right"},getAppFont("black")]}>{ formatCurrencyForHomeDisplay(new bigDecimal(balance[0]).multiply(new bigDecimal(dogecubePrice)).getValue(), currValue==undefined?"USD":currValue.toUpperCase())}</Text>}
   
  {/* <Text style={[{color:"black",marginTop:0,fontSize:9, textAlign:"right"},getAppFont("black")]}>$1,213.34 USD</Text> */}
  </View> 
  </View> 
  </TouchableOpacity>
  </View>        )

      }
    }    
    catch(err){
        console.log(err)
   }
   })
           
    var headerRow = []


    if(tokenPrices !=undefined){
    headerRow.push(
     <View key={9999} style={styles.rowStyleHeader}>
<View style={{
        borderRadius: 9,
        justifyContent: 'center',
        marginBottom: 0
      }}>
<Text style={[{fontSize: 12}, getAppFont("black")]}>Value: {formatCurrencyForHomeDisplay(totalWalletValue.getValue(), currValue==undefined?"USD":currValue.toUpperCase())}</Text>
      </View>
      <Dropdown
         style={[getAppFont("black"), styles.dropdown2, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={[styles.placeholderStyle2,getAppFont("black"),{textAlign: "right"}]}
          selectedTextStyle={[styles.selectedTextStyle2,getAppFont("black"),{textAlign: "right"}]}
          inputSearchStyle={[styles.inputSearchStyle,getAppFont("black")]}
          iconStyle={[styles.iconStyle,getAppFont("black")]}
          containerStyle ={[getAppFont("black"), {backgroundColor: global.reverseModeTranslation}]}
          data={currencyList}
          activeColor="#4DA892"
          search
          maxHeight={300}
          // disable={true}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Prices in: ' : '...'}
          searchPlaceholder="Search..."
          label={currLabel}
          value={currValue}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            storeCurrData(item)
            setCurrLabel(item.label);
            setCurrValue(item.value);
            setIsFocus(true);
          }}
        />
      </View> )
    }

    // var searchList = []
    // searchList.push(
    //   <SearchList 
    //   style={{alignSelf: "center", backgroundColor:"#183A81"}}
    //   data={[]}
    //   renderRow={() => {}}
    //   renderEmptyResult={() => {renderEmpty()}}
    //   renderBackButton={() => null}
    //   renderEmpty={() => {}}

    //   rowHeight={12}

    //   // colors = {toolbarBackgroundColor='#183A81'}
    //   // toolbarWidth={'auto'}
    //   title='Token Search'
    //   cancelTitle='Cancel'
    //   onClickBack={() => {}}

    //   searchListBackgroundColor={'white'}
    //   searchListStyle={{width:'auto', backgroundColor:"#183A81", color:"#183A81"}}

    //   searchBarToggleDuration={300}
    //   searchInputStyle={{width:'auto'}}
    //   searchBarStyle={{width:'auto', backgroundColor:"#183A81", color:"#183A81"}}

    //   searchInputBackgroundColor={'white'}
    //   searchInputBackgroundColorActive={'#183A81'}
    //   searchInputPlaceholderColor={'#183A81'}
    //   searchInputTextColor={'#183A81'}
    //   searchInputTextColorActive={'#183A81'}
    //   searchInputPlaceholder='Search'
    //   sectionIndexTextColor={'#183A81'}
    //   searchBarBackgroundColor={'white'}
    // />
    // )

    // var alphabet = [];

    // alphabet.push(
    //   <View style = {styles.rowStyle}>
    //     <Text>A</Text><Text> </Text><Text>B</Text><Text> </Text>
    //     <Text>C</Text><Text> </Text><Text>D</Text><Text> </Text>
    //     <Text>E</Text><Text> </Text><Text>F</Text><Text> </Text>
    //     <Text>G</Text><Text> </Text><Text>H</Text><Text> </Text>
    //     <Text>I</Text><Text> </Text><Text>J</Text><Text> </Text>
    //     <Text>K</Text><Text> </Text><Text>L</Text><Text> </Text>
    //     <Text>M</Text><Text> </Text><Text>N</Text><Text> </Text>
    //   </View>
    // );

    return (headerRow.concat(xrdRow).concat(rows))

    }

}


function updateActiveWallet(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, wallet_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){

    var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

    db.transaction((tx) => {
        tx.executeSql("UPDATE active_wallet SET id = "+wallet_id, [], (tx, results) => {       
           setActiveWallet(wallet_id);
           db.transaction((tx) => {
            tx.executeSql("SELECT min(id) as id from address where wallet_id='"+wallet_id+"' and enabled_flag=1", [], (tx, results) => {
                var len = results.rows.length;
                      
                var address_id = 0;
                for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    address_id = row.id;
                }

                updateActiveAddress(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, address_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);

            }, errorCB);
    }); 
}, errorCB);
}); 
}

export function updateActiveAddress(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, address_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){
    db.transaction((tx) => {
        tx.executeSql("UPDATE active_address set id = '"+address_id+"'", [], (tx, results) => {
          AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
            
            getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
          })
        }, errorCB);
    }); 
}

function getActiveWallet(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, db,setActiveWallet,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances, hwWallets, setIsHW){
    db.transaction((tx) => {
        tx.executeSql("SELECT id FROM active_wallet", [], (tx, results) => {
        
                var len = results.rows.length;
                      
                var id = 0;
                for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    id = row.id;
                }

                setActiveWallet(id);

                if( hwWallets.includes(id) ){
                  setIsHW(true);
                } else{
                  setIsHW(false);
                }
          
                getEnabledAddresses(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, id,db,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);

        }, errorCB);
    }); 
}

function getActiveAddress(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, db, setActiveAddress, addresses, addressBalances, setAddressBalances){

    db.transaction((tx) => {
        tx.executeSql("SELECT id FROM active_address", [], (tx, results) => {
        
                var len = results.rows.length;
                      
                var id = 0;
                for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    id = row.id;
                }

                setActiveAddress(id);
                
                getBalances(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, addresses, id, addressBalances, setAddressBalances)


        }, errorCB);
    }); 
}

export class NetworkUtils {
    static async isNetworkAvailable() {
      const response = await NetInfo.fetch();
      return response.isConnected;
  }}

   function getTokenMetadata(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, uniqueRRIs, activeAddress, newAddrBalances, setAddressBalances){

     var rri = uniqueRRIs.pop();

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

          if(!(json === undefined) && json.code != 400 && json.ledger_state.epoch > 0 ){
            
            var newBalance = new Map(newAddrBalances);
            if(newBalance.get(activeAddress).staked_and_unstaking_balance.token_identifier.rri == rri){
                newBalance.get(activeAddress).staked_and_unstaking_balance.token_identifier['symbol'] =  json.token.token_properties.symbol
                newBalance.get(activeAddress).staked_and_unstaking_balance.token_identifier['icon_url'] = json.token.token_properties.icon_url;
                newBalance.get(activeAddress).staked_and_unstaking_balance.token_identifier['name'] = json.token.token_properties.name;

              }

            newBalance.get(activeAddress).liquid_balances.forEach( balance => {

                if(balance.token_identifier.rri == rri){
                    balance.token_identifier['symbol'] = json.token.token_properties.symbol;
                    balance.token_identifier['icon_url'] = json.token.token_properties.icon_url;
                    balance.token_identifier['name'] = json.token.token_properties.name;
                }


            })

            newBalance.forEach((b, active_address) => console.log("NB ("+active_address+"):"+JSON.stringify(b)))

            if(uniqueRRIs.length == 0){
              setAddressBalances(newBalance);
              getPrices(setTokenPrices, getCurrData, setCurrValue, setCurrLabel)
            } else{
              getTokenMetadata(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, uniqueRRIs, activeAddress, newBalance, setAddressBalances)
            }
  
             
          }
      }).catch((error) => {
        setNewGatewayIdx(gatewayIdx);
      });
 
  }
  
  async function getBalances(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, enabledAddresses, activeAddress, addressBalances, setAddressBalances){
   
    const isConnected = await NetworkUtils.isNetworkAvailable();
    // alert(gatewayIdx)
    // alert(global.gateways[gatewayIdx])
    if(isConnected){
    await fetch(global.gateways[gatewayIdx] + '/account/balances', {
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
                "address": enabledAddresses.get(activeAddress).radix_address
                // "address": "rdx1qspxwq6ejym0hqvtwqz6rkmfrxgegjf6y0mz63pveks7klunlgcdswgmrj34g"
              }
            }      
      
        )
      }).then((response) => response.json()).then((json) => {

        console.log("Get Balances call: "+JSON.stringify(json));
        
          if(!(json === undefined) && json.code != 400 && json.ledger_state.epoch > 0 ){
              var newAddrBalances = new Map(addressBalances);
              newAddrBalances.set(activeAddress,json.account_balances);
              var rris = [];
              rris.push(JSON.stringify(json.account_balances.staked_and_unstaking_balance.token_identifier.rri).replace(/["']/g, "")); 
              var liquid_balances = json.account_balances.liquid_balances
              liquid_balances.forEach( (element) => {
                  rris.push(JSON.stringify(element.token_identifier.rri).replace(/["']/g, ""))
               }
              )
      
               var uniqueRRIs = [...new Set(rris)]
               
               getTokenMetadata(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, uniqueRRIs, activeAddress, newAddrBalances, setAddressBalances);
          }
      }).catch((error) => {
        setNewGatewayIdx(gatewayIdx);
      });
    } else{
        // alert("No internet connection available. Please connect to the internet.");
    }
}

function getDDIndex(dropdownVals,activeAddress){

    for(var x = 0; x <dropdownVals.length ; x++){
        if(dropdownVals[x].value == activeAddress){
            return x;
        }
    }

    return 0;
}

function getWalletDDIndex(walletDropdownVals,activeWallet){

  for(var x = 0; x <walletDropdownVals.length ; x++){
      if(walletDropdownVals[x].value == activeWallet){
          return x;
      }
  }

  return 0;
}

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

const Home = ({route, navigation}) => {

    const [refreshing, setRefreshing] = React.useState(false);

    var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

    var initialEnabledAddresses = new Map();
    initialEnabledAddresses.set(1,{label: "Setting up...", value:""})
    const [addressBalances, setAddressBalances] = useState(new Map())
    const [wallets, setWallets] = useState([{label: "Setting up...", value:""}]);
    const [isFocus, setIsFocus] = useState(false);
    const [label, setLabel] = useState();
    const [value, setValue] = useState();
    const [currLabel, setCurrLabel] = useState();
    const [currValue, setCurrValue] = useState();
    const [isFocusAddr, setIsFocusAddr] = useState(false);
    const [labelAddr, setLabelAddr] = useState();
    const [valueAddr, setValueAddr] = useState();
    const [activeWallet, setActiveWallet] = useState(1);
    const [activeAddress, setActiveAddress] = useState(1);
    const [enabledAddresses, setEnabledAddresses] = useState(initialEnabledAddresses);
    const [addressRRIs, setAddressRRIs] = useState(new Map())
    const [isHW, setIsHW] = useState()
    const [historyRows, setHistoryRows] = useState();
    const [tokenPrices, setTokenPrices] = useState();
    const [tokenFilter, setTokenFilter] = useState("");
    global.isDarkMode = useColorScheme() === 'dark';
    global.modeTranslation = useColorScheme() === 'dark' ? "white" : "black";
    global.reverseModeTranslation = useColorScheme() === 'dark' ? "black" : "white";
 

    const storeCurrData = async (json, setCurrValue, setCurrLabel) => {
      try {
        const jsonValue = JSON.stringify(json)
        await AsyncStorage.setItem('@fiatCurrencySelected', jsonValue)
        setCurrValue(json.value);
        setCurrLabel(json.label);
      } catch (e) {
        console.log(e)
      }
    }
  
    const getCurrData = async (setCurrValue, setCurrLabel) => {
      try {

        var jsonValue = await AsyncStorage.getItem('@fiatCurrencySelected')

        if(jsonValue == undefined) {
          jsonValue = '{ "label" : "Fiat Prices in: USD", "value" : "usd" }';
          await AsyncStorage.setItem('@fiatCurrencySelected', jsonValue)
        }

        setCurrValue(JSON.parse(jsonValue).value);
        setCurrLabel(JSON.parse(jsonValue).label);
      } catch(e) {
        console.log(e)
      }
    }



    const onRefresh = React.useCallback(() => {
      AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
            
      getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
      setRefreshing(true);
      wait(500).then(() => setRefreshing(false));
  })
     }, []);


    var dropdownVals = []
    var walletDropdownVals = []  
 
    // walletDropdownVals[getWalletDDIndex(walletDropdownVals,activeWallet)]

    enabledAddresses.forEach((element, id)=> 
        {
        console.log("EnabledAddress: "+JSON.stringify(element));
        dropdownVals.push(element);

        }
    )

    wallets.forEach((element)=> 
    {
    console.log(JSON.stringify(element));
    walletDropdownVals.push(element);

    }
)
        useEffect(() => {
          AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
            
          getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
          // fetchTxnHistory(enabledAddresses.get(activeAddress).radix_address, setHistoryRows)
        })
        }, []);


        useInterval(() => {
          AsyncStorage.getItem('@gatewayIdx').then( (gatewayIdx) => {
    
          getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)    
          // fetchTxnHistory(enabledAddresses.get(activeAddress).radix_address, setHistoryRows)
        })
        }, 10000);

        // useEffect(() => {
          
        // }, []);

        // useInterval(() => {
        //   getPrices(setTokenPrices, getCurrData, setCurrValue, setCurrLabel)
        // }, 10000);
        

   var balances = new Map();
    if( addressBalances.size > 0 && activeAddress != undefined ){

    var liquid_rdx_balance = 0;

    addressBalances.forEach((balance, active_address) => {console.log("INITIAL BALANCES ("+active_address+"): "+JSON.stringify(balance))})
    console.log("Active Address ID: " + activeAddress)
    if(!(addressBalances.get(activeAddress) == undefined)){
     
    addressBalances.get(activeAddress).liquid_balances.forEach(balance =>  {
  
   console.log("Balance: "+JSON.stringify(balance))
        balances.set(JSON.stringify(balance.token_identifier.rri).replace(/["']/g, ""),[
            JSON.stringify(balance.value).replace(/["']/g, ""),
             JSON.stringify(balance.token_identifier.symbol).replace(/["']/g, "").toUpperCase(),
             JSON.stringify(balance.token_identifier.name).replace(/["']/g, ""),
            JSON.stringify(balance.token_identifier.icon_url).replace(/["']/g, "") ])

            if(JSON.stringify(balance.token_identifier.rri).replace(/["']/g, "") == 'xrd_rr1qy5wfsfh'){
                liquid_rdx_balance = JSON.stringify(balance.value).replace(/["']/g, "");
                
            }
     
    }

    );

   

    var stakedAmount = JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.value).replace(/["']/g, "");
    var stakedTokenIdentifier = JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.token_identifier.rri).replace(/["']/g, "");


        if(!(balances.get(stakedTokenIdentifier) == undefined) ){
            // alert((new bigDecimal(balances.get(stakedTokenIdentifier)[0]).add(new bigDecimal(stakedAmount))).getValue())
          balances.set(stakedTokenIdentifier,[(new bigDecimal(balances.get(stakedTokenIdentifier)[0]).add(new bigDecimal(stakedAmount))).getValue(),balances.get(stakedTokenIdentifier)[1],balances.get(stakedTokenIdentifier)[2],balances.get(stakedTokenIdentifier)[3]]);
        } else{
            balances.set(stakedTokenIdentifier,[stakedAmount,
                
                JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.token_identifier.symbol).replace(/["']/g, "").toUpperCase(),

                JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.token_identifier.name).replace(/["']/g, ""),
               JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.token_identifier.icon_url).replace(/["']/g, "") ])
      
        }
    }
}

//  alert(isHW)

console.log("WALLETS: "+JSON.stringify(wallets));

// alert(JSON.stringify(getCurrData()));


  return (

    <SafeAreaView style={styles.containerMain}>
        <ScrollView style={[styles.scrollView, {backgroundColor: global.reverseModeTranslation}]} 
        refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}/>
            }>
            <View  > 
                
                <View style={styles.rowStyle}>

                
                <LinearGradient colors={[global.appBlue,global.appGreen, global.appGreen]} useAngle={true} angle={11} style={styles.surface}>
            
                {/* <LinearGradient colors={['#183A81','#4DA892', '#4DA892']} useAngle={true} angle={11} style={styles.surface}> */}
            
            <View style={styles.rowStyle}>
<Dropdown
         style={[getAppFont("white"), styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={[styles.placeholderStyle,getAppFont("white")]}
          selectedTextStyle={[styles.selectedTextStyle,getAppFont("white")]}
          inputSearchStyle={[styles.inputSearchStyle,getAppFont("white")]}
          iconStyle={[styles.iconStyle,getAppFont("white")]}
          containerStyle ={[styles.containerStyle,getAppFont("white")]}
          data={walletDropdownVals}
          activeColor="#4DA892"
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Wallet' : '...'}
          searchPlaceholder="Search..."
          label={walletDropdownVals[getWalletDDIndex(walletDropdownVals,activeWallet)] == undefined ? "Setting up..." : walletDropdownVals[getWalletDDIndex(walletDropdownVals,activeWallet)].label}
          value={walletDropdownVals[getWalletDDIndex(walletDropdownVals,activeWallet)] == undefined ? "Setting up..." : walletDropdownVals[getWalletDDIndex(walletDropdownVals,activeWallet)].value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            updateActiveWallet(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, item.value, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);
            setLabel(item.label);
            setValue(item.value);
            setIsFocus(true);
          }}
        />
      <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(JSON.stringify(enabledAddresses.get(activeAddress).radix_address).replace(/["']/g, ""))}}>
<IconFeather name="copy" size={20} color="white" />
</TouchableOpacity>
 </View>
<Dropdown
         style={[getAppFont("white"), styles.dropdown, isFocusAddr && { borderColor: 'blue' }]}
          placeholderStyle={[styles.placeholderStyle,getAppFont("white")]}
          selectedTextStyle={[styles.selectedTextStyle,getAppFont("white")]}
          inputSearchStyle={[styles.inputSearchStyle,getAppFont("white")]}
          iconStyle={[styles.iconStyle,getAppFont("white")]}
          containerStyle ={[styles.containerStyle,getAppFont("white")]}
          data={dropdownVals}
          activeColor="#4DA892"
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocusAddr ? 'Select Address' : '...'}
          searchPlaceholder="Search..."
          label={ dropdownVals[getDDIndex(dropdownVals,activeAddress)].label}
          value={ dropdownVals[getDDIndex(dropdownVals,activeAddress)].value}
          onFocus={() => setIsFocusAddr(true)}
          onBlur={() => setIsFocusAddr(false)}
          onChange={item => {
            updateActiveAddress(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, item.value, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);
            setLabelAddr(item.label);
            setValueAddr(item.value);
            setIsFocusAddr(true);

          }}
        />

       <Separator/>
       <Text style={[{fontSize: 20}, getAppFont("white")]}>Staked: {formatNumForHomeDisplay(stakedAmount)} XRD{"\n"}Liquid: {formatNumForHomeDisplay(liquid_rdx_balance)} XRD</Text>
 
       <View style={styles.rowStyle}>

       <View style={styles.rowStyleHome}>
       <TouchableOpacity disabled={isNaN(stakedAmount)} style={styles.button} onPress={() => navigation.navigate('Receive',{xrdAddress: enabledAddresses.get(activeAddress).radix_address})}>
        <View style={styles.rowStyle}>
     
       
        <Text style={[{fontSize: 16}, getAppFont("white")]}>
        <IconMaterialCommunityIcons name="call-received" size={16} color="white" /> Receive</Text>
        </View>
        
        </TouchableOpacity>

        </View>
        {/* <Text style={{fontSize: 14, color:"white"}}>          </Text> */}
  
        <View style={styles.rowStyleHome}>
        <TouchableOpacity disabled={isNaN(stakedAmount)} style={styles.button} onPress={() =>  navigation.navigate('Send',{defaultRri: "xrd_rr1qy5wfsfh", defaultSymbol:"XRD" + " (" + shortenAddress("xrd_rr1qy5wfsfh") + ")", sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address, hdpathIndex: getDDIndex(dropdownVals,activeAddress), isHWBool: isHW})}>
        <View style={styles.rowStyle}>

        <Text style={[{fontSize: 16, alignSelf:"center" }, getAppFont("white")]}>
        <IconFeather name="send" size={16} color="white" /> Send</Text>
        </View>
        </TouchableOpacity>
        </View>
        {/* <Text style={{fontSize: 14, color:"white"}}>          </Text> */}

        <View style={styles.rowStyleHome}>
        <TouchableOpacity disabled={isNaN(stakedAmount)} style={styles.button} onPress={() =>  navigation.navigate('Staking',{currAddr: JSON.stringify(enabledAddresses.get(activeAddress).radix_address).replace(/["']/g, ""),hdpathIndex: getDDIndex(dropdownVals,activeAddress), isHWBool: isHW
      })}>
        <View style={styles.rowStyle}>
     <Text style={[{fontSize: 16, alignSelf:"center", alignContents:"center", textAlign:"center", justifyContent:"center"}, getAppFont("white")]}>       
     <IconFeather name="arrow-down-circle" size={16} color="white"/> Staking</Text>
        </View>
        </TouchableOpacity>
        </View>

        </View>
        </LinearGradient>
</View>

<View style={{marginHorizontal:20}}>  
     <View style={styles.rowStyle}>
     <View style={styles.rowStyleHome}>  
     <TouchableOpacity onPress={() => 

{
const pushAction = StackActions.push('Import Select', { firstTimeStr: 'false' });

navigation.dispatch(pushAction);
     }
    }>
     <View style={styles.rowStyle}>
    
<Text style={[styles.buttonText, getAppFont("black")]}>
<IconMaterialCommunityIcons name="application-import" size={12} color={global.modeTranslation} /> Import Wallet</Text></View>
</TouchableOpacity>
</View>

<View style={styles.rowStyleHome}>  
     <TouchableOpacity onPress={() => 

{
const pushAction = StackActions.push('Mnemonic', { firstTimeStr: 'false' });

navigation.dispatch(pushAction);
     }
    }>
     <View style={styles.rowStyle}>
  
         {/* <Icon name="add-circle-outline" size={20} color="#4F8EF7" /> */}
<Text style={[styles.buttonText, getAppFont("black")]}>
<IconEntypo name="wallet" size={12} color={global.modeTranslation} /> New Wallet</Text></View>
</TouchableOpacity>
</View>
<View style={styles.rowStyleHome}>  
     <TouchableOpacity onPress={() => addAddress(setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, activeWallet, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)}>
     <View style={styles.rowStyle}>
    
<Text style={[styles.buttonText, getAppFont("black")]}>
<IconFeather name="hash" size={12} color={global.modeTranslation} /> Add Address</Text></View>
</TouchableOpacity> 
</View>
</View>
</View>


<View style={{margin:10, marginTop: 6}}>
<View style={styles.rowStyle}>
{/* 
<Dropdown
         style={[getAppFont("black"), styles.dropdown,  isFocus && { borderColor: 'blue' }]}
          placeholderStyle={[styles.placeholderStyle,getAppFont("black")]}
          selectedTextStyle={[styles.selectedTextStyle,getAppFont("black")]}
          inputSearchStyle={[styles.inputSearchStyle,getAppFont("black")]}
          iconStyle={[styles.iconStyle,getAppFont("black")]}
          containerStyle ={[styles.containerStyle,getAppFont("black")]}
          data={[]}
          activeColor="#4DA892"
          search
          maxHeight={300}
          disable={true}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Tokens' : '...'}
          searchPlaceholder="Search..."
          label="Tokens"
          value="Tokens"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {

          }}
        /> */}

        </View>

        <TextInput
      value={tokenFilter}
      autoCapitalize = "none"
      placeholder = "Filter tokens"
      onChangeText={text => setTokenFilter(text)}
      style={{borderWidth:1, borderRadius:15, paddingLeft:10, paddingTop:5, paddingBottom:5}}
    />
    <Separator/>
{renderAddressRows(tokenFilter, isFocus, setIsFocus, storeCurrData, setCurrLabel, setCurrValue, currLabel, tokenPrices, currValue, balances, stakedAmount, liquid_rdx_balance, navigation, enabledAddresses,activeAddress, getDDIndex(dropdownVals,activeAddress), isHW)}

</View> 
        <Separator/>
        { isNaN(stakedAmount) &&
<Progress.Circle style={{alignSelf:"center"}} size={30} indeterminate={true} />
}
<Separator/>
<Separator/>
<Separator/>
{/* <Separator/>
<Text style={[ getAppFont("black")]}>Transaction History (last 30 transactions)</Text>
<SeparatorBorder/>
{historyRows} */}
<Separator/>
<Separator/>
<Separator/>
<Separator/>
<Separator/>
  </View> 
  </ScrollView>
  </SafeAreaView>

  )
  ;
};


const styles = StyleSheet.create({

    surface: {
        flex: 1,
        padding: 9,
        marginLeft: 6,
        marginBottom: 6,
        marginRight: 6,
        marginTop: 10,
        height: 'auto',
        width: 'auto',
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: '#183A81',
      },
      surface2: {
        padding: 8,
        height: 'auto',
        width: 325,
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: '#006261',
      },
    rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent:'center',
        marginVertical:0,
      },
      rowStyleHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginVertical:0,
      },
      rowStyleHome: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 9,
        marginBottom: 5,
        flex:1
      },
      addrRowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginVertical:0,
      },
      rowStyleLeft: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'left',
        marginVertical:5,
      },
      buttonText: {
        fontSize: 12,
        color:"black",
      },
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35,
  },
  containerMain: {
    flex: 1,
    backgroundColor: "#183A81",
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
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: 0,
  },
  separatorBorder: {
    marginVertical: 8,
    borderTopColor: '#737373',
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  homeTitle: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 50,
    fontSize: 28,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 50,
  },
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    flex: 1,
    alignContent:"flex-start",
    justifyContent:"flex-start",
    textAlign:"left",
    height: 20,
    borderColor: 'white',
    textDecorationLine: 'underline',
    borderRadius: 8,
    marginHorizontal: 0,
  },
  dropdown2: {
    flex: 1,
    textAlign:"right",
    height: 19,
    borderColor: 'gray',
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    marginBottom: 0,
    marginHorizontal: 0,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'black',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 28,
    fontSize: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
containerStyle: {
     backgroundColor: "#183A81",
  },
  placeholderStyle: {
    fontSize: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTextStyle: {
    fontSize: 14,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
    textDecorationLine: 'underline',
  },
    placeholderStyle2: {
    fontSize: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTextStyle2: {
    fontSize: 12,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  iconStyle: {
    width: 0,
    height: 0,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
  inputSearchStyle2: {
    height: 40,
    fontSize: 10,
  },
  scrollView: {
    backgroundColor: "white",
    marginHorizontal: 0,
    paddingHorizontal: 10,
  },
});


export default Home;
