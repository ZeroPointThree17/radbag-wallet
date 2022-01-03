import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from "./HomeScreen";
import Settings from "./Settings";
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
 import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


const Tab = createBottomTabNavigator();


function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function HomeScreen1() {
  return (
    <NavigationContainer independent={true}>
<Text> sffssf </Text>
<Text> sffssf </Text>
      <MyTabs >   </MyTabs>

    </NavigationContainer>
    
);
}

//export default createAppContainer(navigator);
