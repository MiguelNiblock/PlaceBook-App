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
  const {fetchLocs,state:locations} = useContext(LocationContext);
  const [explorerMarker,setExplorerMarker] = useState({
    show:true,
    coords:{latitude:37.42459028327157, longitude:-122.08799198269844},
    opacity:0
  })
  const [addressOverlay, setAddressOverlay] = useState('');
  const markerRef = useRef();
  const [editMap,setEditMap] = useState(false);//workaround for bug: mapview not showing controls
  const [showSaveButton,setShowSaveButton] = useState(false);
  const [region,setRegion] = useState({
    "latitude": 37.421997503686995,
    "latitudeDelta": 0.018190238622558752,
    "longitude": -122.08399968221784,
    "longitudeDelta": 0.01765664666889677,
  });

  const focusLoc = navigation.getParam('loc');
  console.log('focusLoc from comp body:',focusLoc)

  useEffect(()=>{
    const { status } = Permissions.askAsync(Permissions.LOCATION);
    fetchLists();
    fetchLocs();
  },[]);

  useEffect(()=>{
    console.log('focusLoc useEffect called');
    let hideDrawer = navigation.getParam('hideDrawer');
    console.log('hideDrawer:',hideDrawer);
    if(hideDrawer){navigation.closeDrawer()};
    if (focusLoc) {
      console.log('focusLoc from useEffect:',focusLoc);
      setRegion({...region,...focusLoc.coords});
      setAddressOverlay(focusLoc.address);
    };
    
    return ()=> { 
      console.log('cleanup fn called');
      navigation.setParams({hideDrawer:null,loc:null})
    };
  },[focusLoc]);

  const handleLongPress = async(e)=>{
    console.log('handleLongPress called')
    const eventCoords = e.nativeEvent.coordinate;
    // console.log('new coords:',eventCoords)
    const [{name,street,city,region,postalCode,country}] = await reverseGeocodeAsync({...eventCoords}); 
    console.log('new address:',name,street,city,region,postalCode,country);
    setExplorerMarker({
      show:true,
      coords:eventCoords,
      opacity:1,
      address:`${name} ${street}, ${city}, ${region} ${postalCode}, ${country}`
    });
    setShowSaveButton(true);
    setAddressOverlay(explorerMarker.address);
    setRegion({...region,...eventCoords});
  };

  const mapTap = () => {
    setExplorerMarker({...explorerMarker,show:false});
    setShowSaveButton(false);
    setAddressOverlay('')
  };

  const saveLocation = ()=>{
    const loc = {
      _id:null,
      name:'',
      address:addressOverlay,
      coords:explorerMarker.coords,
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
      <Text>{addressOverlay}</Text>
      {showSaveButton//becomes true with mapview's onLongPress
      ? <Button
          onPress={saveLocation}
          title="Save"
        /> 
      : null }
      <MapView showsUserLocation showsMyLocationButton zoomControlEnabled
        style={editMap ? styles.map : {}}//bug quickfix
        onMapReady={() => setEditMap(true)}//bug quickfix
        region={region}
        provider="google"
        mapType="hybrid"
        onLongPress={handleLongPress}
        onPress={mapTap}
      >
      {explorerMarker.show //becomes false with mapview's onPress (short tap)
      ? <Marker draggable
          opacity={explorerMarker.opacity}//initially 0. Allows markerRef to be defined on first load
          ref={markerRef}
          coordinate={{
            "latitude": explorerMarker.coords.latitude,
            "latitudeDelta": 0.018190238622558752,
            "longitude": explorerMarker.coords.longitude,
            "longitudeDelta": 0.01765664666889677,
          }}
          pinColor="rgba(0,100,255,1)"
          onPress={()=>{
            setAddressOverlay(explorerMarker.address);
            setRegion({...region,...explorerMarker.coords});
          }}
        />
      : null }
      {
        // console.log('locations:',locations)
        locations.map((item)=>{
          if (item.coords){
            console.log('saved marker:',item)
            return <Marker key={item._id} 
              coordinate={{...item.coords}}
              onPress={()=>{
                setAddressOverlay(item.address);
                setRegion({...region,...item.coords});
              }}
            />
          }
        })
      }
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