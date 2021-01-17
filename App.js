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
import {Provider as AuthProvider} from './src/context/AuthContext';
import {Provider as ListProvider} from './src/context/ListContext';
import {Provider as TrackProvider} from './src/context/TrackContext';
import {setNavigator}  from './src/navigationRef';
import ResolveAuthScreen from './src/screens/ResolveAuthScreen'
import {FontAwesome} from '@expo/vector-icons';

const Drawer = createDrawerNavigator({
  Map: MapScreen,
  Account: AccountScreen
},{
  drawerBackgroundColor: 'rgba(100,25,33,33)',
  drawerPosition: 'right',
  drawerType: 'slide',
  contentComponent: DrawerContentComponent
});

const switchNavigator = createSwitchNavigator({
  ResolveAuth: ResolveAuthScreen,
  loginFlow: createStackNavigator({
    Signup: SignupScreen,
    Signin: SigninScreen
  }),
  mainFlow: Drawer
});

const App = createAppContainer(switchNavigator);


export default () => {
  return (
    <TrackProvider>
      <ListProvider>
        <AuthProvider>
          <App ref={ (navigator)=>{ setNavigator(navigator) }}/>
        </AuthProvider>
      </ListProvider>
    </TrackProvider>
  )
}