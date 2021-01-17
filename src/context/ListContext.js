import createDataContext from './createDataContext';
import locationApi from '../api/location';

const ListReducer = (state,action) => {
  switch (action.type){
    case 'fetch_lists':
      return action.payload;
    case 'create_list':
      return [...state, action.payload]
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
  await locationApi.post('/lists',{name,color,icon});
  dispatch({type:'create_list',payload:{name,color,icon}})
}

export const {Context, Provider} = createDataContext(
  ListReducer,
  {fetchLists, createList},
  []//empty array of lists
)