import React from 'react';
import {Text,StyleSheet} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';

const Map = () => {
  const points = []
  return (
    <MapView style={styles.map}
      // initialRegion={{
      //   latitude:,
      //   longitude:,
      //   latitudeDelta:,
      //   longitudeDelta:,
      // }}
    >
      <Polyline 
        coordinates={points}
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