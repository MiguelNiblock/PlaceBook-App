import axios from 'axios';
import {AsyncStorage} from 'react-native';

const instance = axios.create({
    baseURL: 'https://fierce-depths-47546.herokuapp.com/'
})

instance.interceptors.request.use(
    //fn for success
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        };
        return config;
    },
    //fn for error
    (err) => Promise.reject(err)
)

export default instance;