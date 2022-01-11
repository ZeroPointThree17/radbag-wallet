import React from 'react';
import { SectionList, View, Text, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

const Separator = () => (
  <View style={styles.separator} />
);

const Settings = () => {
  return (
     <View > 
 <List.Item
    title="Show Mnemonic"
    description="Show the mnemonic phrase that you set up when you created the wallet."
    left={props => <List.Icon {...props} icon="settings" />}
  />
  <Separator/>

  <List.Item
    title="Delete Wallet"
    description="Permanently delete this wallet."
    left={props => <List.Icon {...props} icon="settings" />}
  />
  <Separator/>
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
   separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default Settings;
