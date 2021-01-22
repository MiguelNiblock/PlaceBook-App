import React,{useEffect,useState,useRef} from 'react';
import MapView,{Marker,Callout} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import Location,{reverseGeocodeAsync} from 'expo-location';
import CustomCallout from './CustomCallout';
import {navigate} from '../navigationRef'


const MapScreen = ({navigation})=>{

  const [markerOpacity, setMarkerOpacity] = useState(0);
  const [showMarker, setShowMarker] = useState(true)
  const [editMap,setEditMap] = useState(false);//workaround for bug: mapview not showing controls
  const [markerCoords,setMarkerCoords] = useState({latitude:37.42459028327157, longitude:-122.08799198269844});//there must be inital coords for markerRef to be defined. will have 0 opacity initially anyway
  const markerRef = useRef();
  const [address,setAddress] = useState('');
  const [addressCallout,setAddressCallout] = useState('')

  useEffect(()=>{
    const { status } = Permissions.askAsync(Permissions.LOCATION)
  });

  const handleLongPress = async(e)=>{
    if (showMarker===false) setShowMarker(true);
    if (showMarker===true) markerRef.current.hideCallout();
    setMarkerCoords(e.nativeEvent.coordinate);  
    if (markerOpacity === 0) setMarkerOpacity(1); 
    const [{name,street,city,region,postalCode,country}] = await reverseGeocodeAsync({
      ...e.nativeEvent.coordinate
    });
    setAddress(`${name} ${street}\n${city}, ${region}\n${postalCode}, ${country}`);
    setAddressCallout(`${name} ${street}, ${city}, ${region} ${postalCode}`);
    markerRef.current.showCallout();
    // markerRef.current.redraw();
  };

  const saveLocation = ()=>{
    const loc = {
      _id:null,
      name:'',
      address,
      coords:markerCoords,
      notes:'',
      stars:0,
      tags:'',
      listId:null
    }
    const list = {
      _id:null,
      name:'None'
    }
    navigate('LocationEdit',{loc, list})
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={() => navigation.openDrawer()}
        title="Drawer"
      />
      {showMarker ?
      <Button
        onPress={saveLocation}
        title="Save"
      /> :
      null
      }
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
        onPress={()=>setShowMarker(false)}
      >
      {showMarker ?//becomes false when onPress mapview
        <Marker draggable
          opacity={markerOpacity}//initially 0. Allows markerRef to be defined on first load
          ref={markerRef}
          coordinate={{
            "latitude": markerCoords.latitude,
            "latitudeDelta": 0.018190238622558752,
            "longitude": markerCoords.longitude,
            "longitudeDelta": 0.01765664666889677,
          }}
          pinColor="rgba(0,100,255,1)"
          title="Address:"
          description={address}
        >
          <Callout tooltip style={styles.customView} onPress={() => Alert.alert('callout pressed')}>
            <CustomCallout>
              <Text>{addressCallout}</Text>
              {/* <Button style={[styles.calloutButton]}
                title="Save"
                onPress={() => Alert.alert('button pressed')}
              /> */}
            </CustomCallout>
          </Callout>
        </Marker> :
      null}
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
  },
  customView: {
    width: 140,
    height: 100,
  },
  calloutButton: {
    width: 'auto',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
  }
});

export default MapScreen;