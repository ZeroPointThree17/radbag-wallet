import { Alert, Button, ScrollView, TouchableOpacity,SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState,useRef, useEffect, useReducer } from 'react';
const bip39 = require('bip39');
var HDKey = require('hdkey')
let { bech32, bech32m } = require('bech32')
var bitcoinMessage = require('bitcoinjs-message')
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
import {encrypt, decrypt} from '../helpers/encrypt';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import  IconFoundation  from 'react-native-vector-icons/Foundation';
import Clipboard from '@react-native-clipboard/clipboard';
import FlashMessage, {showMessage, hideMessage} from "react-native-flash-message";
import { Surface, List } from 'react-native-paper';
import IconFontisto from 'react-native-vector-icons/Fontisto';
// import { NativeBaseProvider,Content, Card, CardItem, Body } from "native-base";
import ReactNativeSwipeableViewStack from 'react-native-swipeable-view-stack';


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

  function errorCB(err) {
    console.log("SQL Error: " + err.message);
  }
  
  function openCB() {
    console.log("Database OPENED");
  }
  

    const Separator = () => (
    <View style={styles.separator} />
    );

    const SeparatorBorder = () => (
    <View style={styles.separatorBorder} />
    );

function getWallets(db, setWallets, setActiveWallet, setActiveAddress, setEnabledAddresses){

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
        
             getActiveWallet(db, setActiveWallet);
             
             console.log("inside get wallets");
             console.log("inside get wallets2");
             getEnabledAddresses(wallets[0].value,db, setActiveAddress,setEnabledAddresses, true)
          }, errorCB);
        });
        
}

function getEnabledAddresses(wallet_id,db,setActiveAddress,setEnabledAddresses, pickFirstAsActive){
    db.transaction((tx) => {
  
        tx.executeSql("SELECT * FROM address WHERE wallet_id='"+wallet_id+"' AND enabled_flag='1'", [], (tx, results) => {

          var addresses = [];
          var len = results.rows.length;
      
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);
                    var addrLabel = row.name + " - " + shortenAddress(row.radix_address);
                    var data = {label: addrLabel, value: row.id}
                    addresses.push(data);
            }

            setEnabledAddresses(addresses);

            if(pickFirstAsActive==true){
                setActiveAddress(addresses[0].value);
            }

          }, errorCB); 
        });
}

function addAddress(wallet_id,db,setActiveAddress,setEnabledAddresses, pickFirstAsActive){

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
                getEnabledAddresses(wallet_id,db,setActiveAddress,setEnabledAddresses, pickFirstAsActive);  
                alert("New address is now in your address dropdown")
                  }, errorCB);
                });
            }

          }, errorCB);
        });

}

const removeAddessWarning = (db, wallet_id, address_id) =>
Alert.alert(
  "Remove address",
  "Are you sure you want to remove this address from this wallet?",
  [
    {
      text: "Cancel",
      onPress: () => console.log("Cancel Pressed"),
      style: "cancel"
    },
    { text: "Yes", onPress: () => removeAddress(db, wallet_id, address_id) }
  ]
);

function removeAddress(db, wallet_id, address_id){

    // alert("Updating addresses 0.1");
    db.transaction((tx) => {

        tx.executeSql("UPDATE address SET enabled_flag='0' WHERE wallet_id='"+wallet_id+"' AND id='"+address_id+"' AND enabled_flag='1'", [], (tx, results) => {

            getEnabledAddresses(wallet_id,db)

          }, errorCB);
        });
}


function shortenAddress(address){

    return address.substring(0, 7) +"..."+ address.substring(address.length-4, address.length) 

}

