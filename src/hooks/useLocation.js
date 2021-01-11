//fn that starts to track device location. With each location update, runs a callback to which it provides the new location. If no location permission, returns error. If argument `shouldTrack` becomes false, stops tracking.
//callback is used for updating state to new location.
import {useEffect,useState} from 'react';
import {requestPermissionsAsync, watchPositionAsync, Accuracy} from 'expo-location';

export default (shouldTrack,callback) => {
  const [err, setErr] = useState(null);

  //Runs the effect when screen is focused. `shouldTrack` is true when focused. 
  //When shouldTrack changes value, fn runs again. If screen is focused, starts tracking. Else stops. 
  useEffect(()=>{
    let subscriber;
    const startWatching = async () => {
      try {
        const {granted} = await requestPermissionsAsync();
        if (!granted) {
          throw new Error('Location permission not granted.');
        }
        //watchPositionAsync will pass each new `location` as an argument to a callback.
        subscriber = await watchPositionAsync({
          accuracy: Accuracy.BestForNavigation,
          timeInterval: 10,
          distanceInterval: 10
        }, 
        callback);
      } catch (e) {
        setErr(e);
      };
    };

    if (shouldTrack) {
      startWatching();
    } else {
      if(subscriber){
        subscriber.remove();
      }
      subscriber = null
    }

    return () => {
      if(subscriber){
        subscriber.remove()
      }
      subscriber = null
    }

  },[shouldTrack,callback])

  return [err]
};