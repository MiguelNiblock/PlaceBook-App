import createDataContext from './createDataContext';
import locationApi from '../api/location';
import {navigate} from '../navigationRef';
import * as SecureStore from 'expo-secure-store';
import {setLocalData} from '../hooks/safeAsync'
import uuid from 'react-native-uuid';
import {mergeWithQueue} from '../hooks/mergeWithQueue';

const LocationReducer = (state,action) => {
  switch (action.type){
    case 'set_locs':
      return action.payload;
    case 'create_loc':
      setLocalData('locs',[...state, action.payload]);
      return [...state, action.payload];
    case 'edit_loc': {
      // console.log('payload:',action.payload);
      // console.log('state:',state);
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
      console.log('locs from local storage:',locs);
      dispatch({ type:'set_locs', payload:locs });
      return locs
    } else {
      console.log('No locations in local store');
      setLocalData('locs',[]);
      dispatch({ type:'set_locs', payload:[] });
      return []
    }
  } else {
    console.error('Local store not available');
    return []
  }
}

const fetchLocs = dispatch => async(locQueue,token) => {
  console.log('fetchLocs called. Queue:',locQueue);
  try{
    if(!token){throw 'No token'}
    const {data} = await locationApi.get('/locs');
    console.log('fetchLocs response:',data);
    const result = mergeWithQueue(data,locQueue);
    dispatch({type:'set_locs', payload:result});
    //set to localState... must be done here, so when loading local lists, the reducer doesn't have to set em to local store again
    setLocalData('locs',result);
    return data
  } catch(error){
    console.error('Fetchlocs failed',error);
    return []
  }
};

const createLocation = dispatch => async(name,address,coords,notes,stars,tags,listId,queueCreate,token) => {
  const _id = uuid.v4();
  const timeStamp = new Date().toISOString();
  const newLoc = {_id,name,address,coords,notes,stars,tags,listId,datetimeCreated:timeStamp,datetimeModified:timeStamp}
  console.log('new loc:',newLoc);
  try {
    console.log('trying to POST loc');
    if(!token){throw 'No token'}
    const {data} = await locationApi.post('/locs',{item:newLoc});
    console.log('createLoc response:',data);
    dispatch({type:'create_loc', payload:data});
    return data
  } catch(error){
    console.error('Error saving new location:',error);
    console.log('creating loc locally');
    queueCreate(newLoc);
    dispatch({type:'create_loc', payload:newLoc});
    return newLoc
  }
};

const editLocation = dispatch => async(locId,name,address,coords,notes,stars,tags,listId,queueEdit,token) => {
  const datetimeModified = new Date().toISOString();
  try {
    console.log('trying to PUT loc data:',{locId,name,notes,stars,tags,listId});
    if(!token){throw 'No token'}
    const {data} = await locationApi.put(`/locs/${locId}`,{name,notes,stars,tags,listId,datetimeModified});
    console.log('editLocation response:',data);
    if (data._id === locId){
      dispatch({type:'edit_loc', payload:data});
      return data
    } else {
      throw 'Updating location failed on backend'
    }
  } catch (error) {
    console.error('Error updating location:',error);
    const updatedLoc = {_id:locId,name,address,coords,notes,stars,tags,listId,datetimeModified};
    console.log('updating loc locally:',updatedLoc);
    queueEdit(updatedLoc);
    dispatch({type:'edit_loc',payload:updatedLoc});    
    return updatedLoc
  }
};

const deleteLocation = dispatch => async(loc,queueDelete,token) => {
  try {
    console.log('trying to DELETE loc:',loc._id);
    if(!token){throw 'No token'}
    const {data} = await locationApi.delete(`/locs/${loc._id}`);
    console.log('deleteLocation response:',data);
    if (data._id === loc._id){
      dispatch({type:'delete_loc',payload:loc._id});
      return data
    } else {
      throw 'Deleting location failed on backend'
    }
  } catch (error) {
    console.error('Error deleting location',error);
    console.log('deleting loc locally');
    queueDelete(loc);
    dispatch({type:'delete_loc',payload:loc._id});
    return loc
  }
};

const resetLocations = dispatch => ()=>{
  setLocalData('locs',[]);
  dispatch({type:'set_locs', payload:[]});
}

export const {Context, Provider} = createDataContext(
  LocationReducer,
  {loadLocalLocs,fetchLocs,createLocation,editLocation,deleteLocation,resetLocations},
  []//empty array of locations
);