function renderAddressRows(data, db, wallet_id, copyToClipboard){

    if(data === undefined){
    }
    else{

        console.log("ADDRESSES: "+data) 

        var rows = []

    {data.map((item,index)=>{
        rows.push(
            <View key={index}>


    <SeparatorBorder/>
    <View style={styles.addrRowStyle}>

    <Text style={{color:"black",flex:1,marginTop:0,fontSize:20,justifyContent:'flex-start' }}>( {index}  ) XRD Radix</Text>
    <Text style={{color:"black",flex:0.5,marginTop:0,fontSize:20, justifyContent:'flex-end' }}>{index} - 3443.943 RDX</Text>
    </View>

{/* </Surface> */}
{/* <Surface style={styles.surface}>
     <Text>Surface</Text>
  </Surface> */}
{/* </List.Accordion> */}
                {/* <SeparatorBorder/>
            <View style={styles.rowStyle}>
                <View style={{flex: 0.8}}>
        <Text style={{fontWeight: 'normal', fontSize: 16, fontFamily: 'GillSans-Light'}}>{item[0]} - {shortenAddress(item[1])} </Text> 
        <Text style={{fontSize: 16, fontFamily: 'GillSans-Light' }}>XRD: 01231 </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() =>  copyToClipboard(item[1])}>
        <Icon style={{marginHorizontal: 8}} name="copy-outline" size={30} color="#4F8EF7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => removeAddessWarning(db, wallet_id, item[2])}>
   <IconFoundation name="minus-circle" size={30} color="red" />
   </TouchableOpacity>
   </View> */}
      </View>




        )
    })}


    return (rows)

    }

}

function updateActiveWallet(wallet_id, setActiveWallet){

    var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

    db.transaction((tx) => {
        tx.executeSql("UPDATE active_wallet SET id = "+wallet_id, [], (tx, results) => {       
           setActiveWallet(wallet_id);
        }, errorCB);
    }); 
}

function updateActiveAddress(db, address_id, setActiveAddress){
    db.transaction((tx) => {
        tx.executeSql("UPDATE active_address set id = '"+address_id+"'", [], (tx, results) => {
           setActiveAddress(address_id);
        }, errorCB);
    }); 
}

function getActiveWallet(db,setActiveWallet){
    db.transaction((tx) => {
        tx.executeSql("SELECT id FROM active_wallet", [], (tx, results) => {
        
                var len = results.rows.length;
                      
                var id = 0;
                for (let i = 0; i < len; i++) {
                    let row = results.rows.item(i);
                    id = row.id;
                }

                setActiveWallet(id);

        }, errorCB('update active_wallet'));
    }); 
}


const Home = ({route, navigation}) => {

    const [copiedText, setCopiedText] = useState('');

    const copyToClipboard = (string) => {

      Clipboard.setString(string);

      showMessage({
        message: "Address copied to clipboard",
        type: "info",
      });
    };

    var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

    const [wallets, setWallets] = useState([{label: "Setting up for first time...", value:""}]);
    const [isFocus, setIsFocus] = useState(false);
    const [label, setLabel] = useState();
    const [value, setValue] = useState();
    const [isFocusAddr, setIsFocusAddr] = useState(false);
    const [labelAddr, setLabelAddr] = useState();
    const [valueAddr, setValueAddr] = useState();
    const [activeWallet, setActiveWallet] = useState(1);
    const [activeAddress, setActiveAddress] = useState(1);
    const [enabledAddresses, setEnabledAddresses] = useState([{label: "Setting up for first time...", value:""}]);
   
    // useInterval(() => {
    //     getWallets(db, setWallets, activeWallet, setActiveWallet,setEnabledAddresses);
    //   }, 500);

    useEffect(() => {
        getWallets(db, setWallets, setActiveWallet, setActiveAddress, setEnabledAddresses);
    }, []);

    //  while(first == true){
    //      console.log("in loop 1");
    //      console.log("in loop 2");
    //      console.log(first);
    //      wait(100);
    // }

    console.log("WALLETS: "+JSON.stringify(wallets));


    // // -> "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef"
  
//   *******
//       var message = '9a25747cd03f9764de539934e1800edc8160a4978aa27b1a6fb8411a11543697'
//       var signature = "AA";
  
//        signature = secp256k1.ecdsaSign(Uint8Array.from(Buffer.from(message,'hex')), Uint8Array.from(childkey.privateKey))
  
  
//    var result=new Uint8Array(72);
//    secp256k1.signatureExport(signature.signature,result);
//      console.log("SIG: "+ Buffer.from(result).toString('hex'));
//   ******
//      <QRCode
//      value={rdx_addr}
//    />
//          <Text >Radix Key: {rdx_addr} </Text>
       
//        <Text >Private Key: {childkey.privateKey.toString('hex')} </Text>

        
  return (

    <SafeAreaView style={styles.containerMain}>

        <FlashMessage position="bottom" />
        <ScrollView style={styles.scrollView}>
            <View  > 
            <Separator/>
                <View style={styles.rowStyle}>
    
            <Surface style={styles.surface}>
<Dropdown
         style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={wallets}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Wallet' : '...'}
          searchPlaceholder="Search..."
          label={wallets[parseInt(activeWallet)-1].label}
          value={wallets[parseInt(activeWallet)-1].value}
          onFocus={() => {setIsFocus(true)}}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            updateActiveWallet(item.value, setActiveWallet);
            setLabel(item.label);
            setValue(item.value);
            setIsFocus(true);
          }}
        />
