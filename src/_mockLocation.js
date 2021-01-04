//whenever we import this file into our project, ocne every second we'll emit directly into the location library, faking as if the user's location had changed in the world

import * as Location from 'expo-location';

//represents 10 meters in long or latt
const tenMetersWithDegrees = 0.0001;

//returns a fake location reading
const getLocation = increment => {
  return {
    timestamp: 1000000,
    coords: {
      speed: 0,
      heading: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      altitude: 5,
      longitude: -122.0312186 + increment * tenMetersWithDegrees,
      latitude: 37.33233141 + increment * tenMetersWithDegrees
    }
  };
};

//run fn every second
let counter = 0 
setInterval(()=>{
  Location.EventEmitter.emit('Expo.locationChanged', {
    watchId: Location._getCurrentWatchId(),
    location: getLocation(counter)
  });
  counter++;
},1000)