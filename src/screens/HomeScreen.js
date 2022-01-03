import React from 'react';
import { SectionList, View, Text, StyleSheet } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen2 from "./HomeScreen2";
import NFTs from "./NFTs";

const Tab2 = createMaterialTopTabNavigator();
function MyTabs2() {
  return (

    <Tab2.Navigator>
      
      <Tab2.Screen name="Currencies" component={HomeScreen2} />
      <Tab2.Screen name="NFTs" component={NFTs} />
    </Tab2.Navigator>
 
  );
}

const HomeScreen = () => {
  return (
    <NavigationContainer independent={true}> 
    <View style={styles.text}><Text style={styles.text}>Balance: 0 Radix</Text></View>

    <MyTabs2 /> 
    {/* <View style={styles.text}> 
         <MyTabs2 /> 
  <Text style={styles.text}>Balance: 0 Radix</Text>
  <SectionList
          sections={[
            {title: 'Radix Network', data: ['[logo_here] 0 Radix (XRD)']},
          ]}
          renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
        />
  </View> */}
  </NavigationContainer>
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

export default HomeScreen;
