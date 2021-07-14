import React,{useEffect,useState,useRef,useContext,useMemo,useCallback} from 'react';
import MapView,{Marker,Callout} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Alert, SafeAreaView, StatusBar, TouchableOpacity, Platform} from 'react-native';
import * as Location from 'expo-location';
import {reverseGeocodeAsync} from 'expo-location';
import {navigate} from '../navigationRef'
import {Context as ListContext} from '../context/ListContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as AuthContext} from '../context/AuthContext';
import {Context as ListQueueContext} from '../context/ListQueueContext';
import {Context as LocationQueueContext} from '../context/LocationQueueContext'
import {Icon, Button} from 'react-native-elements';
import BottomSheet, {TouchableOpacity as ModalTouchable} from '@gorhom/bottom-sheet';
import {updateDB,removeDefaultList,processLocsQueue} from '../hooks/mergeWithQueue';

const MapScreen = ({navigation})=>{

  const {state:lists,loadLocalLists,fetchLists,createList,resetLists} = 
  useContext(ListContext);
  const {state:locations,loadLocalLocs,fetchLocs,createLocation,resetLocations} = 
  useContext(LocationContext);
  const {state:{token},tryLocalSignin,signout} = 
  useContext(AuthContext);
  const {state:listQueue,loadLocalListQueue,resetListQueue,listCreateQueue,listUpdateQueue,setListQueue} = 
  useContext(ListQueueContext);
  const {state:locationQueue,loadLocalLocationQueue,resetLocationQueue,setLocationQueue} = 
  useContext(LocationQueueContext);

  const [explorerMarker,setExplorerMarker] = useState({
    show:true,
    coords:{longitude: -93.35577942430973, latitude: 23.47555745333057},//dummy region in the sea
    opacity:0
  })
  const [addressOverlay, setAddressOverlay] = useState('');
  const [currentSavedMarker, setCurrentSavedMarker] = useState({});
  const markerRef = useRef();
  const [editMap,setEditMap] = useState(false);//quickfix for bug: mapview not showing controls on load
  const [showSaveButton,setShowSaveButton] = useState(false);
  const [showEditButton,setShowEditButton] = useState(false);
  const [currentRegion,setCurrentRegion] = useState({ //default to north america
    longitudeDelta: 86.15907199680805, latitudeDelta: 75.92358466231565, longitude: -92.3610382899642, latitude: 24.193727440390386
  });
  //bottom modal
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['7%','25%'], []);
  const handleSheetChanges = useCallback((index) => {
    // console.log('handleSheetChanges', index);
  }, []);
  const [loadedLocalData, setloadedLocalData] = useState(false);


  useEffect(()=>{
    if(!token){

      ///////////////////////////////
      //Load data from localStore
      setloadedLocalData(false);
      (async()=>{ //wait for local data to load
        console.log('Called local async step1...');
        const loadedLocalLists = loadLocalLists();
        const loadedLocalListQueue = loadLocalListQueue();
        const loadedLocalLocs = loadLocalLocs();
        const loadedLocalLocationQueue = loadLocalLocationQueue();
        return new Promise.all([loadedLocalListQueue,loadedLocalLocationQueue,loadedLocalLists,loadedLocalLocs]);
      })()
      .then(([loadedLocalListQueue,loadedLocalLocationQueue,loadedLocalLists,loadedLocalLocs])=>{
        setloadedLocalData(true);
        if( loadedLocalLists && !loadedLocalLists.find(list=>list._id.startsWith('default')) ){
          console.log('Creating default list');
          createList('Default List','black','map-marker',listCreateQueue,'default');
        }
        tryLocalSignin();
      });

    } else {

      ////////////////////////////////
      //Fetch data in stages
      (async()=>{  console.log('Called fetch stage.... ');
        const readyListQ = removeDefaultList(listQueue);
        const fetchedLists = fetchLists(readyListQ);
        const fetchedLocs = fetchLocs(locationQueue);
        return new Promise.all([readyListQ,fetchedLists,locationQueue,fetchedLocs]);
      })()
      .then(([readyListQ,fetchedLists,locationQueue,fetchedLocs])=>{
        console.log('Called updating DBs stage...')
        const readyLocQ = processLocsQueue(locationQueue,fetchedLists);
        const newListQueue = updateDB('/lists',readyListQ,setListQueue,fetchedLists);
        const newLocQueue = updateDB('/locs',readyLocQ,setLocationQueue,fetchedLocs);
        return new Promise.all([newListQueue,newLocQueue]);
      })

    }

    ///////////////////////////////////////
    //Show current address
    (async()=>{ //gets device location and sets it as map region
      console.log('Called showCurrentAddress');
      let { status } = await Location.requestPermissionsAsync();
      console.log('location permission:',status);
      if(status==='granted'){
        setTimeout(async function(){
          let {coords:{latitude,longitude}} = await Location.getCurrentPositionAsync({});
          const coords = {latitude,longitude};
          console.log('coords:',latitude,longitude)
          setCurrentRegion({longitudeDelta: 0.0154498592018939, latitudeDelta: 0.013360640311354643, ...coords});
          handleLongPress({coords});
        },2000);
      }
    })();

  },[token]);

  /////////////////////////////////////////////////////////
  // FocusLoc navigation
  ////When a screen navigates here with a 'loc' param, it'll activate the useEffect which focuses on that marker and displays the address.
  const focusLoc = navigation.getParam('loc');
  // console.log('focusLoc from comp body:',focusLoc)
  const hideDrawer = navigation.getParam('hideDrawer');
  // console.log('hideDrawer:',hideDrawer);
  const hideExplorerMarker = navigation.getParam('hideExplorerMarker');
  // console.log('hideExplorerMarker:',hideExplorerMarker);
  useEffect(()=>{
    // console.log('focusLoc useEffect called');
    if(hideDrawer){navigation.closeDrawer()};
    if(hideExplorerMarker){setExplorerMarker({...explorerMarker,show:false})};
    if(focusLoc) {
      // console.log('focusLoc from useEffect:',focusLoc);
      setCurrentSavedMarker(focusLoc);
      setCurrentRegion({...currentRegion,...focusLoc.coords,longitudeDelta:0.0154498592018939, latitudeDelta:0.0193603328227141});
      setAddressOverlay(focusLoc.address);
      setShowSaveButton(false);
      setShowEditButton(true);
      bottomSheetRef.current.snapTo(1);
    };
    return ()=> { 
      // console.log('cleanup fn called');
      navigation.setParams({hideDrawer:null,loc:null})
    };
  },[focusLoc,hideDrawer,hideExplorerMarker]);

  const handleLongPress = async({nativeEvent,coords})=>{
    // coords ??= nativeEvent?.coordinate
    if(!coords){coords = nativeEvent?.coordinate};
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
    setShowEditButton(false);
    setAddressOverlay(address);
    bottomSheetRef.current.snapTo(1);
  };

  const mapTap = () => {
    setExplorerMarker({...explorerMarker,show:false});
    setShowSaveButton(false);
    setShowEditButton(false);
    setAddressOverlay('');
    bottomSheetRef.current.close();
  };

  const saveLocation = ()=>{
    // console.log('saveLocation called')
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

  const editLocation = ()=>{
    console.log('editLocation button pressed')
    navigate('LocationEdit',{loc:currentSavedMarker, placeName:currentSavedMarker.name})
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <MapView showsUserLocation showsMyLocationButton zoomControlEnabled 
      // loadingEnabled
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
      {explorerMarker.show && //hides with mapview's onPress (short tap)
        <Marker
          opacity={explorerMarker.opacity}//initially 0. Allows markerRef to be defined on first load
          ref={markerRef}
          coordinate={{
            "latitude": explorerMarker.coords.latitude,
            "longitude": explorerMarker.coords.longitude,
          }}
          onPress={()=>{
            setAddressOverlay(explorerMarker.address);
            setShowEditButton(false);
            setShowSaveButton(true);
            setCurrentRegion({...currentRegion,...explorerMarker.coords,longitudeDelta:0.0154498592018939, latitudeDelta:0.0193603328227141});
            bottomSheetRef.current.snapTo(1);
          }}
        >
          <Icon
            name='map-marker'
            type='material-community'
            color='rgba(0, 255, 255, 1)'
            size={45}
          />
        </Marker>
      }

      {//display markers for all saved places
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
                  setCurrentSavedMarker(item);
                  setShowSaveButton(false);
                  setShowEditButton(true);
                  bottomSheetRef.current.snapTo(1);
                  setCurrentRegion({...currentRegion,...item.coords,longitudeDelta:0.0154498592018939, latitudeDelta:0.0193603328227141});
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
     
      
      <BottomSheet
        style={styles.bottomSheet}
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <Text selectable style={styles.addressOverlay}>{addressOverlay}</Text>
        {showSaveButton && 
        <ModalTouchable style={styles.modalButton} onPress={saveLocation} >
          <Button title='Save' type='solid' />
        </ModalTouchable>}
        {showEditButton &&
        <ModalTouchable style={styles.modalButton} onPress={editLocation} >
        <Button title='Edit' type='solid' />
      </ModalTouchable>}
      </BottomSheet>

      <TouchableOpacity style={styles.drawerButton}
        onPress={() => navigation.openDrawer()}
        title="Drawer"
      >
        <Icon
          containerStyle={{opacity: 1}}
          style={styles.drawerIcon}
          name='forwardburger'
          type='material-community'
          color='black'
          size={40}
        />
      </TouchableOpacity>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  map: {
    position: 'absolute',
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    width: Dimensions.get('window').width,
    height: Platform.OS === "android" ? Dimensions.get('window').height - StatusBar.currentHeight : Dimensions.get('window').height ,
  },
  drawerButton: {
    position: 'absolute',
    bottom: '20%',
    right: '3%',
    backgroundColor:'white',
    alignItems: 'center',
    alignContent: 'center',
    opacity: 0.6
  },
  drawerIcon: {
    opacity: 1,
    flex: 1,
    alignSelf: 'center'
  },
  bottomSheet: {
    width: '80%',
    marginLeft: '2%',
    paddingLeft: '2%',
    paddingRight: '2%',
    alignContent: 'center',
    // alignItems: 'center',
    // justifyContent: 'center'
  },
  addressOverlay: {
    width: '80%',
    padding: 5,
    margin: 5,
    alignSelf: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  },  
  modalButton:{
    alignSelf: 'center',
    width: '50%'
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