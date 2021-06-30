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
            return { ...item, ...action.payload}
          } else return item
        }
      )];
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
      // console.log('lists from local storage:',lists)
      dispatch({type:'set_lists',payload:lists});
    }
  }
  console.log('loadLocalLists ran')
}

const fetchLists = dispatch => async(token,listQueue) => {
  console.log('fetchLists called');
  if (token){
    const {data} = await locationApi.get('/lists');  
    console.log('fetchLists response received');
    ///////////////////////////////////////////////////////////
    //Utility fn for when the model is changed, and new fields are expected
    // response.data.map(async (list)=>{
    //   if (!list.expanded){
    //     res = await locationApi.put(`/lists/${list._id}`,{...list,expanded:true})
    //   }
    // })
    // console.log('lists updated')
    ////////////////////////////////////////////////////////////
    //resolve conflicts with local queues
    const result = mergeWithQueue(data,listQueue);
    ////////////////////////////////////////////////////////////
    dispatch({type:'set_lists',payload:result});
    //set to localState...
  }
};

const createList = dispatch => async(name,color,icon,queue) => {
  console.log('createList called')
  if (await SecureStore.getItemAsync('token')){
    console.log('trying to post list')
    const {data} = await locationApi.post('/lists',{name,color,icon});
    dispatch({type:'create_list',payload:data});
    console.log('createList ran. response:',data);
  } else {
    console.log('creating list locally')
    const timeStamp = new Date().toISOString();
    const newList = {_id:uuid.v4(),name,color,icon,shown:true,expanded:true,datetimeCreated:timeStamp,datetimeModified:timeStamp}
    console.log('list created locally:',newList);
    queue(newList);
    dispatch({type:'create_list',payload:newList});
  }
  navigate('Drawer');
};

const editList = dispatch => async({_id,name,color,icon,shown,expanded},queue) => {
  console.log('editList called')
  const datetimeModified = new Date().toISOString()
  if (await SecureStore.getItemAsync('token')){
    console.log('trying to PUT list')
    // console.log('editList:',_id,name,color,icon,shown,expanded);
    const {data} = await locationApi.put(`/lists/${_id}`,{name,color,icon,shown,expanded,datetimeModified});
    // console.log('response:',response.data);
    dispatch({type:'edit_list',payload:data});
  }else{
    console.log('updating list locally')
    const updatedList = {_id,name,color,icon,shown,expanded,datetimeModified};
    queue(updatedList);
    dispatch({type:'edit_list',payload:updatedList});
  }
  navigate('Map');
};

const deleteList = dispatch => async(listId,queue) => {
  console.log('deleteList called')
  if (await SecureStore.getItemAsync('token')){
    console.log('trying to DELETE list on backend')
    const {data} = await locationApi.delete(`/lists/${listId}`);
    dispatch({type:'delete_list',payload:listId});
    console.log('deleteList ran. response:',data);
  } else {
    console.log('deleting list locally')
    queue(listId);
    dispatch({type:'delete_list',payload:listId});
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

export const {Context, Provider} = createDataContext(
  ListReducer,
  {loadLocalLists,fetchLists,createList,editList,deleteList,toggleExpandList,toggleShowList},
  []//empty array of lists
);