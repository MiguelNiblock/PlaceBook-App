import createDataContext from './createDataContext';
import locationApi from '../api/location';
import * as SecureStore from 'expo-secure-store';
import {navigate} from '../navigationRef';
import {setLocalData} from '../hooks/safeAsync';

//REDUCER
//////////
const authReducer = (state, action) => {
    switch (action.type) {
        case 'add_error':
            return {...state, errorMessage: action.payload};
        case 'signin'://covers both signup & signin
            setLocalData('token',action.payload);
            return {errorMessage: '', token: action.payload};
        case 'clear_error_message':
            return {...state, errorMessage: ''};
        case 'signout':
            setLocalData('token',null);
            return {token: null, errorMessage: ''};
        default:
            return state;
    }
};

//ACTIONS
///////////
const signup = (dispatch) => async ({username,password}) => {
    try {
        //make api req to sign up with that email and passwd
        const {data} = await locationApi.post('/signup',{username,password});
        //update state.
        dispatch({type:'signin',payload:data.token});
        //navigate to main flow
        navigate('Map');
    } catch (err) {
        console.log(err.response.data);
        dispatch({type:'add_error',payload:'Something went wrong with signup.'});
    }
};    

const signin = (dispatch) => async({email,password}) => {
    try {
        //http request to signin route
        const {data} = await locationApi.post('/signin',{email,password});
        //update state
        dispatch({type:'signin',payload:data.token});
        //navigate to main flow
        navigate('mainFlow');
    } catch (err) {
        dispatch({type:'add_error',payload:'Something went wrong with sign in'});
    }
};

const clearErrorMessage = (dispatch) => () => {
    dispatch({type:'clear_error_message'});
}

const tryLocalSignin = dispatch => async() => {
    console.log('tryLocalSignin called')
    const token = await SecureStore.getItemAsync('token');
    // let token = null;
    if(token) {
        dispatch({type:'signin',payload:token});
    }
}

const signout = (dispatch) => async () => {
    dispatch({type:'signout'});
    // navigate('Signin');
}

//EXPORT
//////////////////
export const { Provider, Context} = createDataContext(//fn creates Provider & Context
    authReducer, //reducer
    {signup, signin, signout, clearErrorMessage, tryLocalSignin}, //actions
    {token: null, errorMessage: ''} //defaultValue
)