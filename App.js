import './shim';
import 'react-native-gesture-handler'
import React, {useRef, useState, useEffect } from 'react';
import type {Node} from 'react';
import { ScrollView, StyleSheet, AppState, View, SafeAreaView, useColorScheme, LogBox, Alert } from 'react-native';
import { NavigationContext, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
var SQLite = require('react-native-sqlite-storage');
import FlashMessage from "react-native-flash-message";
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import RNBootSplash from 'react-native-bootsplash';
import Welcome from './src/screens/Welcome';
import CreateWallet from './src/screens/CreateWallet';
import HomeNav from './src/screens/HomeNav';
import AppDataSave from './src/screens/AppDataSave';
import MnemonicInput from './src/screens/MnemonicInput';
import Send from './src/screens/Send';
import Receive from './src/screens/Receive';
import Staking from './src/screens/Staking';
import ImportSelect from './src/screens/ImportSelect';
import HardwareWallet from './src/screens/HardwareWallet';
import {openCB, errorCB, useInterval} from './src/helpers/helpers';
import { PinCode, PinCodeT } from 'fedapay-react-native-pincode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Separator } from './src/helpers/jsxlib';


var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);


function navContainer(Stack, firstTimer, correctPin, isPINEnabled, setCorrectPin){

  var navContainerJSX = [];

  const customTexts = {

    enter: {
      title: 'Enter PIN',
      subTitle: 'Enter 6-digit PIN to access RadBag Wallet',
      error: 'Wrong PIN',
      backSpace: 'Del',
      footerText: undefined
    },
  }

  navContainerJSX.push(
  <React.Fragment>
    <View style={{ alignItems: "center", backgroundColor: "#183A81",height: correctPin == false && isPINEnabled? "100%" : "0%"}}>
    <Separator/>
    <ScrollView contentContainerStyle={{alignContents: "center", justifyContent: "center"}}>
    <PinCode allowReset="false" mode={PinCodeT.Modes.Enter} visible={firstTimer == false && correctPin == false && isPINEnabled} 
textOptions={customTexts}
onEnterSuccess={(pin) => setCorrectPin(true)}

options={{
  pinLength: 6,
  maxAttempt: 999999999,
  lockDuration: 10000,
  allowedReset: false,
  disableLock: false,
  dotColor: "white"  
}}

styles={{ 
  main: { backgroundColor:"#183A81" },
  enter: {
    titleContainer: { borderWidth: 0 },
    title: { color: 'white' },
    subTitle: { color: 'white' },
    buttonContainer: { borderWidth: 0 , color: 'white' },
    buttonText: { color: 'white' },
    buttons: { backgroundColor: 'white', borderWidth: 1 },
    footer: { borderWidth: 0 },
    footerText: { color: 'purple' },
    pinContainer: { borderWidth: 0,  },
  }}
}
 /> 
  </ScrollView>
  </View>

<NavigationContainer onReady={() => RNBootSplash.hide()}>

<Stack.Navigator screenOptions={{
headerStyle: {
backgroundColor: '#183A81',
},
headerTintColor: '#fff',
headerTitleStyle: {
fontWeight: 'bold'
},
}}>{ firstTimer == true
?<Stack.Screen name="Welcome to the RadBag Wallet!" component={Welcome} options={{ headerTitleAlign: 'center' }}/>:<Stack.Screen name="RadBag Wallet " component={HomeNav} options={{headerShown: false ,headerLeft: () => null, gestureEnabled: false}} />}
<Stack.Screen name="Mnemonic" component={CreateWallet} options={{ headerTitleAlign: 'center' }}/>
<Stack.Screen name="Mnemonic Input" component={MnemonicInput} options={{ headerTitleAlign: 'center' }}/>
<Stack.Screen name="Wallet Password" component={AppDataSave} options={{ headerTitleAlign: 'center' }}/>
<Stack.Screen name="RadBag Wallet" component={HomeNav} options={{headerShown: false ,headerLeft: () => null, gestureEnabled: false}} />
<Stack.Screen name="Send" component={Send} options={{ headerTitleAlign: 'center' }}/>
<Stack.Screen name="Receive" component={Receive} options={{ headerTitleAlign: 'center' }}/>
<Stack.Screen name="Staking" component={Staking} options={{ headerTitleAlign: 'center' }}/>
<Stack.Screen name="Import Select" component={ImportSelect} options={{ headerTitleAlign: 'center' }}/>
<Stack.Screen name="Hardware Wallet" component={HardwareWallet} options={{ headerTitleAlign: 'center' }}/>

</Stack.Navigator>
<FlashMessage position="center" style={{height:60}}/>
</NavigationContainer>
</React.Fragment>
)

return navContainerJSX;
}



const App: () => Node = () => {

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [correctPin, setCorrectPin] = useState(true);
  global.gateways = ["https://raddish-node.com:6208","https://mainnet.clana.io","https://mainnet-gateway.radixdlt.com"]
  
  useEffect(() => {

    AsyncStorage.setItem('@gatewayIdx',"0");

    AsyncStorage.getItem('@AppPIN').then( (appPin) => {
      setIsPINEnabled(appPin != undefined);
    })

    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        setCorrectPin(false)
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useInterval(() => {
    AsyncStorage.getItem('@AppPIN').then( (appPin) => {
      setIsPINEnabled(appPin != undefined);
    })
  }, 3500);


  const isDarkMode = useColorScheme() === 'dark';
  const navigation = React.useContext(NavigationContext);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const Stack = createStackNavigator();

const [firstTimer, setFirstTimer] = useState(true);
const [isPINEnabled, setIsPINEnabled] = useState(true);

db.transaction((tx) => {
  tx.executeSql("SELECT new_user_flag FROM application", [], (tx, results) => {
  
          var len = results.rows.length;
                
          var new_user_flag = 0;
          for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);
              new_user_flag = row.new_user_flag;
          }

          if(new_user_flag == 0){
            setFirstTimer(false); 
          }

  }, errorCB('Getting new user flag failed.'));
}); 


LogBox.ignoreAllLogs();

var jsx = undefined


jsx = navContainer(Stack, firstTimer, correctPin, isPINEnabled, setCorrectPin)


  return (
    jsx
  );

};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default App;