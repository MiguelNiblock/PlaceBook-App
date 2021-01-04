import React,{useContext} from 'react';
import {Text,StyleSheet} from 'react-native';
import MapView, {Polyline,Circle} from 'react-native-maps';
import {Context as LocationContext} from '../context/LocationContext';

const Map = () => {
  const {state: {currentLocation}} = useContext(LocationContext);
  // console.log(currentLocation)

  if(!currentLocation) return null;

  // const points = []
  return (
    <MapView style={styles.map}
      initialRegion={{
        ...currentLocation.coords,
        latitudeDelta:0.01,
        longitudeDelta:0.01,
      }}
      region={{
        ...currentLocation.coords,
        latitudeDelta:0.01,
        longitudeDelta:0.01,
      }}
    >
      {/* <Polyline 
        coordinates={points}
      /> */}
      <Circle 
        center={currentLocation.coords}
        radius={30}
        strokeColor="rgba(158,158,255,1)"
        fillColor="rgba(158,158,255,.3)"
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 300
  }
})

export default Map;