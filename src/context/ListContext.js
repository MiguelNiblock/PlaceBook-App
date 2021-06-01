import createDataContext from './createDataContext';
import locationApi from '../api/location';
import {navigate} from '../navigationRef';

const ListReducer = (state,action) => {
  switch (action.type){
    case 'fetch_lists':
      return action.payload;
    case 'create_list':
      return [...state, action.payload];
    case 'edit_list':
      return [...state.map( 
        (item)=>{ if(item._id === action.payload._id) return action.payload; else return item}
      )];
    case 'delete_list':
      return state.filter((item)=>item._id !== action.payload);
    default: 
      return state;
  };
};

const fetchLists = dispatch => async() => {
  console.log('fetchLists called');
  const response = await locationApi.get('/lists');
  console.log('fetchLists resp received');
  dispatch({type:'fetch_lists',payload:response.data});
};

const createList = dispatch => async(name,color,icon,shown) => {
  const response = await locationApi.post('/lists',{name,color,icon,shown});
  dispatch({type:'create_list',payload:response.data});
  console.log('createList ran. response:',response.data);
  navigate('Drawer');
};

const editList = dispatch => async(listId,name,color,icon,shown) => {
  const response = await locationApi.put(`/lists/${listId}`,{name,color,icon,shown});
  dispatch({type:'edit_list',payload:response.data});
  navigate('Drawer');
};

const deleteList = dispatch => async(listId) => {
  const response = await locationApi.delete(`/lists/${listId}`);
  dispatch({type:'delete_list',payload:listId});
  console.log('deleteList ran. response:',response.data);
}

export const {Context, Provider} = createDataContext(
  ListReducer,
  {fetchLists,createList,editList,deleteList},
  []//empty array of lists
);