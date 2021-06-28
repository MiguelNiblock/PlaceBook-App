import createDataContext from './createDataContext';
import locationApi from '../api/location';
import {navigate} from '../navigationRef';
import * as SecureStore from 'expo-secure-store';
import {setLocalData} from '../hooks/safeAsync'
import uuid from 'react-native-uuid';

const LocationReducer = (state,action) => {
  switch (action.type){
    case 'set_locs':
      return action.payload;
    case 'create_loc':
      setLocalData('locs',[...state, action.payload]);
      return [...state, action.payload];
    case 'edit_loc': {
      console.log('payload:',action.payload);
      console.log('state:',state);
      const newState = [...state.map(
        (item)=>{
          if(item._id === action.payload._id) {
            // console.log('matched')
            return {...item, ...action.payload}
          } else return item
        }
      )];
      setLocalData('locs',newState);
      return newState;
    }    
    case 'delete_loc': {
      const newState = state.filter((item)=>item._id !== action.payload);
      setLocalData('locs',newState);
      return newState
    }
    default: 
      return state;
  };
};

const loadLocalLocs = dispatch => async() => {
  console.log('loadLocalLocs called')
  if(await SecureStore.isAvailableAsync()){
    let locs = await SecureStore.getItemAsync('locs')
    if (locs) {
      locs = JSON.parse(locs);
      // console.log('locs from local storage:',locs)
      dispatch({type:'set_locs',payload:locs});
    }
  }
  console.log('loadLocalLocs ran')
}

const fetchLocs = dispatch => async(token) => {
  console.log('fetchLocs called')
  if (token){
    const {data} = await locationApi.get('/locs');
    console.log('fetchLocs response received');
    dispatch({type:'set_locs', payload:data});
    //set to localState...
  }
};
const createLocation = dispatch => async(name,address,coords,notes,stars,tags,listId) => {
  console.log('createLoc called')
  if (await SecureStore.getItemAsync('token')){
    const {data} = await locationApi.post('/locs',{name,address,coords,notes,stars,tags,listId});
    dispatch({type:'create_loc', payload:data});
    // console.log('createLocation ran. response:',data);
    return data;
  } else {
    console.log('creating loc locally')
    const timeStamp = new Date().toISOString();
    const newLoc = {_id:uuid.v4(),name,address,coords,notes,stars,tags,listId,datetimeCreated:timeStamp,datetimeModified:timeStamp}
    // console.log('loc created locally:',newLoc)
    dispatch({type:'create_loc',payload:newLoc});
    return newLoc;
  }
};
const editLocation = dispatch => async(locId,name,address,coords,notes,stars,tags,listId) => {
  console.log('editLoc called');
  const datetimeModified = new Date().toISOString();
  if (await SecureStore.getItemAsync('token')){
    const {data} = await locationApi.put(`/locs/${locId}`,{name,address,coords,notes,stars,tags,listId,datetimeModified});
    dispatch({type:'edit_loc', payload:data});
    // console.log('editLocation ran. response:',data);
    return data;
  } else {
    console.log('updating loc locally');
    const updatedLoc = {_id:locId,name,address,coords,notes,stars,tags,listId,datetimeModified};
    dispatch({type:'edit_loc',payload:updatedLoc});
    return updatedLoc;
  }
};
const deleteLocation = dispatch => async(locId) => {
  console.log('deleteLoc called');
  if (await SecureStore.getItemAsync('token')){
    console.log('Trying to DELETE loc in backend')
    const {data} = await locationApi.delete(`/locs/${locId}`);
    dispatch({type:'delete_loc',payload:locId});
    // console.log('deleteLocation ran. response:',data);
  } else {
    console.log('deleting loc locally')
    dispatch({type:'delete_loc',payload:locId});
  }
};

export const {Context, Provider} = createDataContext(
  LocationReducer,
  {loadLocalLocs,fetchLocs,createLocation,editLocation,deleteLocation},
  []//empty array of locations
);