import React,{useEffect,useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-elements';
import {SafeAreaView} from 'react-navigation';
import Map from '../components/Map';
import {requestPermissionsAsync} from 'expo-location';

const TrackCreateScreen = ()=>{

  const [err, setErr] = useState(null);

  const startWatching = async () => {
    try {
      const {granted} = await requestPermissionsAsync();
      if (!granted) {
        throw new Error('Location permission not granted.');
      }
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