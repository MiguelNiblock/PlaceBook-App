import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs'; 
import { createDrawerNavigator } from 'react-navigation-drawer';

import DrawerContentComponent from './src/components/DrawerContentComponent'

import SigninScreen from './src/screens/SigninScreen';
import SignupScreen from './src/screens/SignupScreen';
import AccountScreen from './src/screens/AccountScreen';
import MapScreen from './src/screens/MapScreen';
import LocationListScreen from './src/screens/LocationListScreen';
import LocationEditScreen from './src/screens/LocationEditScreen';
import ListEditScreen from './src/screens/ListEditScreen';
import Callouts from './src/screens/Callouts';
import {Provider as AuthProvider} from './src/context/AuthContext';
import {Provider as ListProvider} from './src/context/ListContext';
import {Provider as LocationProvider} from './src/context/LocationContext';
import {Provider as LocationEditProvider} from './src/context/LocationEditContext'
import {Provider as ListQueueProvider} from './src/context/ListQueueContext';
import {Provider as LocationQueueProvider} from './src/context/LocationQueueContext';
import {setNavigator}  from './src/navigationRef';
import ResolveAuthScreen from './src/screens/ResolveAuthScreen'

console.disableYellowBox = true;
// import { LogBox } from "react-native"
// LogBox.ignoreAllLogs(true)

const Drawer = createDrawerNavigator({
  Map: MapScreen,
},{
  // drawerBackgroundColor: 'rgba(100,25,33,33)',
  drawerPosition: 'right',
  drawerType: 'slide',
  contentComponent: DrawerContentComponent,
});

Drawer.navigationOptions = {
  headerShown: false
}

const Stack = createStackNavigator({
  Drawer,
  LocationList: LocationListScreen,
  LocationEdit: LocationEditScreen,
  ListEdit: ListEditScreen,
  Account: AccountScreen
})


const switchNavigator = createSwitchNavigator({
  mainFlow: Stack,
  ResolveAuth: ResolveAuthScreen,
  loginFlow: createStackNavigator({
    Signin: SigninScreen,
    Signup: SignupScreen
  })
});

const App = createAppContainer(switchNavigator);

export default () => {
  return (
    <AuthProvider>
      <ListQueueProvider>
        <LocationQueueProvider>
          <ListProvider>    
            <LocationProvider>
              <LocationEditProvider>              
                <App ref={ (navigator)=>{ setNavigator(navigator) }}/>
              </LocationEditProvider>
            </LocationProvider>
          </ListProvider>
        </LocationQueueProvider>
      </ListQueueProvider>
    </AuthProvider>
  )
}