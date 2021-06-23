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
    case 'show_list':
      return [...state.map( 
        (item)=>{ if(item._id === action.payload) return {...item, shown:!item.shown}; else return item}
      )];
    case 'expand_list':
      return [...state.map( 
        (item)=>{ if(item._id === action.payload) return {...item, expanded:!item.expanded}; else return item}
      )];
    default: 
      return state;
  };
};

const fetchLists = dispatch => async() => {
  console.log('fetchLists called');
  const response = await locationApi.get('/lists');  
  // response.data.map(async (list)=>{
  //   if (!list.expanded){
  //     res = await locationApi.put(`/lists/${list._id}`,{...list,expanded:true})
  //   }
  // })
  // console.log('lists updated')
  dispatch({type:'fetch_lists',payload:response.data});
};

const createList = dispatch => async(name,color,icon) => {
  const response = await locationApi.post('/lists',{name,color,icon});
  dispatch({type:'create_list',payload:response.data});
  console.log('createList ran. response:',response.data);
  navigate('Drawer');
};

const editList = dispatch => async(listId,name,color,icon,shown,expanded) => {
  const response = await locationApi.put(`/lists/${listId}`,{name,color,icon,shown,expanded});
  dispatch({type:'edit_list',payload:response.data});
  navigate('Drawer');
};

const deleteList = dispatch => async(listId) => {
  const response = await locationApi.delete(`/lists/${listId}`);
  dispatch({type:'delete_list',payload:listId});
  console.log('deleteList ran. response:',response.data);
};

const toggleShowList = dispatch => ({_id,name,color,icon,shown,expanded}) => {
  console.log('toggleShowList called');
  const toggledShown = !shown;
  locationApi.put(`/lists/${_id}`,{name,color,icon,shown:toggledShown,expanded});
  dispatch({type:'show_list',payload: _id});
};

const toggleExpandList = dispatch => ({_id,name,color,icon,shown,expanded}) => {
  // console.log('toggleExpandList called');
  const toggledExpanded = !expanded;
  locationApi.put(`/lists/${_id}`,{name,color,icon,shown,expanded:toggledExpanded});
  dispatch({type:'expand_list',payload: _id});
};

export const {Context, Provider} = createDataContext(
  ListReducer,
  {fetchLists,createList,editList,deleteList,toggleExpandList,toggleShowList},
  []//empty array of lists
);