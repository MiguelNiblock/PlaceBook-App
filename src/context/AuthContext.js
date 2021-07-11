import createDataContext from './createDataContext';
import locationApi from '../api/location';
import * as SecureStore from 'expo-secure-store';
import {navigate} from '../navigationRef';

//REDUCER
//////////
const authReducer = (state, {type,payload}) => {
    switch (type) {
        case 'add_error':
            return {...state, errorMessage:payload};
        case 'signin'://covers both signup & signin
            console.log('signin payload:',payload);
            if(!payload.local){ SecureStore.setItemAsync('token',payload.token) };
            return {errorMessage:'', token:payload.token};
        case 'clear_error_message':
            return {...state, errorMessage:''};
        case 'signout':
            SecureStore.deleteItemAsync('token');
            return {token:null, errorMessage:''};
        default:
            return state;
    }
};

//ACTIONS
///////////
const tryLocalSignin = dispatch => async() => {
    console.log('tryLocalSignin called')
    // let token = null;
    const token = await SecureStore.getItemAsync('token');
    console.log('local token:',token);
    if(token) {
        dispatch({type:'signin', payload:{ token, local:true }});
    }
    return true
}

const signup = (dispatch) => async ({username,password,queues,resetQueues}) => {
    try {
        console.log('signup action input:',username,password,queues);
        const {data} = await locationApi.post('/signup',{username,password,queues});
        console.log('signup response:',data);
        await resetQueues();
        dispatch({ type:'signin', payload:{ token:data.token, local:false} });
        navigate('Map');
    } catch (err) {
        console.error(err);
        dispatch({type:'add_error',payload:'Something went wrong with signup'});
    }
};    

const signin = (dispatch) => async({username,password,queues,resetQueues}) => {
    try {
        console.log('signin action input:',username,password,queues);
        const {data} = await locationApi.post('/signin',{username,password,queues});
        console.log('signin response:',data);
        await resetQueues();
            //only if the signin action is not local, token will be set saved to localStore
        dispatch({type:'signin', payload:{ token:data.token, local:false } });
        navigate('Map');
    } catch (err) {
        console.error(err);
        dispatch({type:'add_error',payload:'Something went wrong with sign in'});
    }
};

const clearErrorMessage = (dispatch) => () => {
    dispatch({type:'clear_error_message'});
}

const signout = (dispatch) => async () => {
    dispatch({type:'signout'});
}

//EXPORT
//////////////////
export const { Provider, Context} = createDataContext(//fn creates Provider & Context
    authReducer, //reducer
    {signup, signin, signout, clearErrorMessage, tryLocalSignin}, //actions
    {token: null, errorMessage: ''} //defaultValue
)