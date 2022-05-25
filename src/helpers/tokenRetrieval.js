import { errorCB, shortenAddress } from './helpers';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';


export function getWallets(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, setIsHW, db, setWallets, setActiveWallet, setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances) {

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
             
      }, errorCB);
        });
        
}


export function getActiveWallet(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, db,setActiveWallet,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances, hwWallets, setIsHW){
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


export function getEnabledAddresses(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, wallet_id,db,setEnabledAddresses, setActiveAddress, addressBalances, setAddressBalances){

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


export function getActiveAddress(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, db, setActiveAddress, addresses, addressBalances, setAddressBalances){

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

export async function getBalances(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, enabledAddresses, activeAddress, addressBalances, setAddressBalances){
   
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

        // console.log("Get Balances call: "+JSON.stringify(json));

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


export function getTokenMetadata(gatewayIdx, setTokenPrices, getCurrData, setCurrValue, setCurrLabel, uniqueRRIs, activeAddress, newAddrBalances, setAddressBalances){

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

           // newBalance.forEach((b, active_address) => console.log("NB ("+active_address+"):"+JSON.stringify(b)))

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


 export function getPrices(setTokenPrices, getCurrData, setCurrValue, setCurrLabel){
   
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


export function getDDIndex(dropdownVals,activeAddress){

    for(var x = 0; x <dropdownVals.length ; x++){
        if(dropdownVals[x].value == activeAddress){
            return x;
        }
    }

    return 0;
}


export function getWalletDDIndex(walletDropdownVals,activeWallet){

    for(var x = 0; x <walletDropdownVals.length ; x++){
        if(walletDropdownVals[x].value == activeWallet){
            return x;
        }
    }
  
    return 0;
  }


  export const getCurrData = async (setCurrValue, setCurrLabel) => {
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

  export const storeCurrData = async (json, setCurrValue, setCurrLabel) => {
    try {
      const jsonValue = JSON.stringify(json)
      await AsyncStorage.setItem('@fiatCurrencySelected', jsonValue)
      setCurrValue(json.value);
      setCurrLabel(json.label);
    } catch (e) {
      console.log(e)
    }
  }