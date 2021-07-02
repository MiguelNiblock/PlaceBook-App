import * as SecureStore from 'expo-secure-store';

export const setLocalData = async(key,data)=>{
  // console.log('setLocalData called')
  if(await SecureStore.isAvailableAsync()){
    const jsonValue = JSON.stringify(data)
    await SecureStore.setItemAsync(key,jsonValue)
  }
}