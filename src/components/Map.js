import React,{useContext} from 'react';
import {Text,StyleSheet} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import {Context as LocationContext} from '../context/LocationContext';

const Map = () => {
  const {state} = useContext(LocationContext);
  console.log(state.currentLocation)

  if(!state.currentLocation.coords) return null;

  // const points = []
  return (
    <MapView style={styles.map}
      initialRegion={{
        ...state.currentLocation.coords,
        latitudeDelta:0.01,
        longitudeDelta:0.01,
      }}
      region={{
        ...state.currentLocation.coords,
        latitudeDelta:0.01,
        longitudeDelta:0.01,
      }}
    >
      {/* <Polyline 
        coordinates={points}
      /> */}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 300
  }
})

export default Map;