import {useEffect,useState} from 'react';
import {requestPermissionsAsync, watchPositionAsync, Accuracy} from 'expo-location';

export default (callback) => {
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
      }, callback);
    } catch (e) {
      setErr(e);
    };
  };

  useEffect(()=>{
    startWatching();
  },[])

  return [err]
};