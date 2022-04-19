import React from 'react';
import { TouchableOpacity, ScrollView, Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import IconFeather from 'react-native-vector-icons/Feather';
import {showMessage} from "react-native-flash-message";
import { Separator } from '../helpers/jsxlib';
import { getAppFont, copyToClipboard } from '../helpers/helpers';
import RenderHtml from 'react-native-render-html';


const Sign = ({route, navigation}) => {
 
  // const [initialised, setInitialised] = useState(false);

  // useEffect(() => {
  //   AppState.addEventListener('change', handleAppStateChange);
  //   if (Linking.getInitialURL() !== null) {
  //     AppState.removeEventListener('change', handleAppStateChange);        
  //   }
  // }, []);

  // const handleAppStateChange = async (event) => {
  //   const initial = await Linking.getInitialURL();
    
  //   if (initial !== null && !initialised) {
  //     setInitialised(true);
  //     // app was opened by a Universal Link
  //     // custom setup dependant on URL...
  //   }
  // }

  // const { unbuiltTxn, description } = route.params;
  const { width } = useWindowDimensions();

//   const source = {
//     html: `
// <table class="jh-type-object jh-root"><tbody class="">
// <tr><th class="jh-key jh-object-key">network_identifier</th>
// <td class="jh-value jh-object-value"><table class="jh-type-object"><tbody class=""><tr>
// <th class="jh-key jh-object-key">network</th><td class="jh-value jh-object-value">
// <span class="jh-type-string">mainnet</span></td></tr></tbody></table>
// </td></tr><tr><th class="jh-key jh-object-key">actions</th><td class="jh-value jh-object-value">
// <table class="jh-type-array"><tbody class=""><tr><th class="jh-key jh-array-key">0</th><td class="jh-value jh-array-value">
// <table class="jh-type-object"><tbody class=""><tr><th class="jh-key jh-object-key">type</th><td class="jh-value jh-object-value">
// <span class="jh-type-string">TransferTokens</span></td></tr><tr><th class="jh-key jh-object-key">from_account</th><td class="jh-value jh-object-value"><table class="jh-type-object"><tbody class=""><tr><th class="jh-key jh-object-key">address</th><td class="jh-value jh-object-value"><span class="jh-type-string">rdx1qspacch6qjqy7awspx304sev3n4em302en25jd87yrh4hp47grr692cm0kv88</span></td></tr></tbody></table></td></tr><tr><th class="jh-key jh-object-key">to_account</th><td class="jh-value jh-object-value"><table class="jh-type-object"><tbody class=""><tr><th class="jh-key jh-object-key">address</th><td class="jh-value jh-object-value"><span class="jh-type-string">rdx1qspcvwwuf8s549zyspz683v4n93g9kzpn6u6a9yalwzt00zghg75lmsftwv29</span></td></tr></tbody></table></td></tr><tr><th class="jh-key jh-object-key">amount</th><td class="jh-value jh-object-value"><table class="jh-type-object"><tbody class=""><tr><th class="jh-key jh-object-key">token_identifier</th><td class="jh-value jh-object-value"><table class="jh-type-object"><tbody class=""><tr><th class="jh-key jh-object-key">rri</th><td class="jh-value jh-object-value"><span class="jh-type-string">xrd_rr1qy5wfsfh</span></td></tr></tbody></table></td></tr><tr><th class="jh-key jh-object-key">value</th><td class="jh-value jh-object-value"><span class="jh-type-string">123000000000000000</span></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><th class="jh-key jh-object-key">fee_payer</th><td class="jh-value jh-object-value"><table class="jh-type-object"><tbody class=""><tr><th class="jh-key jh-object-key">address</th><td class="jh-value jh-object-value"><span class="jh-type-string">rdx1qspacch6qjqy7awspx304sev3n4em302en25jd87yrh4hp47grr692cm0kv88</span></td></tr></tbody></table></td></tr><tr><th class="jh-key jh-object-key">disable_token_mint_and_burn</th>
// <td class="jh-value jh-object-value"><div><span class="jh-type-bool-true">true</span></div></td></tr></tbody></table>
//   `
//   };

  
 return ( 
  <View style={styles.container}> 
    <ScrollView styles={{backgroundColor:"white"}}>
      <View style={styles.container}> 
       <Text style={[{textAlign:'center', fontWeight:'bold'}, getAppFont("black")]}>Transaction Sign Request</Text>
       <Separator/>
{/* <QRCode 
     value={xrdAddress}
     logoSize={100}
     size={200}
   /> */}
   <Separator/>
   <Separator/>
   
   <Text style={[{textAlign:'center', fontWeight:'bold'}, getAppFont("black")]}>Transaction:</Text>
   <Separator/>
   <Separator/>
   {/* <RenderHtml
      contentWidth={width}
      source={source}
    /> */}
      <Separator/>
   <Separator/>
   <Text style={[{textAlign:'center', fontWeight:'bold'}, getAppFont("black")]}>Description from transaction builder:</Text>
   {/* <Text style={[{textAlign:'center'}, getAppFont("black")]}>{xrdAddress}</Text> */}

   <Separator/>
   <Separator/>
 
   {/* <TouchableOpacity style={styles.button} onPress={ () => {copyToClipboard(xrdAddress)}}>
   <View style={styles.rowStyle}>
   <IconFeather name="copy" size={20} color="black" />
<Text style={getAppFont("black")}> Copy address to clipboard</Text>
</View>
</TouchableOpacity> */}
<TouchableOpacity onPress={() => {  }
  
  }>
        <View style={[styles.sendRowStyle]}>
        <View style ={[styles.sendRowStyle,{borderWidth:1, borderRadius:15, padding: 10, marginRight:10, backgroundColor:"#183A81"}]}>
        <Text style={[{fontSize: 19, color:"black", alignSelf:"center"}, getAppFont("white")]}>Submit</Text>
        </View>
        <View style ={[styles.sendRowStyle,{borderWidth:1, borderRadius:15, padding: 10, marginLeft:10, backgroundColor:"red"}]}>
        <Text style={[{fontSize: 19, color:"black", alignSelf:"center"}, getAppFont("white")]}>Reject</Text>
        </View>
        </View>
        </TouchableOpacity>
  </View>
  </ScrollView>
  </View>
  )
};


const styles = StyleSheet.create({

  sendRowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical:0
  },
  container: {
    flex: 1,
    padding: 30,
    margin: 0,
    backgroundColor: "white",
    alignItems:"center",
    justifyContent: "center"
   },
      rowStyle: {
        flexDirection: 'row',
        fontSize: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical:5
      },
});

export default Sign;
