import { RefreshControl, Image, ScrollView, TouchableOpacity, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
var GenericToken = require("../assets/generic_token.png");
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
import { shortenAddress, useInterval, openCB, errorCB, copyToClipboard, formatNumForHomeDisplay } from '../helpers/helpers';


    const SeparatorBorder = () => (
    <View style={styles.separatorBorder} />
    );

function getWallets(db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances) {

    db.transaction((tx) => {

        tx.executeSql("SELECT * FROM wallet", [], (tx, results) => {
          var len = results.rows.length;
          var wallets = [];
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);
                var data = {label: row.name, value: row.id}
                 wallets.push(data);
            }
            
             setWallets(wallets);
        
             getActiveWallet(db, setActiveWallet,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);
             
             console.log("inside get wallets");
             console.log("inside get wallets2");
      }, errorCB);
        });
        
}

function getEnabledAddresses(wallet_id,db,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){

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
            getActiveAddress(db, setActiveAddress, addresses, addressBalances, setAddressBalances);

          }, errorCB); 
        });
}

function addAddress(wallet_id,db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){

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
                  
                  updateActiveAddress(db, next_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);

                  }, errorCB);
                });
            }
          }, errorCB);
        });

}


function renderAddressRows(balances, stakedAmount, liquid_rdx_balance, navigation, enabledAddresses, activeAddress){

    if( balances.size > 0 && enabledAddresses.size > 0 ){

        var rows = []
        var xrdRow = []

    balances.forEach((balance, rri) =>  

   {

    try{

      if(rri=="xrd_rr1qy5wfsfh"){

        xrdRow.push(
               
            <View key={rri}>

   <SeparatorBorder/>
    <TouchableOpacity disabled={isNaN(stakedAmount)} onPress={ () => {navigation.navigate('Send',{defaultSymbol: balance[1], sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address})}}>

    <View style={styles.addrRowStyle}>


    <Image style={{width: 36, height: 36}}
    defaultSource={GenericToken}
    source={{uri: balance[3]}}
      />
    <Text style={{color:"black",flex:1,marginTop:0,fontSize:14,justifyContent:'flex-start', fontFamily:"AppleSDGothicNeo-Regular"}}>  {balance[2]}</Text>
    <Text style={{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end', fontFamily:"AppleSDGothicNeo-Regular" }}>{ formatNumForHomeDisplay(balance[0]) } {balance[1]}</Text>

    </View> 
    </TouchableOpacity>
    </View>        )
      } else{

        rows.push(
               
          <View key={rri}>

 <SeparatorBorder/>
  <TouchableOpacity disabled={isNaN(stakedAmount)} onPress={ () => {navigation.navigate('Send',{defaultSymbol: balance[1], sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address})}}>

  <View style={styles.addrRowStyle}>


  <Image style={{width: 36, height: 36}}
  defaultSource={GenericToken}
  source={{uri: balance[3]}}
    />
  <Text style={{color:"black",flex:1,marginTop:0,fontSize:14,justifyContent:'flex-start', fontFamily:"AppleSDGothicNeo-Regular" }}>  {balance[2]}</Text>
  <Text style={{color:"black",marginTop:0,fontSize:14, justifyContent:'flex-end', fontFamily:"AppleSDGothicNeo-Regular" }}>{ formatNumForHomeDisplay(balance[0]) } {balance[1]}</Text>

  </View> 
  </TouchableOpacity>
  </View>        )

      }
    }    
    catch(err){
        console.log(err)
   }
   })
           

    return (xrdRow.concat(rows))

    }

}


function updateActiveWallet(wallet_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){

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

                updateActiveAddress(db, address_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);

            }, errorCB);
    }); 
}, errorCB);
}); 
}

