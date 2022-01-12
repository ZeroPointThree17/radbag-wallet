import React from 'react';
import { Text, FlatList, SectionList, View, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { ListItem, Avatar } from 'react-native-elements';
import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo
import  IconMaterial  from 'react-native-vector-icons/MaterialCommunityIcons';


const Separator = () => (
  <View style={styles.separator} />
);

const list = [
  {
    name: 'Amy Farha',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    subtitle: 'Vice President'
  },
  {
    name: 'Chris Jackson',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    subtitle: 'Vice Chairman'
  },
];

 const Settings = () => {
 return ( 
     <View > 


  <View>
  <ListItem
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
<IconMaterial name="file-word-box-outline" size={30} color="#4F8EF7" />
  <ListItem.Content>
    <ListItem.Title style={{ color: 'black', fontWeight: 'bold' }}>
    
 <Text>Show Mnemonic</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{ color: 'black' }}>
      <Text>Show the mnemonic phrase that you set up when you created the wallet</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>

<Separator/>
<ListItem
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
<IconMaterial name="rename-box" size={30} color="#4F8EF7"/>
  <ListItem.Content>
    <ListItem.Title style={{ color: 'black', fontWeight: 'bold' }}>
      <Text>Change Wallet Nickname</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{ color: 'black' }}>
      <Text>Change the nickname of this wallet</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
<Separator/>
<ListItem
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
<IconMaterial name="delete-forever-outline" size={30} color="#4F8EF7" />
  <ListItem.Content>
    <ListItem.Title style={{ color: 'black', fontWeight: 'bold' }}>
      <Text>Delete Wallet</Text>
    </ListItem.Title>
    <ListItem.Subtitle style={{ color: 'black' }}>
      <Text>Permanently delete this wallet</Text>
    </ListItem.Subtitle>
  </ListItem.Content>
  <ListItem.Chevron color="black" />
</ListItem>
  </View>  
  
  </View>)
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
   separator: {
    marginVertical: 0,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default Settings;
