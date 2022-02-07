import React from 'react';
import { ScrollView, Text, Image, View, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';
var Raddish = require("../assets/radish_nobackground.png");
import { SeparatorBorder } from '../helpers/jsxlib';
import IconFA5 from 'react-native-vector-icons/FontAwesome5';

 const AdvancedOptions = ({route, navigation}) => {
 return ( 
  <View style={{flex:1}}>
     <ScrollView style={{flex:1}}> 


 
  <SeparatorBorder/>

 <ListItem
  onPress={() => {navigation.navigate('Token Creator')}}
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

<IconFA5 name="coins" size={20} color="#4F8EF7" />

  <ListItem.Content >
  
    <ListItem.Title >
 <Text style={{fontSize:14,  color: 'black', fontWeight: 'bold', flex:1, fontFamily:"AppleSDGothicNeo-Regular"  }}>Token Creator</Text>

    </ListItem.Title>

    <ListItem.Subtitle  >
      <Text style={{fontSize:14,  color: 'black', flexWrap: 'wrap', flex:1, fontFamily:"AppleSDGothicNeo-Regular" }}>Mint new tokens on the Radix DLT ledger</Text>
    </ListItem.Subtitle>

  </ListItem.Content>
  <ListItem.Chevron color="black" />
  
</ListItem>

<SeparatorBorder/>

</ScrollView>
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

export default AdvancedOptions;
