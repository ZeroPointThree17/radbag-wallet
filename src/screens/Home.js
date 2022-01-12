import { Alert, Button, ScrollView, TouchableOpacity,SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState,useRef, useEffect } from 'react';
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

  function errorCB(err, moreInfoStr) {
    console.log("SQL Error: " + err.message + " More Info: "+moreInfoStr);
  }
  
  function successCB() {
    console.log("SQL executed fine");
  }
  
  function openCB() {
    // console.log("Database OPENED");
  }
  

function convertbits (data, frombits, tobits, pad) {
    var acc = 0;
    var bits = 0;
    var ret = [];
    var maxv = (1 << tobits) - 1;
    for (var p = 0; p < data.length; ++p) {
      var value = data[p];
      if (value < 0 || (value >> frombits) !== 0) {
        return null;
      }
      acc = (acc << frombits) | value;
      bits += frombits;
      while (bits >= tobits) {
        bits -= tobits;
        ret.push((acc >> bits) & maxv);
      }
    }
    if (pad) {
      if (bits > 0) {
        ret.push((acc << (tobits - bits)) & maxv);
      }
    } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
      return null;
    }
    return ret;
  }
  
  const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  

    this.state = {
        tableHead: ['Address: rdx1qspp...jnk65 [Small Address]'],
        tableData: [
          ['1,234,432.24 XRD','12121212 ABCDEFGHIJ','12121212 ABCDEFGHIJ','Remove'],
     
        ]
      }


      const data = [
        { label: 'Wallet 1 (1,234,432.24 XRD)', value: '1' },
        
      ];

      const Separator = () => (
        <View style={styles.separator} />
      );

      const SeparatorBorder = () => (
        <View style={styles.separatorBorder} />
      );

    
    //   var wallets = [];
    //   var enabledAddresses = [];

    var first = true;
function getWallets(db, setWallets,setActiveWallet,setEnabledAddresses){

    first = false;
    console.log("inside get wallets0");
    db.transaction((tx) => {

        tx.executeSql("SELECT * FROM wallet", [], (tx, results) => {
            console.log("inside get wallets0.1");
          var len = results.rows.length;
          var wallets = [];
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);
                var data = {label: row.name, value: row.id}
                 wallets.push(data);
            }

            
            setWallets(wallets);
        
            setActiveWallet(wallets[0].value);
             console.log("inside get wallets");
             console.log("inside get wallets2");
             getEnabledAddresses(wallets[0].value,db,setEnabledAddresses)
          }, errorCB);
        });
        
}

function getEnabledAddresses(wallet_id,db,setEnabledAddresses){
    db.transaction((tx) => {

        tx.executeSql("SELECT * FROM address WHERE wallet_id='"+wallet_id+"' AND enabled_flag='1'", [], (tx, results) => {

          var table = {tableHead: ['Name', 'Address'], tableData: []};
          
          var len = results.rows.length;
      
            for (let i = 0; i < len; i++) {
                let row = results.rows.item(i);
                    // var data = [row.name, row.radix_address];
                    table.tableData.push([row.name, row.radix_address, row.id]);
            }
            //  alert("table: "+JSON.stringify(table))
            setEnabledAddresses(table);
          }, errorCB);
        });
}

