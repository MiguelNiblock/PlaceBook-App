import createDataContext from './createDataContext';
import locationApi from '../api/location';

const LocationReducer = (state,action) => {
  switch (action.type){
    case 'fetch_locs':
      return action.payload;
    case 'create_loc':
      return [...state, action.payload]
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

export const {Context, Provider} = createDataContext(
  LocationReducer,
  {fetchLocs, createLoc},
  []//empty array of locations
)