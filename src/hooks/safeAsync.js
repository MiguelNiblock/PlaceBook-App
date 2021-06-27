import * as SecureStore from 'expo-secure-store';

export const getLocalData = async()=>{
  console.log('getLocalData called')
}
export const setLocalData = async(key,data)=>{
  console.log('setLocalData called')
  if(await SecureStore.isAvailableAsync()){
    const jsonValue = JSON.stringify(data)
    await SecureStore.setItemAsync(key,jsonValue)
  }
}