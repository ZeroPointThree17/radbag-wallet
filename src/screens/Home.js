import { Alert, Button, SectionList, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
const bip39 = require('bip39');
var HDKey = require('hdkey')
let { bech32, bech32m } = require('bech32')
var bitcoinMessage = require('bitcoinjs-message')
const secp256k1 = require('secp256k1');
var SQLite = require('react-native-sqlite-storage');
import {encrypt, decrypt} from '../helpers/encrypt';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { Dropdown } from 'react-native-element-dropdown';
//  import AntDesign from 'react-native-vector-icons/AntDesign';
//  import  AntDesign  from 'antd';
import FontAwesome, { SolidIcons, RegularIcons, BrandIcons } from 'react-native-fontawesome';

  function errorCB(err) {
    console.log("SQL Error: " + err.message);
  }
  
  function successCB() {
    console.log("SQL executed fine");
  }
  
  function openCB() {
    console.log("Database OPENED");
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
        tableHead: ['Head', 'Head2', 'Head3', 'Head4'],
        tableData: [
          ['1', '2', '3', '4'],
          ['a', 'b', 'c', 'd'],
          ['1', '2', '3', '456\n789'],
          ['a', 'b', 'c', 'd']
        ]
      }


      const data = [
        { label: 'Wallet 1', value: '1' },
        
      ];
    

const Home = ({route, navigation}) => {

    const state = this.state;
    const [currentWalletName, setCurrentWalletName] = useState("");
    const [currentAddresses, setCurrentAddresses] = useState([]);

    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Select Wallet
          </Text>
        );
      }
      return null;
    };

    var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

    var create_first_address=0;
    
    var app_pw_enc = "";
    var mnemonic_enc = "";
    var word25_enc = "";

    db.transaction((tx) => {

        

        tx.executeSql('SELECT app_pw_enc FROM application', [], (tx, results) => {
        
            var len = results.rows.length;
            for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);
              app_pw_enc = row.app_pw_enc;
            }

            db.transaction((tx) => {

               tx.executeSql('SELECT new_user_flag FROM application', [], (tx, results) => {
           
       
                  var len = results.rows.length;
                   for (let i = 0; i < len; i++) {
                  let row = results.rows.item(i);


                      if(row.new_user_flag = 1){
                      create_first_address=1;
                     tx.executeSql('UPDATE application SET new_user_flag = 0 ', [], (tx, results) => {},errorCB);
                     }
             
                   }
      

                //    if(true){

                    // console.log("In true;")
                   if(create_first_address == 1){
                     tx.executeSql('SELECT mnemonic_enc, word25_enc FROM wallet WHERE id=1', [], (tx, results) => {
        
                        var len = results.rows.length;
                        for (let i = 0; i < len; i++) {
                            let row = results.rows.item(i);
                            mnemonic_enc = row.mnemonic_enc;
                            word25_enc = row.word25_enc;
                        }
                   
                   
                        var mnemonic = decrypt(mnemonic_enc, app_pw_enc);
                        console.log("HOME MNEMONIC: " +mnemonic);
     
                        var word25 = decrypt(word25_enc, app_pw_enc);
                        var seed = bip39.mnemonicToSeedSync(mnemonic,word25).toString('hex');
     
                        var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'))
                        var childkey = hdkey.derive("m/44'/1022'/0'/0/0'")
                        
     
                         console.log("Home PUB KEY: "+ childkey.publicKey.toString('hex'))
         
                         console.log("Home PRIV KEY: "+ childkey.privateKey.toString('hex'))
                        var readdr_bytes = Buffer.concat([Buffer.from([0x04]), childkey.publicKey]);
                        var readdr_bytes5 = convertbits(Uint8Array.from(readdr_bytes), 8, 5, true);
                        console.log(readdr_bytes5);
                         var rdx_addr = bech32.encode("rdx", readdr_bytes5);
                          console.log("Home RDX KEY: "+ rdx_addr);
                      
                   
                   
                    }, errorCB);

 
    
                }


             }, errorCB);
          });
      





        
              // Alternatively, you can use the non-standard raw method.
        
              /*
                let rows = results.rows.raw(); // shallow copy of rows Array
        
                rows.map(row => console.log(`Employee name: ${row.name}, Dept Name: ${row.deptName}`));
              */
            }, errorCB);
        });
        



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
     <View  > 
     
        
<Text style={styles.title}>XRD Balance: </Text>


<View style={styles.container}>
        {renderLabel()}
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select item' : '...'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
          }}
          
        />
                <FontAwesome icon={SolidIcons.smile} />
        <FontAwesome icon={RegularIcons.smileWink} />
        <FontAwesome icon={BrandIcons.github} />
      </View>



<Table borderStyle={{borderWidth: 0, borderColor: '#808080'}}>
          <Row data={state.tableHead} />
          <Rows data={state.tableData} />
        </Table>
  </View> 
  </SafeAreaView>
  )
  ;
};


const styles = StyleSheet.create({
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
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

});



export default Home;
