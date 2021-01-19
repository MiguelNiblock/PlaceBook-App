import createDataContext from './createDataContext';
import locationApi from '../api/location';

const LocationReducer = (state,action) => {
  switch (action.type){
    case 'fetch_locs':
      return action.payload;
    case 'create_loc':
      return [...state, action.payload];
    case 'edit_loc':
      return [...state.map( 
        (item)=>{ if(item._id === action.payload._id) return action.payload; else return item}
      )]
    default: 
      return state;
  };
};

const fetchLocs = dispatch => async() => {
  const response = await locationApi.get('/locs');
  dispatch({type:'fetch_locs', payload: response.data})
  // console.log(response.data)
}
const createLoc = dispatch => async(name,address,coords,notes,stars,tags,listId) => {
  const response = await locationApi.post('/locs',{name,address,coords,notes,stars,tags,listId});
  dispatch({type:'create_loc', payload:response.data})
}
const editLocation = dispatch => async(_id,name,address,coords,notes,stars,tags,listId) => {
  const response = await locationApi.put( `/locs/${_id}`,
    {name,address,coords,notes,stars,tags,listId}
  );
  dispatch({type:'edit_loc', payload:response.data})
  console.log('editLocation ran. response:',response.data)
}

export const {Context, Provider} = createDataContext(
  LocationReducer,
  {fetchLocs, createLoc,editLocation},
  []//empty array of locations
)