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
// import FontAwesome, { SolidIcons, RegularIcons, BrandIcons } from 'react-native-fontawesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Tab = createBottomTabNavigator();

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
      
    

const Home = ({route, navigation}) => {

    const {pw} = route.params;

    var pwStr = JSON.stringify(pw).replaceAll('"','');


    // var pwStr = 'a';

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
     
        
<Text style={styles.title}>Total XRD Balance: </Text>


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
          placeholder={!isFocus ? 'Select Wallet' : '...'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
          }}
          
        />
                {/* <FontAwesome icon={SolidIcons.smile} /> */}
      </View>

      <Text style={styles.title}>Add Address</Text>
      <Text style={styles.title}>Select Tokens for Summary</Text>
      <Separator/>
<Table borderStyle={{borderWidth: 0, borderColor: '#808080'}}>
          <Row data={state.tableHead} />
          <Rows data={state.tableData} />
        </Table>

        <Separator/>

        <Table borderStyle={{borderWidth: 0, borderColor: '#808080'}}>
          <Row data={state.tableHead} />
          <Rows data={state.tableData} />
        </Table>

        <Separator/>
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
