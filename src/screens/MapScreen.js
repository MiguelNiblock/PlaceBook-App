import React,{useEffect,useState,useRef,useContext,useMemo,useCallback} from 'react';
import MapView,{Marker,Callout,PROVIDER_GOOGLE} from 'react-native-maps';
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
  const {state:locations,loadLocalLocs,fetchLocs,resetLocations} = 
  useContext(LocationContext);
  const {state:{token},tryLocalSignin,signout} = 
  useContext(AuthContext);
  const {state:listQueue,loadLocalListQueue,resetListQueue,listCreateQueue,setListQueue} = 
  useContext(ListQueueContext);
  const {state:locationQueue,loadLocalLocationQueue,resetLocationQueue,setLocationQueue} = 
  useContext(LocationQueueContext);

  const [explorerMarker,setExplorerMarker] = useState({
    show:true,
    coords:{longitude: -93.35577942430973, latitude: 23.47555745333057},//dummy region in the sea
    opacity:0
  })
  // const [addressOverlay, setAddressOverlay] = useState('');
  // const [showSaveButton,setShowSaveButton] = useState(false);
  // const [showEditButton,setShowEditButton] = useState(false);
  const [bottomSheet, setBottomSheet] = useState({name:'',address:'',showEditButton:false,showSaveButton:false})
  const [currentSavedMarker, setCurrentSavedMarker] = useState({});
  const markerRef = useRef();
  const [editMap,setEditMap] = useState(false);//quickfix for bug: mapview not showing controls on load
  const [currentRegion,setCurrentRegion] = useState({ //default to north america
    longitudeDelta: 86.15907199680805, latitudeDelta: 75.92358466231565, longitude: -92.3610382899642, latitude: 24.193727440390386
  });
  //bottom modal
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['7%','25%'], []);
  const handleSheetChanges = useCallback((index) => {
    // console.log('handleSheetChanges', index);
  }, []);

  useEffect(()=>{
    // resetLocations();
    // signout();

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

    if(!token){

      ///////////////////////////////
      //Load data from localStore
      (async()=>{ //wait for local data to load
        console.log('Called local async step1...');
        const loadedLocalLists = loadLocalLists();
        const loadedLocalListQueue = loadLocalListQueue();
        const loadedLocalLocs = loadLocalLocs();
        const loadedLocalLocationQueue = loadLocalLocationQueue();
        return new Promise.all([loadedLocalListQueue,loadedLocalLocationQueue,loadedLocalLists,loadedLocalLocs]);
      })()
      .then(([loadedLocalListQueue,loadedLocalLocationQueue,loadedLocalLists,loadedLocalLocs])=>{
        if( loadedLocalLists && !loadedLocalLists.find(list=>list._id.startsWith('default')) ){
          console.log('Creating default list');
          createList('Default List','black','map-marker',listCreateQueue,token,'default');
        }
        tryLocalSignin();
      });

    } else {

      ////////////////////////////////
      //Fetch data in stages
      (async()=>{  console.log('Called fetch stage.... ');
        const readyListQ = removeDefaultList(listQueue);
        const fetchedLists = fetchLists(readyListQ,token);
        const fetchedLocs = fetchLocs(locationQueue,token);
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

  },[token]);

  /////////////////////////////////////////////////////////
  // FocusLoc navigation
  ////When a screen navigates here with a 'loc' param, it'll activate the useEffect which focuses on that marker and displays the address.
  const focusLoc = navigation.getParam('loc');
  const hideDrawer = navigation.getParam('hideDrawer');
  const hideExplorerMarker = navigation.getParam('hideExplorerMarker');
  const hideBottomSheet = navigation.getParam('hideBottomSheet');
  useEffect(()=>{
    // console.log('focusLoc useEffect called');
    if(hideDrawer){navigation.closeDrawer()};
    if(hideExplorerMarker){setExplorerMarker({...explorerMarker,show:false})};
    if(focusLoc) {
      // console.log('focusLoc from useEffect:',focusLoc);
      setCurrentSavedMarker(focusLoc);
      setCurrentRegion({...currentRegion,...focusLoc.coords,longitudeDelta:0.0154498592018939, latitudeDelta:0.0193603328227141});
      setBottomSheet({name:focusLoc.name,address:focusLoc.address,showSaveButton:false,showEditButton:true})
      bottomSheetRef.current.snapTo(1);
    }
    if(hideBottomSheet){console.log('closing bottomSheet');bottomSheetRef.current.close()}
    return ()=> { 
      // console.log('cleanup fn called');
      navigation.setParams({hideDrawer:null,loc:null,hideBottomSheet:null})
    };
  },[focusLoc,hideDrawer,hideExplorerMarker,hideBottomSheet]);

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
    setBottomSheet({name:'',address,showSaveButton:true,showEditButton:false});
    bottomSheetRef.current.snapTo(1);
  };

  const mapTap = () => {
    setExplorerMarker({...explorerMarker,show:false});
    setBottomSheet({name:'',address:'',showSaveButton:false,showEditButton:false});
    bottomSheetRef.current.close();
  };

  const saveLocation = ()=>{
    // console.log('saveLocation called')
    const loc = {
      _id:null,
      name:'',
      address:bottomSheet.address,
      coords:explorerMarker.coords,
      notes:'',
      stars:0,
      tags:'',
      listId:null
    };
    navigate('LocationEdit',{loc})
  };

  const editLocationHandler = ()=>{
    console.log('editLocation button pressed')
    navigate('LocationEdit',{loc:currentSavedMarker, placeName:currentSavedMarker.name})
  }

  let mapStyle = styles.map; //bug quickfix. shows controls on map load on android
  if (Platform.OS==='android' && !editMap){
    // console.log('editmap false & android')
    mapStyle = {}
  }

  let saveButton = (
  <ModalTouchable style={styles.modalButton} onPress={saveLocation} >
    <Button title='Save' type='solid' />
  </ModalTouchable>
  )
  if (Platform.OS === 'ios') {
    saveButton = <Button title='Save' type='solid' buttonStyle={styles.modalButton} onPress={saveLocation} />
  }

  let editButton = (
    <ModalTouchable style={styles.modalButton} onPress={editLocationHandler} >
      <Button title='Edit' type='solid' />
    </ModalTouchable>
  )
  if (Platform.OS === 'ios') {
    editButton = <Button title='Edit' type='solid' buttonStyle={styles.modalButton} onPress={editLocationHandler} />
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <MapView showsUserLocation={true} showsMyLocationButton={true} zoomControlEnabled={true} 
        style={mapStyle}
        // style={styles.map} // this doesn't show controls on map load on android
        onMapReady={() =>{ setEditMap(true);console.log('map ready')}}//bug quickfix
        region={currentRegion}
        provider={PROVIDER_GOOGLE}
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
            setBottomSheet({name:'',address:explorerMarker.address,showSaveButton:true,showEditButton:false});
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
                  setBottomSheet({name:item.name,address:item.address,showSaveButton:false,showEditButton:true});
                  setCurrentSavedMarker(item);
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
                  size={45} />
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
        {(bottomSheet.name !== '') && <Text selectable style={styles.name}>{bottomSheet.name}</Text>}

        <Text selectable style={styles.address}>{bottomSheet.address}</Text>

        {bottomSheet.showSaveButton && saveButton }

        {bottomSheet.showEditButton && editButton }

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
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  map: {
    position: 'absolute',
    top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
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
  address: {
    width: '80%',
    padding: 5,
    margin: 5,
    alignSelf: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  name: {
    width: '80%',
    // padding: 5,
    // margin: 5,
    alignSelf: 'center',
    fontSize: 16,
    // fontWeight: 'bold',
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