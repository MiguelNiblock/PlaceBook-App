import '../_mockLocation';
import React,{useEffect,useState,useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-elements';
import {SafeAreaView} from 'react-navigation';
import Map from '../components/Map';
import {requestPermissionsAsync, watchPositionAsync, Accuracy} from 'expo-location';
import {Context as LocationContext} from '../context/LocationContext';

const TrackCreateScreen = ()=>{

  const {state,addLocation} = useContext(LocationContext);
  // console.log('state:',state)
  const [err, setErr] = useState(null);

  const startWatching = async () => {
    try {
      const {granted} = await requestPermissionsAsync();
      if (!granted) {
        throw new Error('Location permission not granted.');
      }
      await watchPositionAsync({
        accuracy: Accuracy.BestForNavigation,
        timeInterval: 10,
        distanceInterval: 10
      }, (location)=> {
        // console.log('location:',location)
        addLocation(location)
      });
    } catch (e) {
      setErr(e);
    }
  }

  useEffect(()=>{
    startWatching();
  },[])

  return (
    <SafeAreaView forceInset={{top: 'always'}}>
      <Text h2>TrackCreateScreen</Text>
      <Map />
      {err ? <Text>Please enable location services.</Text> : null }
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({});

export default TrackCreateScreen;