import React from 'react';
import { Alert, Button, SectionList, View, Text, StyleSheet } from 'react-native';
import {
  Image,
  TouchableOpacity
} from 'react-native';
import DefaultImage from '../assets/favicon.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native'
import { BarCodeScanner } from 'expo-barcode-scanner';

import 'react-native-get-random-values'

const DEFAULT_IMAGE = Image.resolveAssetSource(DefaultImage).uri;

 import { Mnemonic, StrengthT } from '@radixdlt/application'


var mnemonic = Mnemonic.generateNew({ strength: StrengthT.WORD_COUNT_12 })


const storeData = async (value) => {
  try {
    await AsyncStorage.setItem('@storage_Key', value)
  } catch (e) {
    // saving error
  }
}

// const storeData = async (value) => {
//   try {
//     const jsonValue = JSON.stringify(value)
//     await AsyncStorage.setItem('@storage_Key', jsonValue)
//   } catch (e) {
//     // saving error
//   }
// }

// const getData = async () => {
//   try {
//     const jsonValue = await AsyncStorage.getItem('@storage_Key')
//     return jsonValue != null ? JSON.parse(jsonValue) : null;
//   } catch(e) {
//     // error reading value
//   }
// }


const getData = async () => {
  try {
    const value = await AsyncStorage.getItem('@storage_Key')
    if(value !== null) {
      console.log(value);
    }
  } catch(e) {
    // error reading value
  }
}

const showAlert = () => {
  Alert.alert(
    "Alert Title",
    `Bar code with type  and data has been scanned!`,
    [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      { text: "OK", onPress: () => console.log("OK Pressed") }
    ])
};

const showAlert2 = () => {
  alert(mnemonic.words);
};



const NFTs = () => { 
 // storeData("fsd");
  showAlert2();
 const isFocused = useIsFocused();

  
//  useEffect(() => {
//   getData()
// } , [isFocused]);

const [hasPermission, setHasPermission] = useState(null);
const [scanned, setScanned] = useState(false);

useEffect(() => {
  (async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === "granted");
  })();
}, []);

const handleBarCodeScanned = ({ type, data }) => {
  setScanned(true);
  alert(`Bar code with type ${type} and data ${data} has been scanned!`);
};

if (hasPermission === null) {
  return <Text>Requesting for camera permission</Text>;
}
if (hasPermission === false) {
  return <Text>No access to camera</Text>;
}


return (

<View>

<BarCodeScanner 
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        
      />
         {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
  <TouchableOpacity
  key='1'
  style={{
    width: 100,
    height: 100,
    paddingHorizontal: 1
  }}
  onPress={() => {
    
  }}>
  <Image
style={{width: 50, height: 50}} 
    source={{ uri: DEFAULT_IMAGE }}
  />
</TouchableOpacity>

 
  


 <Text>NFTs 2</Text>
 </View> 
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
  container: {
    flex: 1,
    paddingTop: 22
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
});

export default NFTs;
