import createDataContext from './createDataContext';
import * as SecureStore from 'expo-secure-store';
import {setLocalData} from '../hooks/safeAsync';

const Reducer = (state,{type,payload}) => {
  switch (type){
    case 'set_queue':
      return payload;
    case 'create':
      state.create.push(payload);
      console.log('new loc queue:',state);
      setLocalData('locQueue',state);
      return state;
    case 'update':
      const existingItemIx = state.create.findIndex( ({_id})=>_id === payload._id );
      // console.log(existingItemIx);
      if( existingItemIx !== -1 ){
        state.create.splice(existingItemIx,1,{...state.create[existingItemIx] ,...payload});
      } else {
        state.update.push(payload);
      }
      console.log('new loc queue:',state);
      setLocalData('locQueue',state);
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
      console.log('new loc queue:',state);
      setLocalData('locQueue',state);
      return state;
    case 'reset':
      setLocalData('locQueue',{create:[], update:[], delete:[]});
      return {create:[], update:[], delete:[]}  
    default: 
      return state;
  };
};

const loadLocalLocationQueue = dispatch => async()=> {
  console.log('loadLocalLocationQueue called')
  if(await SecureStore.isAvailableAsync()){
    let queue = await SecureStore.getItemAsync('locQueue')
    if (queue) {
      queue = JSON.parse(queue);
      console.log('loc queue from local storage:',queue)
      dispatch({type:'set_queue',payload:queue});
      console.log('loadLocalLocationQueue ran');
      return queue
    } else {
      console.log('loc queue is empty. Creating it...');
      setLocalData('locQueue',{create:[], update:[], delete:[]});
    }
  }
}

const locationCreateQueue = dispatch => async(item) => {
  console.log('locQueue create item:',item)
  dispatch({type:'create',payload:item})
}

const locationUpdateQueue = dispatch => async(item)=> {
  console.log('locQueue update item:',item)
  dispatch({type:'update',payload:item})
}

const locationDeleteQueue = dispatch => async(item)=>{
  console.log('locQueue delete item:',item._id);
  dispatch({type:'delete',payload:item})
}

const resetLocationQueue = dispatch => async()=>{dispatch({type:'reset'})}

const setLocationQueue = dispatch => async (queue)=>{
  setLocalData('locQueue',queue);
  dispatch( {type:'set_queue', payload:queue} )
}

export const {Context, Provider} = createDataContext(
  Reducer,
  {loadLocalLocationQueue,locationCreateQueue,locationUpdateQueue,locationDeleteQueue,resetLocationQueue,setLocationQueue},
  {
    create:[], update:[], delete:[]
  }//initial state
);