<Dropdown
         style={[styles.dropdown, isFocusAddr && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={enabledAddresses}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocusAddr ? 'Select Address' : '...'}
          searchPlaceholder="Search..."
          label={enabledAddresses[parseInt(activeAddress)-1].label}
          value={enabledAddresses[parseInt(activeAddress)-1].value}
          onFocus={() => {setIsFocusAddr(true)}}
          onBlur={() => setIsFocusAddr(false)}
          onChange={item => {
            updateActiveAddress(db, item.value, setActiveAddress);
            setLabelAddr(item.label);
            setValueAddr(item.value);
            setIsFocusAddr(true);
          }}
        />
       <Text style={{fontSize: 30, color:"white"}}>0.000 XRD</Text>
        <Text >0.00 USD</Text>
        <View style={styles.rowStyle}>
        <TouchableOpacity style={styles.button} onPress={() =>  alert("hi")}>
        <Text>Recieve - Send </Text>
        </TouchableOpacity>
        </View>
        </Surface>
      {/* <TouchableOpacity style={styles.button} onPress={() => alert('hi')}>
<Icon name="add-circle-outline" size={30} color="#4F8EF7" /></TouchableOpacity> */}

</View>

     <View style={styles.rowStyle}>
       
     <TouchableOpacity style={styles.button} onPress={() => addAddress(activeWallet, db, setActiveAddress, setEnabledAddresses, false)}>
     <View style={styles.rowStyle}><Icon name="add-circle-outline" size={20} color="#4F8EF7" />
<Text style={styles.buttonText} >Add Wallet     </Text></View>
</TouchableOpacity>

     <TouchableOpacity style={styles.button} onPress={() => addAddress(activeWallet, db, setActiveAddress, setEnabledAddresses, false)}>
     <View style={styles.rowStyle}><Icon name="add-circle-outline" size={20} color="#4F8EF7" />
<Text style={styles.buttonText} >Add Address</Text></View>
</TouchableOpacity> 


</View>

<Separator/>
<Text>Tokens                                                                   +</Text>
 
{renderAddressRows(enabledAddresses, db, activeWallet, copyToClipboard)}

        <Separator/>

  </View> 
  </ScrollView>
  </SafeAreaView>

  )
  ;
};


const styles = StyleSheet.create({
    surface: {
        padding: 8,
        height: 'auto',
        width: 325,
        // alignItems: 'flex-start',
        // justifyContent: 'center',
        // elevation: 4,
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: '#4DA892',
     
      },
      surface2: {
        padding: 8,
        height: 'auto',
        width: 325,
        // alignItems: 'flex-start',
        // justifyContent: 'center',
        // elevation: 4,
        borderWidth: 0,
        borderRadius: 10,
        backgroundColor: '#006261',
     
      },
    rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:5
      },
      addrRowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:0
      },
      rowStyleLeft: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'left',
        // justifyContent: 'left',
        marginVertical:5
      },
      buttonText: {
        fontSize: 18,
        color:"#4F8EF7"
      },
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical:35
  },
  containerMain: {
    flex: 1,
    backgroundColor: "white"
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
    fontSize: 28
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
    height: 24,
    borderColor: 'gray',
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 28,
    fontSize: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderStyle: {
    fontSize: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedTextStyle: {
    fontSize: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left'
  },
  iconStyle: {
    width: 0,
    height: 0,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  scrollView: {
   
    marginHorizontal: 10,
  },
});



export default Home;
