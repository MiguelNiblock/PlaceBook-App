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
      console.log('locs from local storage:',locs)
      dispatch({type:'set_locs',payload:locs});
    }
  }
  console.log('loadLocalLocs ran')
  return true
}

const fetchLocs = dispatch => async() => {
  console.log('fetchLocs called')
  try{
    const {data} = await locationApi.get('/locs');
    console.log('fetchLocs response:',data);
    dispatch({type:'set_locs', payload:data});
    //set to localState... must be done here, so when loading local lists, the reducer doesn't have to set em to local store again
    return true
  } catch(error){console.error(error)}
};

const createLocation = dispatch => async(name,address,coords,notes,stars,tags,listId) => {
  const _id = uuid.v4();
  const timeStamp = new Date().toISOString();
  const newLoc = {_id,name,address,coords,notes,stars,tags,listId,datetimeCreated:timeStamp,datetimeModified:timeStamp}
  console.log('new loc:',newLoc);
  try {
    console.log('trying to POST loc');
    const {data} = await locationApi.post('/locs',{name,address,coords,notes,stars,tags,listId});
    console.log('createLoc response:',data);
    dispatch({type:'create_loc', payload:data});
    return newLoc
  } catch(error){
    console.error(error);
    console.log('creating loc locally');
    // queueCreate(newLoc);
    dispatch({type:'create_loc', payload:newLoc});
    return newLoc
  }
};

const editLocation = dispatch => async(locId,name,address,coords,notes,stars,tags,listId) => {
  const datetimeModified = new Date().toISOString();
  try {
    console.log('trying to PUT loc:',locId,name,address,coords,notes,stars,tags,listId);
    const {data} = await locationApi.put(`/locs/${locId}`,{name,address,coords,notes,stars,tags,listId,datetimeModified});
    console.log('editLocation response:',data);
    dispatch({type:'edit_loc', payload:data});
    return data
  } catch (error) {
    console.error(error);
    const updatedLoc = {_id:locId,name,address,coords,notes,stars,tags,listId,datetimeModified};
    console.log('updating loc locally:',updatedLoc);
    //queueEdit(updatedLoc);
    dispatch({type:'edit_loc',payload:updatedLoc});    
    return updatedLoc;
  }
};

const deleteLocation = dispatch => async(locId) => {
  try {
    console.log('trying to DELETE loc:',locId);
    const {data} = await locationApi.delete(`/locs/${locId}`);
    console.log('deleteLocation response:',data);
    dispatch({type:'delete_loc',payload:locId});
  } catch (error) {
    console.error(error)
    console.log('deleting loc locally')
    // queueDelete(locId);
    dispatch({type:'delete_loc',payload:locId});
  }
};

export const {Context, Provider} = createDataContext(
  LocationReducer,
  {loadLocalLocs,fetchLocs,createLocation,editLocation,deleteLocation},
  []//empty array of locations
);