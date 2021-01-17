import createDataContext from './createDataContext';
import locationApi from '../api/location';
import {AsyncStorage} from 'react-native';
import {navigate} from '../navigationRef';

//REDUCER
//////////
const authReducer = (state, action) => {
    switch (action.type) {
        case 'add_error':
            return {...state, errorMessage: action.payload};
        case 'signin'://covers both signup & signin
            return {errorMessage: '', token: action.payload}
        case 'clear_error_message':
            return {...state, errorMessage: ''}
        case 'signout':
            return {token: null, errorMessage: ''}
        default:
            return state;
    }
};

//ACTIONS
///////////
const signup = (dispatch) => async ({email,password}) => {
    try {
        //make api req to sign up with that email and passwd
        const response = await locationApi.post('/signup',{email,password});
        //save token in phone storage
        await AsyncStorage.setItem('token',response.data.token);
        //update state.
        dispatch({type:'signin',payload:response.data.token});
        //navigate to main flow
        navigate('mainFlow');
    } catch (err) {
        console.log(err.response.data);
        dispatch({type:'add_error',payload:'Something went wrong with signup.'})
    }
};
    

const signin = (dispatch) => async({email,password}) => {
    try {
        //http request to signin route
        const response = await locationApi.post('/signin',{email,password})
        //save token in phone storage
        await AsyncStorage.setItem('token',response.data.token)
        //update state
        dispatch({type:'signin',payload:response.data.token})
        //navigate to main flow
        navigate('mainFlow')
    } catch (err) {
        dispatch({type:'add_error',payload:'Something went wrong with sign in'})
    }
};

const clearErrorMessage = (dispatch) => () => {
    dispatch({type:'clear_error_message'})
}

const tryLocalSignin = dispatch => async() => {
    const token = await AsyncStorage.getItem('token');
    if(token) {
        dispatch({type:'signin',payload:token})
        navigate('mainFlow')
    } else {
        navigate('Signup')
    }
}

const signout = (dispatch) => async () => {
    await AsyncStorage.removeItem('token');
    dispatch({type:'signout'})
    navigate('Signin')
}

//EXPORT
//////////////////
export const { Provider, Context} = createDataContext(//fn creates Provider & Context
    authReducer, //reducer
    {signup, signin, signout, clearErrorMessage, tryLocalSignin}, //actions
    {token: null, errorMessage: ''} //defaultValue
)