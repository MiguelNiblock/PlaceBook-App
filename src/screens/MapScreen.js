import React,{useEffect,useState,useRef,useContext} from 'react';
import MapView,{Marker,Callout} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import Location,{reverseGeocodeAsync} from 'expo-location';
import CustomCallout from './CustomCallout';
import {navigate} from '../navigationRef'
import {Context as ListContext} from '../context/ListContext';
import {Context as LocationContext} from '../context/LocationContext';

const MapScreen = ({navigation})=>{

  const {fetchLists} = useContext(ListContext);
  const {fetchLocs} = useContext(LocationContext);
  const [markerState,setMarkerState] = useState({
    show:true,
    coords:{latitude:37.42459028327157, longitude:-122.08799198269844},
    opacity:0,
    addressShort:'',
    address:''
  })
  const [editMap,setEditMap] = useState(false);//workaround for bug: mapview not showing controls
  const markerRef = useRef();
  const [showSaveButton,setShowSaveButton] = useState(false);
  // const [hideDrawer,setHideDrawer] = useState(false);
  // setHideDrawer(navigation.getParam('hideDrawer'));
  // const [loc,setLoc] = useState(null);
  const navLoc = navigation.getParam('loc');
  // console.log(navLoc)

  useEffect(()=>{
    const { status } = Permissions.askAsync(Permissions.LOCATION);
    fetchLists();
    fetchLocs();
  },[]);

  // useEffect(()=>{
  //   console.log('useEffect ran. new navLoc:',navLoc)
  //   if(navLoc){
  //     // setLoc(navLoc);
  //     navigation.closeDrawer();
  //     if (showMarker===false) setShowMarker(true);
  //     if (showMarker===true) markerRef.current.hideCallout();
  //     setMarkerCoords(navLoc.coords);  
  //     if (markerOpacity === 0) setMarkerOpacity(1); 
  //     // setAddress(navLoc.address);
  //     setAddressCallout(navLoc.address);
  //     if (showMarker===true) markerRef.current.showCallout();
  //     // setShowSaveButton(true);
  //   }
  // },[navLoc])

  const handleLongPress = async(e)=>{
    console.log('handleLongPress called')
    const eventCoords = e.nativeEvent.coordinate;
    // console.log('new coords:',eventCoords)
    const [{name,street,city,region,postalCode,country}] = await reverseGeocodeAsync({...eventCoords}); 
    console.log('new address:',name,street,city,region,postalCode,country);
    setMarkerState({
      show:true,
      coords:eventCoords,
      opacity:1,
      addressShort:`${name} ${street}, ${city}, ${region} ${postalCode}`,
      address:`${name} ${street}\n${city}, ${region}\n${postalCode}, ${country}`
    });
    setShowSaveButton(true);
  };

  const mapTap = () => {
    setMarkerState({...markerState,show:false,addressShort:'',address:''});
    setShowSaveButton(false);
  };

  const saveLocation = ()=>{
    const loc = {
      _id:null,
      name:'',
      address:markerState.address,
      coords:markerState.coords,
      notes:'',
      stars:0,
      tags:'',
      listId:null
    };
    navigate('LocationEdit',{loc})
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={() => navigation.openDrawer()}
        title="Drawer"
      />
      <Text>{markerState.address}</Text>
      {showSaveButton//becomes true with mapview's onLongPress
      ? <Button
          onPress={saveLocation}
          title="Save"
        /> 
      : null }
      <MapView showsUserLocation showsMyLocationButton zoomControlEnabled
        style={editMap ? styles.map : {}}         
        onMapReady={() => setEditMap(true)}
        initialRegion={{
          "latitude": 37.421997503686995,
          "latitudeDelta": 0.018190238622558752,
          "longitude": -122.08399968221784,
          "longitudeDelta": 0.01765664666889677,
        }}
        provider="google"
        mapType="hybrid"
        onLongPress={handleLongPress}
        onPress={mapTap}
      >
      {markerState.show //becomes false with mapview's onPress (short tap)
      ? <Marker draggable
          opacity={markerState.markerOpacity}//initially 0. Allows markerRef to be defined on first load
          ref={markerRef}
          coordinate={{
            "latitude": markerState.coords.latitude,
            "latitudeDelta": 0.018190238622558752,
            "longitude": markerState.coords.longitude,
            "longitudeDelta": 0.01765664666889677,
          }}
          pinColor="rgba(0,100,255,1)"
        />
      : null }
      </MapView>
    </View>
  );
};

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
    height: Dimensions.get('window').height - 250,
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