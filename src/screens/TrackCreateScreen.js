//enable import _mocklocation.js to produce fake location data
// import '../_mockLocation';
import React,{useContext,useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-elements';
import {SafeAreaView, withNavigationFocus} from 'react-navigation';
import Map from '../components/Map';
import {Context as LocationContext} from '../context/LocationContext-tracker';
import useLocation from '../hooks/useLocation';
import TrackForm from '../components/TrackForm';
import {FontAwesome} from '@expo/vector-icons'

const TrackCreateScreen = ({isFocused})=>{

  const { addLocation, state: {recording} } = useContext(LocationContext);
  const callback = useCallback(
    (location) => { //location will be provided by watchPositionAsync when calling this fn
    addLocation(recording, location)
    },
    [recording]
    )
  const [err] = useLocation( isFocused || recording, callback );

  return (
    <SafeAreaView forceInset={{top: 'always'}}>
      <Text h2>Create a Track</Text>
      <Map />
      {err ? <Text>Please enable location services.</Text> : null }
      <TrackForm />
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({});

TrackCreateScreen.navigationOptions = {
  title: 'Add Track',
  tabBarIcon: <FontAwesome name="plus" size={20} />
};

export default withNavigationFocus(TrackCreateScreen);
//withNavigationFocus provides with the 'isFocused' prop, which is a boolean. 
//Becomes false when navigating away
