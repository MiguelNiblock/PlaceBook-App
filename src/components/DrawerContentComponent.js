//custom drawer content component. by default only the routes are shown as links
import React,{useEffect} from 'react';
import {ScrollView, Button } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { DrawerItems } from 'react-navigation-drawer';
import 

const DrawerContentComponent = (props) => {
  // useEffect(()=>{

  // })

  return (
    <ScrollView>
      <SafeAreaView
        style={{flex: 1}}
        forceInset={{ top: 'always', horizontal: 'never' }}
      >
        <DrawerItems {...props} />
        <Button title="button"/>
      </SafeAreaView>
    </ScrollView>
  );
};

export default DrawerContentComponent;