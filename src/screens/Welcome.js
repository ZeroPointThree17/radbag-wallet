import React from 'react';
import {Image, ScrollView, Button, SafeAreaView, View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from "react-native-svg"
import { Separator } from '../helpers/jsxlib';
import { getAppFont } from '../helpers/helpers';


function navigateToCreateWallet(navigation){

  navigation.navigate('Mnemonic', {
    firstTimeStr: "true"
  });
}

const Welcome = ({ navigation }) => {

  return (

    <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.container}>
        <Image
        style={{width:140, height:180}}
        source={require('../assets/radish_nobackground.png')}
      />
     <View style={styles.text}> 
   
 <Text style={[styles.title,getAppFont("black")]}>Welcome to the RadBag Wallet!{"\n"}Have you previously made a Radix DLT Wallet?</Text>
 <Separator/>
 <Button style={getAppFont("black")}
        title="Yes - Import a Wallet"
        enabled
        onPress={() => navigation.navigate('Import Select', {firstTimeStr: "true"})}
      />
      {Platform.OS != 'ios' && <Separator/>}
 <Button style={getAppFont("black")}
        title="No - Create New Wallet"
        color = 'red'
        enabled
        onPress={() => navigateToCreateWallet(navigation)
          }
      />

  </View> 
<Separator/>
<Separator/>

<Text style={getAppFont("black")}>Powered by:</Text>
     <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={94}
    height={24}
    fill="none"
   
  >
    <Path
      fill="#003057"
      d="M22.105 9.765h6.35c1.79 0 3.195.523 4.11 1.41a4.252 4.252 0 0 1 1.177 3.043v.04c0 2.319-1.405 3.709-3.378 4.274l3.846 5.342h-2.972l-3.5-4.918h-3.133v4.918h-2.5V9.764zm6.167 6.995c1.79 0 2.93-.935 2.93-2.358v-.042c0-1.51-1.099-2.338-2.951-2.338h-3.646v4.738h3.667zm15.604-7.093h2.32l6.267 14.216h-2.644l-1.444-3.406h-6.736l-1.466 3.406H37.61l6.267-14.216zm3.587 8.604-2.454-5.645-2.455 5.649 4.91-.004zm9.077-8.506h5.31c4.477 0 7.57 3.043 7.57 7.016v.04c0 3.97-3.093 7.055-7.57 7.055h-5.31V9.765zm2.503 2.257v9.596h2.807c2.99 0 4.945-1.996 4.945-4.757v-.04c0-2.762-1.954-4.799-4.945-4.799h-2.807zM76.3 9.765h-2.503v14.11H76.3V9.766zm17.515 0-4.963 6.894 5.167 7.217h-2.95l-3.764-5.382-3.746 5.382h-2.868l5.15-7.178-4.946-6.933h2.95l3.541 5.12 3.561-5.12h2.868z"
    />
    <Path
      fill="#00C389"
      d="M10.428 20.906a1.425 1.425 0 0 1-1.148-.583l-5.617-7.708H0V9.809h4.388a1.423 1.423 0 0 1 1.148.582l4.59 6.296L17.128.84c.11-.25.292-.463.522-.612.23-.149.5-.228.775-.228h8.763v2.806h-7.836l-7.625 17.259a1.422 1.422 0 0 1-1.154.832c-.05.003-.1.003-.151 0"
    />
  </Svg>

  </ScrollView>
  
  </SafeAreaView>
  )
  ;
};


const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    // paddingTop: 40,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
    paddingHorizontal: 20,
    backgroundColor: 'white'
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
   title: {
    textAlign: 'center',
    marginVertical: 8
  },
  logo: {
    width: 66,
    height: 58,
  },
});

export default Welcome;