export function updateActiveAddress(db, address_id, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){
    db.transaction((tx) => {
        tx.executeSql("UPDATE active_address set id = '"+address_id+"'", [], (tx, results) => {
            getWallets(db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
        }, errorCB);
    }); 
}

function getActiveWallet(db,setActiveWallet,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){
    db.transaction((tx) => {
        tx.executeSql("SELECT id FROM active_wallet", [], (tx, results) => {
        
                var len = results.rows.length;
                      
                var id = 0;
                for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    id = row.id;
                }

                setActiveWallet(id);
            
                getEnabledAddresses(id,db,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);

        }, errorCB);
    }); 
}

function getActiveAddress(db, setActiveAddress, addresses, addressBalances, setAddressBalances){

    db.transaction((tx) => {
        tx.executeSql("SELECT id FROM active_address", [], (tx, results) => {
        
                var len = results.rows.length;
                      
                var id = 0;
                for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    id = row.id;
                }

                setActiveAddress(id);
               
                getBalances(addresses, id, addressBalances, setAddressBalances)


        }, errorCB);
    }); 
}

export class NetworkUtils {
    static async isNetworkAvailable() {
      const response = await NetInfo.fetch();
      return response.isConnected;
  }}

   function getTokenMetadata(uniqueRRIs, activeAddress, newAddrBalances, setAddressBalances){

     var rri = uniqueRRIs.pop();

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
            } else{
              getTokenMetadata(uniqueRRIs, activeAddress, newBalance, setAddressBalances)
            }
  
             
          }
      }).catch((error) => {
          console.error(error);
      });
 
  }
  
  async function getBalances(enabledAddresses, activeAddress, addressBalances, setAddressBalances){
   
    const isConnected = await NetworkUtils.isNetworkAvailable();
 
    if(isConnected){
    await fetch('https://raddish-node.com:6208/account/balances', {
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
      
               getTokenMetadata(uniqueRRIs, activeAddress, newAddrBalances, setAddressBalances);
          }
      }).catch((error) => {
          console.error(error);
      });
    } else{
        alert("No internet connection available. Please connect to the internet.");
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

    const onRefresh = React.useCallback(() => {
        getWallets(db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
      setRefreshing(true);
      wait(2000).then(() => setRefreshing(false));
    }, []);

    var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

    var initialEnabledAddresses = new Map();
    initialEnabledAddresses.set(1,{label: "Setting up...", value:""})
    const [addressBalances, setAddressBalances] = useState(new Map())
    const [wallets, setWallets] = useState([{label: "Setting up...", value:""}]);
    const [isFocus, setIsFocus] = useState(false);
    const [label, setLabel] = useState();
    const [value, setValue] = useState();
    const [isFocusAddr, setIsFocusAddr] = useState(false);
    const [labelAddr, setLabelAddr] = useState();
    const [valueAddr, setValueAddr] = useState();
    const [activeWallet, setActiveWallet] = useState(1);
    const [activeAddress, setActiveAddress] = useState(1);
    const [enabledAddresses, setEnabledAddresses] = useState(initialEnabledAddresses);
    const [addressRRIs, setAddressRRIs] = useState(new Map())

    var dropdownVals = []
    var walletDropdownVals = []  

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
            getWallets(db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)
       }, []);
    
        useInterval(() => {
           getWallets(db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)    }, 10000);

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
            balances.set(stakedTokenIdentifier,[parseInt(balances.get(stakedTokenIdentifier)[0])+parseInt(stakedAmount),balances.get(stakedTokenIdentifier)[1],balances.get(stakedTokenIdentifier)[2],balances.get(stakedTokenIdentifier)[3]]);
        } else{
            balances.set(stakedTokenIdentifier,[stakedAmount,
                
                JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.token_identifier.symbol).replace(/["']/g, "").toUpperCase(),

                JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.token_identifier.name).replace(/["']/g, ""),
               JSON.stringify(addressBalances.get(activeAddress).staked_and_unstaking_balance.token_identifier.icon_url).replace(/["']/g, "") ])
      
        }
    }
}

console.log("WALLETS: "+JSON.stringify(wallets));

  return (

    <SafeAreaView style={styles.containerMain}>
        <ScrollView style={styles.scrollView}
        refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}/>
            }>
            <View  > 
                
                <View style={styles.rowStyle}>

                <LinearGradient colors={['#183A81','#4DA892', '#4DA892']} useAngle={true} angle={11} style={styles.surface}>
            
            <View style={styles.rowStyle}>
<Dropdown
         style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          containerStyle ={styles.containerStyle}
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
            updateActiveWallet(item.value, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);
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
         style={[styles.dropdown, isFocusAddr && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          containerStyle ={styles.containerStyle}
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
            updateActiveAddress(db, item.value, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances);
           setLabelAddr(item.label);
            setValueAddr(item.value);
            setIsFocusAddr(true);

          }}
        />

       <Separator/>
       <Text style={{fontSize: 20, color:"white", fontFamily: 'AppleSDGothicNeo-Regular'}}>Staked: {formatNumForHomeDisplay(stakedAmount)} XRD{"\n"}Liquid: {formatNumForHomeDisplay(liquid_rdx_balance)} XRD</Text>
 
       <Separator/>
       <View style={styles.rowStyle}>

       <View style={styles.rowStyleHome}>
       <TouchableOpacity disabled={isNaN(stakedAmount)} style={styles.button} onPress={() => navigation.navigate('Receive',{xrdAddress: enabledAddresses.get(activeAddress).radix_address})}>
        <View style={styles.rowStyle}>
     
        <IconMaterialCommunityIcons name="call-received" size={18} color="white" />
        <Text style={{fontSize: 14, color:"white", fontFamily: 'AppleSDGothicNeo-Regular'}}> Receive</Text>
        </View>
        
        </TouchableOpacity>

        </View>
        {/* <Text style={{fontSize: 14, color:"white"}}>          </Text> */}
  
        <View style={styles.rowStyleHome}>
        <TouchableOpacity disabled={isNaN(stakedAmount)} style={styles.button} onPress={() =>  navigation.navigate('Send',{defaultSymbol:"XRD", sourceXrdAddr: enabledAddresses.get(activeAddress).radix_address})}>
        <View style={styles.rowStyle}>
        <IconFeather name="send" size={18} color="white" />
        <Text style={{fontSize: 14, color:"white", fontFamily: 'AppleSDGothicNeo-Regular'}}> Send</Text>
        </View>
        </TouchableOpacity>
        </View>
        {/* <Text style={{fontSize: 14, color:"white"}}>          </Text> */}

        <View style={styles.rowStyleHome}>
        <TouchableOpacity disabled={isNaN(stakedAmount)} style={styles.button} onPress={() =>  navigation.navigate('Staking',{currAddr: JSON.stringify(enabledAddresses.get(activeAddress).radix_address).replace(/["']/g, ""),
      currLiqBal: liquid_rdx_balance,
      currStaked: stakedAmount
      })}>
        <View style={styles.rowStyle}>
        <Icon name="arrow-down-circle-outline" size={20} color="white" />
        <Text style={{fontSize: 14, color:"white", fontFamily: 'AppleSDGothicNeo-Regular'}}> Staking</Text>
        </View>
        </TouchableOpacity>
        </View>

        </View>
        </LinearGradient>
</View>

<View style={{marginHorizontal:20}}>  
     <View style={styles.rowStyle}>
     <View style={styles.rowStyleHome}>  
     <TouchableOpacity style={styles.button} onPress={() => 

{
const pushAction = StackActions.push('Mnemonic Input', { firstTimeStr: 'false' });

navigation.dispatch(pushAction);
     }
    }>
     <View style={styles.rowStyle}>
     <IconMaterialCommunityIcons name="application-import" size={16} color="black" />
<Text style={styles.buttonText} >Import Wallet</Text></View>
</TouchableOpacity>
</View>

<View style={styles.rowStyleHome}>  
     <TouchableOpacity style={styles.button} onPress={() => 

{
const pushAction = StackActions.push('Mnemonic', { firstTimeStr: 'false' });

navigation.dispatch(pushAction);
     }
    }>
     <View style={styles.rowStyle}>
     <IconEntypo name="wallet" size={16} color="black" />
         {/* <Icon name="add-circle-outline" size={20} color="#4F8EF7" /> */}
<Text style={styles.buttonText} >Add Wallet</Text></View>
</TouchableOpacity>
</View>
<View style={styles.rowStyleHome}>  
     <TouchableOpacity style={styles.button} onPress={() => addAddress(activeWallet, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances)}>
     <View style={styles.rowStyle}>
     <IconFeather name="hash" size={16} color="black" />
<Text style={styles.buttonText} >Add Address</Text></View>
</TouchableOpacity> 
</View>
</View>
</View>


<View style={{margin:16}}>
<Text style={{fontFamily:"AppleSDGothicNeo-Regular"}}>Tokens</Text>

{renderAddressRows(balances, stakedAmount, liquid_rdx_balance, navigation, enabledAddresses,activeAddress)}

</View> 
        <Separator/>
        { isNaN(stakedAmount) &&
<Progress.Circle style={{alignSelf:"center"}} size={30} indeterminate={true} />
}
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
        margin: 6,
        height: 'auto',
        width: 'auto',
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: '#4DA892',
        fontFamily: 'AppleSDGothicNeo-Regular'
      },
      surface2: {
        padding: 8,
        height: 'auto',
        width: 325,
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: '#006261',
        fontFamily: 'AppleSDGothicNeo-Regular'
      },
    rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:0,
        fontFamily: 'AppleSDGothicNeo-Regular'
      },
      rowStyleHome: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:5,
        fontFamily: 'AppleSDGothicNeo-Regular',
        flex:1
      },
      addrRowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:0,
        fontFamily: 'AppleSDGothicNeo-Regular'
      },
      rowStyleLeft: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'left',
        marginVertical:5,
        fontFamily: 'AppleSDGothicNeo-Regular'
      },
      buttonText: {
        fontSize: 10,
        color:"black",
        fontFamily: 'AppleSDGothicNeo-Regular'
      },
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35,
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  containerMain: {
    flex: 1,
    backgroundColor: "white",
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
   sectionHeader: {
     paddingTop: 2,
     paddingLeft: 10,
     paddingRight: 10,
     paddingBottom: 2,
     fontSize: 14,
     fontWeight: 'bold',
     backgroundColor: 'rgba(247,247,247,1.0)',
     fontFamily: 'AppleSDGothicNeo-Regular'
   },
   item: {
     padding: 10,
     fontSize: 18,
     height: 44,
     fontFamily: 'AppleSDGothicNeo-Regular'
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
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 50,
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  container: {
    backgroundColor: 'white',
    padding: 16,
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  dropdown: {
    flex: 1,
    alignContent:"flex-start",
    justifyContent:"flex-start",
    textAlign:"left",
    height: 20,
    borderColor: 'gray',
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 0,
    marginHorizontal: 0,
    fontFamily: 'AppleSDGothicNeo-Regular'
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
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
containerStyle: {
     backgroundColor: "#183A81",
     color:"white",
     fontFamily: 'AppleSDGothicNeo-Regular'
  },
  placeholderStyle: {
    fontSize: 14,
    alignItems: 'center',
    justifyContent: 'center',
    color:"white",
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  selectedTextStyle: {
    fontSize: 14,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
    color:"white",
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  iconStyle: {
    width: 0,
    height: 0,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    color:"white",
    fontFamily: 'AppleSDGothicNeo-Regular'
  },
  scrollView: {
   
    marginHorizontal: 10,
  },
});


export default Home;
