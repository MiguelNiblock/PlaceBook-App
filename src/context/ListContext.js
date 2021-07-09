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
    }
  }
  console.log('loadLocalLists ran');
  return true
}

const fetchLists = dispatch => async(listQueue) => {
  console.log('fetchLists called. queue:',listQueue);
  try {
    const {data} = await locationApi.get('/lists');  
    console.log('fetchLists response:',data);
    ///////////////////////////////////////////////////////////
    //Utility fn for when the model is changed, and new fields are expected
    // response.data.map(async (list)=>{
    //   if (!list.expanded){
    //     res = await locationApi.put(`/lists/${list._id}`,{...list,expanded:true})
    //   }
    // })
    // console.log('lists updated')
    ////////////////////////////////////////////////////////////
    const result = mergeWithQueue(data,listQueue);
    dispatch({type:'set_lists',payload:result});
    //set to localState... must be done here, so when loading local lists, the reducer doesn't have to set em to local store again
    setLocalData('lists',result);
    return data
  } catch(error){console.error(error)}
};

const createList = dispatch => async(name,color,icon,queueCreate) => {
  const _id = uuid.v4();
  const timeStamp = new Date().toISOString();
  const newList = {_id,name,color,icon,shown:true,expanded:true,datetimeCreated:timeStamp,datetimeModified:timeStamp}
  console.log('new list:',newList);
  try {
    console.log('trying to POST list')
    const {data} = await locationApi.post('/lists',{item:{...newList}});
    console.log('createList response:',data);
    dispatch({type:'create_list',payload:data});
  } catch(error){
    console.error(error);
    console.log('creating list locally');
    queueCreate(newList);
    dispatch({type:'create_list',payload:newList});
  }
  navigate('Drawer');
};

const editList = dispatch => async({_id,name,color,icon,shown,expanded},queueEdit) => {
  const datetimeModified = new Date().toISOString()
  try{
    console.log('trying to PUT list:',_id,name,color,icon,shown,expanded);
    const {data} = await locationApi.put(`/lists/${_id}`,{name,color,icon,shown,expanded,datetimeModified});
    console.log('editList response:',data);
    dispatch({type:'edit_list',payload:data});
  } catch (error){
    console.error(error)
    const updatedList = {_id,name,color,icon,shown,expanded,datetimeModified};
    console.log('updating list locally:',updatedList);
    queueEdit(updatedList);
    dispatch({type:'edit_list',payload:updatedList});
  }
  navigate('Map');
};

const deleteList = dispatch => async(list,queueDelete) => {
  try{
    console.log('trying to DELETE list:',list._id);
    const {data} = await locationApi.delete(`/lists/${list._id}`);
    console.log('deleteList response:',data);
    dispatch({type:'delete_list',payload:list._id});
  } catch(error){
    console.error(error)
    console.log('deleting list locally')
    queueDelete(list);
    dispatch({type:'delete_list',payload:list._id});
  }
};

const toggleShowList = dispatch => async({_id,name,color,icon,shown,expanded}) => {
  console.log('toggleShowList called')
  if (await SecureStore.getItemAsync('token')){
    const toggledShown = !shown;
    locationApi.put(`/lists/${_id}`,{name,color,icon,shown:toggledShown,expanded});
  }
  dispatch({type:'show_list',payload: _id});
};

const toggleExpandList = dispatch => async({_id,name,color,icon,shown,expanded}) => {
  console.log('toggleExpandList called');
  if (await SecureStore.getItemAsync('token')){
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