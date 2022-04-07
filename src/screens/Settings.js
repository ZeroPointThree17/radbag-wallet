import React, {useState, useEffect} from 'react';
import { RefreshControl, Switch, ScrollView, Text, Image, View, StyleSheet, Alert } from 'react-native';
import { ListItem } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
var Raddish = require("../assets/radish_nobackground.png");
import { Separator, SeparatorBorder } from '../helpers/jsxlib';
import IconAnt from 'react-native-vector-icons/AntDesign';
import { getAppFont, useInterval } from '../helpers/helpers';
import IconMaterialMain  from 'react-native-vector-icons/MaterialIcons'
import PINCode from '@dusan-ivanco/react-native-pincode'
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';


function onRefresh(refreshCount, setRefreshCount, setRefreshing, setTKUnlock) {
    
  setRefreshing(true);

  if(parseInt(refreshCount) % 10 == 0){
    setTKUnlock(true);
  }

  setRefreshCount(refreshCount+1);
  setRefreshing(false);
}

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  imageColor: '#e00606', // Android
  imageErrorColor: '#ff0000', // Android
  sensorDescription: 'Touch sensor', // Android
  sensorErrorDescription: 'Failed', // Android
  cancelText: 'Cancel', // Android
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: true, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};

function _pressHandler() {
  TouchID.authenticate('to demo this react-native component', optionalConfigObject)
    .then(success => {
      alert('Authenticated Successfully');
    })
    .catch(error => {
      alert(error.message)
    });
}


 const Settings = ({route, navigation}) => {



  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshCount, setRefreshCount] = React.useState(11);
  const [TKUnlock, setTKUnlock] = React.useState(false);

  const [isEnabled, setIsEnabled] = useState(false);


  useEffect(() => {
    AsyncStorage.getItem('@AppPIN').then( (appPin) => {
      setIsEnabled(appPin != undefined);
    })
  }, []);

  useInterval(() => {
    AsyncStorage.getItem('@AppPIN').then( (appPin) => {
      setIsEnabled(appPin != undefined);
    })
  }, 2000);

  const toggleSwitch = () => {

    if(!isEnabled){
      navigation.navigate('PIN')
    } else{
      AsyncStorage.removeItem('@AppPIN');
      setIsEnabled(false);
    }
    // setIsEnabled(previousState => !previousState);

    // if(!isEnabled){
    //   navigation.navigate('PIN')
    // }
  }

  TouchID.authenticate('to demo this react-native component')
  .then(success => {
    // Success code
  })
  .catch(error => {
    // Failure code
  });

 return ( 
  <View style={{flex:1}}>

     <ScrollView style={{flex:1}}
        refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => onRefresh(refreshCount, setRefreshCount, setRefreshing, setTKUnlock)}/>
            }>
  <SeparatorBorder/>

 <ListItem
  onPress={() => {navigation.navigate('Mnemonic Display')}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>

<IconMaterial name="file-word-box-outline" size={20} color="#4F8EF7" />

  <ListItem.Content >
  
    <ListItem.Title >
 <Text style={[{fontSize:14,  color: 'black', fontWeight: 'bold', flex:1  }, getAppFont("black")]}>Show Mnemonic</Text>

    </ListItem.Title>

    <ListItem.Subtitle  >
      <Text style={[{fontSize:14,  color: 'black', flexWrap: 'wrap', flex:1 }, getAppFont("black")]}>Show the mnemonic phrase that you set up when you created this wallet</Text>
    </ListItem.Subtitle>

  </ListItem.Content>
  <ListItem.Chevron color="black" />
  

</ListItem>


<SeparatorBorder/>


<ListItem
 onPress={() => {navigation.navigate('Address Options')}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>
<IconMaterial name="pound" size={20} color="#4F8EF7"/>
  <ListItem.Content>
    <ListItem.Title style={[{fontSize:14,  color: 'black', fontWeight: 'bold' }, getAppFont("black")]}>
      <Text>Address Options</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={[{fontSize:14,  color: 'black' }, getAppFont("black")]}>
      <Text>Rename or remove the currently selected address</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<SeparatorBorder/>

<ListItem
 onPress={() => {_pressHandler()}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
>
<IconMaterial name="wallet" size={20} color="#4F8EF7"/>
  <ListItem.Content>
    <ListItem.Title style={[{fontSize:14,  color: 'black', fontWeight: 'bold' }, getAppFont("black")]}>
      <Text>Wallet Options</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={[{fontSize:14,  color: 'black' }, getAppFont("black")]}>
      <Text>Rename or remove the currently selected wallet</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<SeparatorBorder/>




{TKUnlock && <React.Fragment><ListItem
 onPress={() => {navigation.navigate('Advanced Options')}}
  Component={TouchableScale}
  friction={90} //
  tension={100} // These props are passed to the parent component (here TouchableScale)
  activeScale={0.95} //
  linearGradientProps={{
    colors: ['#ffffff', '#ffffff'],
    start: { x: 1, y: 0 },
    end: { x: 0.2, y: 0 },
  }}
  ViewComponent={LinearGradient} // Only if no expo
><IconAnt name="API" size={20} color="#4F8EF7"/>
  <ListItem.Content>
    <ListItem.Title style={[{fontSize:14,  color: 'black', fontWeight: 'bold' }, getAppFont("black")]}>
      <Text>Advanced Options</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={[{fontSize:14,  color: 'black' }, getAppFont("black")]}>
      <Text>Options for advanced users</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<SeparatorBorder/>
</React.Fragment>
 }

<View style={[{backgroundColor:"white"}]}>
<View style={[styles.rowStyle, {marginLeft: 15, marginTop: 10, marginBottom: 10, flexDirection: "row"}]}>
<IconMaterialMain style={{alignSelf:"center"}} name="fiber-pin" size={20} color="#4F8EF7"/>
<Text style={[getAppFont("black"), {flex:1, marginLeft: 15, alignSelf:"center", fontWeight: 'bold'}]}>Enable App PIN?</Text>
<View style={{flex:0.1, alignItems:"flex-end", marginRight: 10}}>
<Switch 
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "blue" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={toggleSwitch}
        value={isEnabled}
      />
      </View>
      </View>
      </View>
      <SeparatorBorder/>

</ScrollView>


<View style={{flex: 0.7, justifyContent:"center" , alignSelf:"center"}}>
<Image style={{margin: 0, padding:0, width: 70, height: 90, alignSelf:'center'}}
    source={Raddish}/>
    <Text style={[{alignSelf:'center'}, getAppFont("black")]}>RadBag Wallet v2.8.3</Text>
</View>
 <Separator/><Separator/>
 </View>  
 )
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
  rowStyle: {
    flexDirection: 'row',
    fontSize: 4,
    justifyContent: 'center',
    marginVertical:5
  },
});

export default Settings;
