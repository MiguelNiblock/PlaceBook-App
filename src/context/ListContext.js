import createDataContext from './createDataContext';
import locationApi from '../api/location';
import {navigate} from '../navigationRef';

const ListReducer = (state,action) => {
  switch (action.type){
    case 'fetch_lists':
      return action.payload;
    case 'create_list':
      return [...state, action.payload]
    case 'edit_list':
      return [...state.map( 
        (item)=>{ if(item._id === action.payload._id) return action.payload; else return item}
      )]
    default: 
      return state;
  };
};

const fetchLists = dispatch => async() => {
  const response = await locationApi.get('/lists');
  dispatch({type:'fetch_lists', payload: response.data})
  // console.log(response.data)
}
const createList = dispatch => async(name,color,icon) => {
  const response = await locationApi.post('/lists',{name,color,icon});
  dispatch({type:'create_list', payload:response.data});
  navigate('Drawer');
}
const editList = dispatch => async(listId,name,color,icon) => {
  const response = await locationApi.put(`/lists/${listId}`,{name,color,icon});
  dispatch({type:'edit_list', payload:response.data});
  navigate('Drawer');
};

export const {Context, Provider} = createDataContext(
  ListReducer,
  {fetchLists,createList,editList},
  []//empty array of lists
)