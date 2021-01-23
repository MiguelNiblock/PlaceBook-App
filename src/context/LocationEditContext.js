import createDataContext from './createDataContext';
import locationApi from '../api/location';

const LocationEditReducer = (state,action) => {
  switch (action.type){
    case 'change_name':
      return {...state, name:action.payload}
    case 'change_stars':
      return {...state, stars:action.payload}
    case 'change_notes':
      return {...state, notes:action.payload}
    case 'change_tags':
      return {...state, tags:action.payload}
    case 'change_address':
      return {...state, address:action.payload}
    case 'change_coords':
      return {...state, coords:action.payload}
    case 'change_list':
      return {...state, listId:action.payload}
    default:
      return state;
  };
};

const changeName = dispatch => (name) => {
  dispatch({type:'change_name', payload:name})
  // console.log(name)
}
const changeStars = dispatch => stars => {
  dispatch({type:'change_stars', payload:stars})
}
const changeNotes = dispatch => notes => {
  dispatch({type:'change_notes', payload:notes})
}
const changeTags = dispatch => tags => {
  if (typeof tags === 'string') {
    payload = tags.split(' ')
  } else {payload = tags}
  dispatch({type:'change_tags', payload})
}
const changeAddress = dispatch => address => {
  dispatch({type:'change_address', payload:address})
}
const changeCoords = dispatch => coords => {
  dispatch({type:'change_coords', payload:coords})
}
const changeListId = dispatch => listId => {
  dispatch({type:'change_list', payload:listId})
}

export const {Context, Provider} = createDataContext(
  LocationEditReducer,
  {changeName,changeStars,changeNotes,changeTags,changeAddress,changeCoords,changeListId},
  {name:'', address:'', coords:[], stars:0, notes:'', tags:[], listId:null}
  )