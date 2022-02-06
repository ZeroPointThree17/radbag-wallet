import React from 'react';
import { ScrollView, Text, Image, View, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
var Raddish = require("../assets/radish_nobackground.png");
import { SeparatorBorder } from '../helpers/jsxlib';

 const Settings = ({route, navigation}) => {
 return ( 
  <View style={{flex:1}}>
     <ScrollView style={{flex:1}}> 


 
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
 <Text style={{fontSize:14,  color: 'black', fontWeight: 'bold', flex:1  }}>Show Mnemonic</Text>

    </ListItem.Title>

    <ListItem.Subtitle  >
      <Text style={{fontSize:14,  color: 'black', flexWrap: 'wrap', flex:1 }}>Show the mnemonic phrase that you set up when you created this wallet</Text>
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
    <ListItem.Title style={{fontSize:14,  color: 'black', fontWeight: 'bold' }}>
      <Text>Address Options</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{fontSize:14,  color: 'black' }}>
      <Text>Options for the currently selected address</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<SeparatorBorder/>

<ListItem
 onPress={() => {navigation.navigate('Wallet Options')}}
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
    <ListItem.Title style={{fontSize:14,  color: 'black', fontWeight: 'bold' }}>
      <Text>Wallet Options</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{fontSize:14,  color: 'black' }}>
      <Text>Options for the currently selected wallet</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<SeparatorBorder/>


</ScrollView>

<View style={{flex:1,justifyContent:"center" , alignSelf:"center"}}>
<Image style={{margin: 0, padding:20, width: 50, height: 80, alignSelf:'center'}}
    source={Raddish}/>
    <Text style={{ alignSelf:'center'}}>Raddish Wallet v.1.1.7</Text>
</View>

 
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
