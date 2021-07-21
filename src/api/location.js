import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const instance = axios.create({
    baseURL: 'https://fierce-depths-47546.herokuapp.com/',
    // baseURL: 'http://172.16.16.204:3000',
    timeout: 5000
})

instance.interceptors.request.use(
    //fn for success
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        // console.log('Token axios:',token);
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        };
        return config;
    },
    //fn for error
    async (err) => Promise.reject(err)
)

export default instance;