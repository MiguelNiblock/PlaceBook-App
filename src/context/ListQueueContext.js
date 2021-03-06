import createDataContext from './createDataContext';
import locationApi from '../api/location';
import * as SecureStore from 'expo-secure-store';
import {setLocalData} from '../hooks/safeAsync';

const Reducer = (state,{type,payload}) => {
  switch (type){
    case 'set_queue':
      return payload;
    case 'create':
      state.create.push(payload);
      console.log('new list queue:',state);
      setLocalData('listQueue',state);
      return state;
    case 'update':
      const existingItemIx = state.create.findIndex( ({_id})=>_id === payload._id );
      // console.log(existingItemIx);
      if( existingItemIx !== -1 ){ //if item already in createQueue, overwrite it
        state.create.splice(existingItemIx,1,{...state.create[existingItemIx] ,...payload});
      } else {
        state.update.push(payload);
      }
      console.log('new list queue:',state);
      setLocalData('listQueue',state);
      return state;
    case 'delete':
      const existsCreateIx = state.create.findIndex( ({_id})=>{
        // console.log('id:',_id);
        return _id===payload._id
      } );
      const existsUpdateIx = state.update.findIndex( ({_id})=>_id===payload._id );
      if(existsCreateIx !== -1){
        state.create.splice(existsCreateIx,1);
      } else if(existsUpdateIx !== -1){
        state.update.splice(existsUpdateIx,1);
      } else {
        state.delete.push(payload);
      }
      console.log('new list queue:',state);
      setLocalData('listQueue',state);
      return state;
    case 'reset':
      return {create:[], update:[], delete:[]}  
    default: 
      return state;
  };
};

const loadLocalListQueue = dispatch => async()=> {
  console.log('loadLocalListQueue called')
  if(await SecureStore.isAvailableAsync()){
    let queue = await SecureStore.getItemAsync('listQueue')
    if (queue) {
      queue = JSON.parse(queue);
      console.log('list queue from local storage:',queue)
      dispatch({ type:'set_queue' ,payload:queue });
      return queue
    } else {
      console.log('No listQueue in local store. Creating it...');
      dispatch({ type:'set_queue', payload: {create:[], update:[], delete:[]} });
      setLocalData('listQueue',{create:[], update:[], delete:[]});
      return {create:[], update:[], delete:[]}
    }
  } else {
    console.error('Local store not available');
    return null
  }
}

const listCreateQueue = dispatch => async(item) => {
  console.log('queue create item:',item)
  dispatch({type:'create',payload:item})
}

const listUpdateQueue = dispatch => async(item)=> {
  console.log('queue update item:',item)
  dispatch({type:'update',payload:item})
}

const listDeleteQueue = dispatch => async(item)=>{
  console.log('queue delete item:',item._id);
  dispatch({type:'delete',payload:item})
}

const resetListQueue = dispatch => async()=>{
  await setLocalData('listQueue',{create:[], update:[], delete:[]});
  dispatch({type:'reset'})
  return 'List queue reset'
}

const setListQueue = dispatch => async (queue)=>{
  dispatch( {type:'set_queue', payload:queue} );
  await setLocalData('listQueue',queue);
  return queue
}

export const {Context, Provider} = createDataContext(
  Reducer,
  {loadLocalListQueue,listCreateQueue,listUpdateQueue,listDeleteQueue,resetListQueue,setListQueue},
  {
    create:[], update:[], delete:[]
  }//initial state
);