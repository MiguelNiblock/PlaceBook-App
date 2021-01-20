import React,{useEffect,useState,useRef} from 'react';
import MapView,{Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button } from 'react-native';
import * as Permissions from 'expo-permissions';

const MapScreen = ({navigation})=>{

  const [showMarker, setShowMaker] = useState(false);
  const [editMap,setEditMap] = useState(false);
  const [markerCoords,setMarkerCoords] = useState({});
  const markerRef = useRef();

  useEffect(()=>{
    const { status } = Permissions.askAsync(Permissions.LOCATION)
  })

  const handleLongPress = (e)=>{
    setMarkerCoords(e.nativeEvent.coordinate)
    setShowMaker(true)
    markerRef.current.showCallout();
    console.log(markerCoords)
  }

  return (
    <View style={styles.container}>
      <Button
        onPress={() => navigation.openDrawer()}
        title="Drawer"
      />
      
      <MapView style={editMap ? styles.map : {}}         
        onMapReady={() => {
          setEditMap(true)
        }}
        initialRegion={{
          "latitude": 37.421997503686995,
          "latitudeDelta": 0.018190238622558752,
          "longitude": -122.08399968221784,
          "longitudeDelta": 0.01765664666889677,
        }}
        provider="google"
        mapType="hybrid"
        showsUserLocation
        showsMyLocationButton
        zoomControlEnabled
        onRegionChangeComplete={(region)=>console.log(region)}
        // onUserLocationChange={}
        onLongPress={handleLongPress}
        onPress={()=>setShowMaker(false)}
      >
        {showMarker? <Marker draggable
          ref={markerRef}
          coordinate={{
            "latitude": markerCoords.latitude,
            "latitudeDelta": 0.018190238622558752,
            "longitude": markerCoords.longitude,
            "longitudeDelta": 0.01765664666889677,
          }}
          pinColor="rgba(0,100,255,1)"
          title="test"
        /> : null}
      </MapView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    marginLeft: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 150,
  }
});

export default MapScreen;