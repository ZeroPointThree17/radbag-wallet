import React, {useState} from 'react';
import { Button, Text, TextInput, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
import { decrypt } from '../helpers/encrypt';
var SQLite = require('react-native-sqlite-storage');
import PasswordInputText from 'react-native-hide-show-password-input';
import { catchError } from 'rxjs/operators';
import SelectDropdown from 'react-native-select-dropdown'
import Clipboard from '@react-native-clipboard/clipboard';

const Separator = () => (
  <View style={styles.separator} />
);



function buildTxn(sourceXrdAddr,xrdAddr, rri, amount, setFee){

  amount = BigInt(amount) * 1000000000000000000n;

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
                "type": "TransferTokens",
                "from_account": {
                  "address": sourceXrdAddr
                },
                "to_account": {
                  "address": xrdAddr
                },
                "amount": {
                  "token_identifier": {
                    "rri": rri
                  },
                  "value": amount
                }
              }
            ],
            "fee_payer": {
              "address": sourceXrdAddr
            },
            "disable_token_mint_and_burn": true
          } 
      
        )
      }).then((response) => response.json()).then((json) => {

        //  alert(JSON.stringify(json));
          // activeAddressBalances
          if(!(json === undefined) && json.hasOwnProperty("transaction_build") ){
            
            setFee(json.transaction_build.fee.value);
             
          }
      }).catch((error) => {
          console.error(error);
      });
}



 const Send = ({route, navigation}) => {
 
  const { balancesMap, sourceXrdAddr } = route.params;
  const [ copiedText, setCopiedText ] = useState();

  const fetchCopiedText = async () => {
    const text = await Clipboard.getString();
    setCopiedText(text);
  };

  var rris = []
  balancesMap.forEach((balance, rri) => {
    rris.push(rri)
  });
  

  const [xrdAddr, onChangeXrdAddr] = useState(null);
  const [amount, onChangeAmount] = useState(null);
  const [rri, onChangeRRI] = useState(null);
  const [fee, setFee] = useState(null);



 return ( 
     <View style={styles.container}> 
      <Separator/>
      <Separator/>
      <Text style={{fontWeight:"bold",textAlign:'center', marginHorizontal: 25, fontSize:20}}>Wallet Name</Text>
      <Separator/>
        <Text style={{textAlign:'center', marginHorizontal: 25, fontSize:20}}>Enter the Radix address to send to:</Text>
        <Separator/>

        <TextInput
        style={{inputWidth:'auto', paddingHorizontal:10, marginHorizontal: 10, height: 300, borderWidth:StyleSheet.hairlineWidth}}
        onChangeText={onChangeXrdAddr}
        value={copiedText}
        placeholder="Radix address"
      />

<Button  style={{marginHorizontal: 25}}
                title="Paste"
                enabled
                onPress={() => fetchCopiedText}
              />
      

<SelectDropdown
	data={rris}
	onSelect={(selectedItem, index) => {
		onChangeRRI(selectedItem)
	}}
	buttonTextAfterSelection={(selectedItem, index) => {
		// text represented after item is selected
		// if data array is an array of objects then return selectedItem.property to render after item is selected
		return selectedItem
	}}
	rowTextForSelection={(item, index) => {
		// text represented for each item in dropdown
		// if data array is an array of objects then return item.property to represent item in dropdown
		return item
	}}
/>

<TextInput
        style={{paddingHorizontal:10, marginHorizontal: 10, height: 30, borderWidth:StyleSheet.hairlineWidth}}
        onChangeText={onChangeAmount}
        value={xrdAddr}
        placeholder="Amount"
      />



        <Button  style={{marginHorizontal: 25}}
                title="Send"
                enabled
                onPress={() => buildTxn(sourceXrdAddr, xrdAddr, rri, amount,setFee)}
              />
              <Separator/>
              <Separator/>
              <Separator/>
<Text>Copied Text: {copiedText}</Text>
              

        

<Separator/>


  </View>)
};


const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: "white",
    justifyContent: "flex-start"
   },

   separator: {
    marginVertical: 10,
    borderBottomColor: '#737373',
    borderBottomWidth: 0,
  },
});

export default Send;
