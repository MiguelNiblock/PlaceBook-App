import React,{useEffect,useState,useRef,useContext} from 'react';
import MapView,{Marker,Callout} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button, Alert} from 'react-native';
// import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import {reverseGeocodeAsync} from 'expo-location';
import {navigate} from '../navigationRef'
import {Context as ListContext} from '../context/ListContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Icon} from 'react-native-elements';

const MapScreen = ({navigation})=>{

  const {fetchLists,state:lists} = useContext(ListContext);
  const {fetchLocs,state:locations} = useContext(LocationContext);
  const [explorerMarker,setExplorerMarker] = useState({
    show:true,
    coords:{longitude: -93.35577942430973, latitude: 23.47555745333057},//dummy region in the sea
    opacity:0
  })
  const [addressOverlay, setAddressOverlay] = useState('');
  const markerRef = useRef();
  const [editMap,setEditMap] = useState(false);//quickfix for bug: mapview not showing controls on load
  const [showSaveButton,setShowSaveButton] = useState(false);
  const [currentRegion,setCurrentRegion] = useState({ //default to north america
    longitudeDelta: 86.15907199680805, latitudeDelta: 75.92358466231565, longitude: -92.3610382899642, latitude: 24.193727440390386
  });
  const [location, setLocation] = useState(null);

  useEffect(()=>{
    fetchLists();
    fetchLocs();

    (async()=>{ //gets device location and sets it as map region
      let { status } = await Location.requestPermissionsAsync();
      console.log('permission status:',status);
      if(status==='granted'){
        setTimeout(async function(){
          let {coords:{latitude,longitude}} = await Location.getCurrentPositionAsync({});
          const coords = {latitude,longitude};
          // console.log('coords:',latitude,longitude)
          setCurrentRegion({longitudeDelta: 0.0154498592018939, latitudeDelta: 0.013360640311354643, ...coords});
          handleLongPress({coords});
          setLocation(coords);
        },2000);
      };
    })()

  },[]);

  // console.log('lists:',lists)

  //When a screen navigates here with a 'loc' param, it'll activate the useEffect which focuses on that marker and displays the address.
  const focusLoc = navigation.getParam('loc');
  // console.log('focusLoc from comp body:',focusLoc)
  const hideDrawer = navigation.getParam('hideDrawer');
  // console.log('hideDrawer:',hideDrawer);
  useEffect(()=>{
    // console.log('focusLoc useEffect called');
    if(hideDrawer){navigation.closeDrawer()};
    if(focusLoc) {
      // console.log('focusLoc from useEffect:',focusLoc);
      setCurrentRegion({...currentRegion,...focusLoc.coords});
      setAddressOverlay(focusLoc.address);
    };
    
    return ()=> { 
      // console.log('cleanup fn called');
      navigation.setParams({hideDrawer:null,loc:null})
    };
  },[focusLoc,hideDrawer]);

  const handleLongPress = async({nativeEvent,coords})=>{
    coords ??= nativeEvent?.coordinate
    const [{name,street,city,region:addressRegion,postalCode,country}] = await reverseGeocodeAsync({...coords}); 
    const address = `${name} ${street}, ${city}, ${addressRegion} ${postalCode}, ${country}`;
    // console.log('new address:',address);
    setExplorerMarker({
      show:true,
      coords:coords,
      opacity:1,
      address
    });
    setShowSaveButton(true);
    setAddressOverlay(address);
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
      <Text selectable>{addressOverlay}</Text>
      {showSaveButton//becomes true with mapview's onLongPress
      ? <Button
          onPress={saveLocation}
          title="Save"
        /> 
      : null }
      <MapView showsUserLocation showsMyLocationButton zoomControlEnabled
        style={editMap ? styles.map : {}}//bug quickfix. shows controls on map load
        // style={styles.map} // this doesn't show controls on map load
        onMapReady={() =>{ setEditMap(true);console.log('map ready')}}//bug quickfix
        region={currentRegion}
        provider="google"
        mapType="standard"
        onLongPress={handleLongPress}
        onPress={mapTap}
        // onRegionChange={(region)=>{console.log('new region:',region)}}
        onRegionChangeComplete={(region)=>{setCurrentRegion(region);
          // console.log(region)
        }}
      >
      {explorerMarker.show //becomes false with mapview's onPress (short tap)
      ? <Marker
          opacity={explorerMarker.opacity}//initially 0. Allows markerRef to be defined on first load
          ref={markerRef}
          coordinate={{
            "latitude": explorerMarker.coords.latitude,
            "longitude": explorerMarker.coords.longitude,
          }}
          onPress={()=>{
            setAddressOverlay(explorerMarker.address);
            setCurrentRegion({...currentRegion,...explorerMarker.coords});
          }}
        >
          <Icon
              name='map-marker'
              type='material-community'
              color='rgba(0, 255, 255, 1)'
              size={45}
          />
        </Marker>
      : null }
      {
        // console.log('locations:',locations)
        locations.map((item)=>{
          // console.log('saved marker:',item)
          const locList = lists.find((l)=>l._id === item.listId)
          if (locList && locList.shown && item.coords){
            return (
              <Marker key={item._id} 
                coordinate={{...item.coords}}
                onPress={()=>{
                  setAddressOverlay(item.address);
                  setCurrentRegion({...currentRegion,...item.coords});
                }}
              >
                <Icon
                  // name='map-marker'
                  name={locList.icon}
                  type='material-community'
                  color={locList.color? locList.color : 'rgba(255,0,0,1)'}
                  // color='rgba(255,0,0,1)'
                  size={45}
                />
              </Marker>
            )
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
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