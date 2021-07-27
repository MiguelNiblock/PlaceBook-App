import createDataContext from './createDataContext';
import locationApi from '../api/location';
import {navigate} from '../navigationRef';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import {setLocalData} from '../hooks/safeAsync';
import {mergeWithQueue} from '../hooks/mergeWithQueue';

const ListReducer = (state,action) => {
  switch (action.type){
    case 'set_lists':
      return action.payload;
    case 'create_list':
      setLocalData('lists',[...state, action.payload])
      return [...state, action.payload];
    case 'edit_list': {
      const newState = [...state.map( 
        (item)=>{ 
          if(item._id === action.payload._id) {
            // console.log('item found:',item);
            return { ...item, ...action.payload}
          } else return item
        }
      )];
      // console.log('newState:',newState);
      setLocalData('lists',newState);
      return newState
    }
    case 'delete_list': {
      const newState = state.filter((item)=>item._id !== action.payload);
      setLocalData('lists',newState);
      return newState;
    }
    case 'show_list': {
      const newState = [...state.map( 
        (item)=>{ if(item._id === action.payload) return {...item, shown:!item.shown}; else return item}
      )];
      setLocalData('lists',newState)
      return newState
    }
    case 'expand_list': {
      const newState = [...state.map( 
        (item)=>{ if(item._id === action.payload) return {...item, expanded:!item.expanded}; else return item}
      )];
      setLocalData('lists',newState)
      return newState
    }
    default: 
      return state;
  };
};

const loadLocalLists = dispatch => async() => {
  console.log('loadLocalLists called')
  if(await SecureStore.isAvailableAsync()){
    let lists = await SecureStore.getItemAsync('lists')
    if (lists) {
      lists = JSON.parse(lists);
      console.log('lists from local storage:',lists)
      dispatch({type:'set_lists',payload:lists});
      return lists
    } else {
      console.log('No lists in local store');
      setLocalData('lists',[]);
      dispatch({ type:'set_lists', payload:[] });
      return []
    }
  } else { 
    console.error('Local store not available');
    return []
  }
}

const fetchLists = dispatch => async(listQueue,token) => {
  console.log('fetchLists called. queue:',listQueue);
  try {
    if(!token){throw 'No token'}
    const {data} = await locationApi.get('/lists');  
    console.log('fetchLists response:',data);
    const result = mergeWithQueue(data,listQueue);
    dispatch({type:'set_lists',payload:result});
    //set to localState... must be done here, so when loading local lists, the reducer doesn't have to set em to local store again
    setLocalData('lists',result);
    return data
  } catch(error){
    console.error('Fetchlists failed',error);
    return []
  }
};

const createList = dispatch => async(name,color,icon,queueCreate,token,idPrefix) => {
  let _id = uuid.v4();
  if(idPrefix){ _id = idPrefix + _id }
  const timeStamp = new Date().toISOString();
  const newList = {_id,name,color,icon,shown:true,expanded:true,datetimeCreated:timeStamp,datetimeModified:timeStamp}
  console.log('new list:',newList);
  try {
    console.log('trying to POST list')
    if(!token){throw 'No token'}
    const {data} = await locationApi.post('/lists',{item:newList});
    console.log('createList response:',data);
    dispatch({type:'create_list',payload:data});
    return data
  } catch(error){
    console.error('Error creating list:',error);
    console.log('creating list locally');
    queueCreate(newList);
    dispatch({type:'create_list',payload:newList});
    return newList
  } finally{navigate('Drawer')}
};

const editList = dispatch => async({_id,name,color,icon,shown,expanded},queueEdit,token) => {
  const datetimeModified = new Date().toISOString()
  try{
    console.log('trying to PUT list:',_id,name,color,icon,shown,expanded);
    if(!token){throw 'No token'}
    const {data} = await locationApi.put(`/lists/${_id}`,{name,color,icon,shown,expanded,datetimeModified});
    console.log('editList response:',data);
    if(data._id === _id){
      dispatch({type:'edit_list',payload:data});
      return data
    } else {
      throw 'Updating list failed on backend'
    }
  } catch (error){
    console.error('Error updating list:',error)
    const updatedList = {_id,name,color,icon,shown,expanded,datetimeModified};
    console.log('updating list locally:',updatedList);
    queueEdit(updatedList);
    dispatch({type:'edit_list',payload:updatedList});
    return updatedList
  } finally {navigate('Map')}
};

const deleteList = dispatch => async(list,queueDelete,token) => {
  try{
    console.log('trying to DELETE list:',list._id);
    if(!token){throw 'No token'}
    const {data} = await locationApi.delete(`/lists/${list._id}`);
    console.log('deleteList response:',data);
    if(data._id === list._id){
      dispatch({type:'delete_list',payload:list._id});
      return data
    } else{
      throw 'Deleting list failed on backend'
    }
  } catch(error){
    console.error('Error deleting list:',error)
    console.log('deleting list locally')
    queueDelete(list);
    dispatch({type:'delete_list',payload:list._id});
    return list
  }
};

const toggleShowList = dispatch => async({_id,name,color,icon,shown,expanded},token) => {
  console.log('toggleShowList called')
  // console.log('List id:',_id);
  if (token){
    const toggledShown = !shown;
    locationApi.put(`/lists/${_id}`,{name,color,icon,shown:toggledShown,expanded});
  }
  dispatch({type:'show_list',payload: _id});
};

const toggleExpandList = dispatch => async({_id,name,color,icon,shown,expanded},token) => {
  console.log('toggleExpandList called');
  console.log('List id:',_id);
  if (token){
    const toggledExpanded = !expanded;
    locationApi.put(`/lists/${_id}`,{name,color,icon,shown,expanded:toggledExpanded});
  }
  dispatch({type:'expand_list',payload: _id});
};

const resetLists = dispatch => ()=>{
  setLocalData('lists',[])
  dispatch({type:'set_lists', payload:[]})
}

export const {Context, Provider} = createDataContext(
  ListReducer,
  {loadLocalLists,fetchLists,createList,editList,deleteList,toggleExpandList,toggleShowList,resetLists},
  []//empty array of lists
);