function addAddress(wallet_id, db){

    // alert("Updating addresses 0.1");
    db.transaction((tx) => {

        tx.executeSql("SELECT MIN(id) AS id FROM address WHERE wallet_id='"+wallet_id+"' AND enabled_flag='0'", [], (tx, results) => {
            // alert("Updating addresses 0");
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

                // alert("Updating addresses");
                tx.executeSql("UPDATE address SET enabled_flag=1 WHERE wallet_id='"+wallet_id+"' AND id='"+next_id+"'", [], (tx, results) => {
                    // alert("Done Updating addresses");
                getEnabledAddresses(wallet_id,db)
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

    return address.substring(0, 7) +"..."+ address.substring(address.length-5, address.length) 

}
    

function renderAddressRows(data, db, wallet_id, copyToClipboard){

    
    if(data === undefined){
    }
    else{
    //enabledAddresses.tableData
    var rows = []
  // CERBY: 01231  DOG3: 01231
    // let items=['Item 1','Item 2','Item 3','Item 4','Item 5'];
    {data.map((item,index)=>{
        rows.push(
            <View>
                <SeparatorBorder/>
            <View style={styles.rowStyle}>
                <View style={{flex: 0.8}}>
        <Text style={{fontWeight: 'normal', fontSize: 16, fontFamily: 'GillSans-Light'}}>{item[0]} - {shortenAddress(item[1])} </Text> 
        <Text style={{fontSize: 16, fontFamily: 'GillSans-Light' }}>XRD: 01231  {item[2]} </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() =>  copyToClipboard(item[1])}>
        <Icon style={{marginHorizontal: 8}} name="copy-outline" size={30} color="#4F8EF7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => removeAddessWarning(db, wallet_id, item[2])}>
   <IconFoundation name="minus-circle" size={30} color="red" />
   </TouchableOpacity>
   </View>
      </View>

        )
    })}


    return (rows)

    }
//     return(
//     <View style={styles.rowStyle}>
// <View>
// <Text>rdxsdfdsfasa....sdfdfddfdfsff (Address 1)</Text>
// <Text>XRD: 01231  CERBY: 01231  DOG3: 01231  </Text>
//   </View>
//   <Icon name="copy-outline" size={30} color="#4F8EF7" />
//   <IconFoundation name="minus-circle" size={30} color="red" />
//   </View>)
}

function persistActiveWallet(db, wallet_id){

     wallet_id=0;
        db.transaction((tx) => {
            tx.executeSql("DROP TABLE IF EXISTS active_wallet", [], (tx, results) => {
                db.transaction((tx) => {
                    tx.executeSql("CREATE TABLE active_wallet ( id INTEGER )", [], (tx, results) => {
                        db.transaction((tx) => {
                            tx.executeSql("UPDATE active_wallet SET id = "+wallet_id, [], (tx, results) => {
                            // alert("persist3")
                            }, errorCB('update active_wallet'));
                        }); 
            }, errorCB('Create active_wallet'));
        });
              }, errorCB("DROP active wallet"));
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
  
    const fetchCopiedText = async () => {
      const text = await Clipboard.getString();
      setCopiedText(text);
    };

    
    const {pw} = route.params;

    var pwStr = JSON.stringify(pw).replaceAll('"','');

    var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);


    const state = this.state;
    
    const [wallets, setWallets] = useState([{label: "Loading...", value:""}]);
    const [value, setValue] = useState(null);
    const [label, setLabel] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [activeWallet, setActiveWallet] = useState();
    const [enabledAddresses, setEnabledAddresses] = useState([]);
   


    useInterval(() => {
        getWallets(db, setWallets,setActiveWallet,setEnabledAddresses);
      }, 1000);

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

         // setValue(item.value);

 
  
  return (

    
    <SafeAreaView style={styles.containerMain}>
          <FlashMessage position="bottom" />
          <ScrollView style={styles.scrollView}>
     <View  > 
     
     <Separator/>
     <Separator/>
<Text style={styles.homeTitle}>Total XRD Balance: </Text>
<Text style={styles.homeTitle}>0.000 XRD</Text>


<Separator/>
<View style={styles.rowStyle}>
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
          label={wallets[0].label}
          value={wallets[0].value}
          onFocus={() => {setIsFocus(true)}}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            persistActiveWallet(db, wallets[0].value);
            setLabel(item.label);
            setValue(item.value);
            setIsFocus(true);
          }}
        />
       <TouchableOpacity style={styles.button} onPress={() => alert('hi')}>
<Icon name="add-circle-outline" size={30} color="#4F8EF7" /></TouchableOpacity>

</View>
      
        
                 {/* <FontAwesome icon={SolidIcons.smile} />  */}
     <View style={styles.rowStyle}>
       
     <TouchableOpacity style={styles.button} onPress={() => addAddress(activeWallet, db)}>
     <View style={styles.rowStyle}><Icon name="add-circle-outline" size={30} color="#4F8EF7" />
<Text style={styles.buttonText} >Add Address</Text></View>
</TouchableOpacity>

</View>


{renderAddressRows(enabledAddresses.tableData, db, activeWallet, copyToClipboard)}

        <Separator/>
        <Text>{copiedText}</Text>
  </View> 
  </ScrollView>
  </SafeAreaView>

  )
  ;
};



const styles = StyleSheet.create({
    rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:5
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
    backgroundColor: "#FFFFFF"
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
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  homeTitle: {
    textAlign: 'center',
    marginVertical: 8,
    marginHorizontal: 50,
    fontSize: 20
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
    flex: 0.8,
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 12,
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
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  scrollView: {
    backgroundColor: 'white',
    marginHorizontal: 10,
  },
});



export default Home;
