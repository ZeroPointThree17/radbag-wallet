import './shim';
import React, { useState } from 'react';
import { StyleSheet, useColorScheme, LogBox } from 'react-native';
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
import {openCB, errorCB} from './src/helpers/helpers';


var db = SQLite.openDatabase("app.db", "1.0", "App Database", 200000, openCB, errorCB);

const Stack = createStackNavigator();


const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = React.useContext(NavigationContext);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };


const [firstTimer, setFirstTimer] = useState(true);

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


  return (

<NavigationContainer onReady={() => RNBootSplash.hide()}>
    <Stack.Navigator       screenOptions={{
        headerStyle: {
          backgroundColor: '#183A81',
          alignSelf: 'center',
          textAlign: 'center',
          alignContent: 'center',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          alignSelf: 'center',
          textAlign: 'center',
          alignContent: 'center',
          fontFamily:"AppleSDGothicNeo-Regular"
        },
      }}>{ firstTimer == true
  ?  <Stack.Screen name="Welcome to the Raddish Wallet!" component={Welcome}  options={{ headerTitleAlign: 'center' }}/>
  :     <Stack.Screen name="Raddish Wallet " component={HomeNav} options={{headerShown: false ,headerLeft: () => null, gestureEnabled: false}} />

}
     
      <Stack.Screen name="Mnemonic" component={CreateWallet} options={{ headerTitleAlign: 'center' }}/>
      <Stack.Screen name="Mnemonic Input" component={MnemonicInput} options={{ headerTitleAlign: 'center' }}/>
      <Stack.Screen name="App Password" component={AppDataSave} options={{ headerTitleAlign: 'center' }}/>
      <Stack.Screen name="Raddish Wallet" component={HomeNav} options={{headerShown: false ,headerLeft: () => null, gestureEnabled: false}} />
      <Stack.Screen name="Send" component={Send} options={{ headerTitleAlign: 'center' }}/>
      <Stack.Screen name="Receive" component={Receive} options={{ headerTitleAlign: 'center' }}/>
      <Stack.Screen name="Staking" component={Staking} options={{ headerTitleAlign: 'center' }}/>
    </Stack.Navigator>
    <FlashMessage position="center" style={{height:60}}/>
    </NavigationContainer>
  
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
