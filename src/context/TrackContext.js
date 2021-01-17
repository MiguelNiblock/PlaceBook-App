import createDataContext from './createDataContext';
import locationApi from '../api/location';

const TrackReducer = (state,action) => {
  switch (action.type){
    case 'fetch_tracks':
      return action.payload;
    default: 
      return state;
  };
};

const fetchTracks = dispatch => async() => {
  const response = await locationApi.get('/tracks');
  dispatch({type:'fetch_tracks', payload: response.data})
}
const createTrack = dispatch => (name,locations) => {
  locationApi.post('/tracks',{name,locations});
}

export const {Context, Provider} = createDataContext(
  TrackReducer,
  {fetchTracks,createTrack},
  []//empty list of tracks
)