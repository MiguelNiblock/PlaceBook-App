import React,{useContext,useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import {Context as AuthContext} from '../context/AuthContext';
import {Context as ListContext} from '../context/ListContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as ListQueueContext} from '../context/ListQueueContext';
import {Context as LocationQueueContext} from '../context/LocationQueueContext'
import {SafeAreaView} from 'react-navigation';
import {Text} from 'react-native-elements';
import locationApi from '../api/location';
import AuthForm from '../components/AuthForm';
import {navigate} from '../navigationRef';
// import * as SecureStore from 'expo-secure-store';

const AccountScreen = ()=>{

    const {signout,signup,clearErrorMessage,state:{token,errorMessage}} = useContext(AuthContext);
    const {resetLists} = useContext(ListContext);
    const {resetLocations} = useContext(LocationContext);
    const {resetListQueue} = useContext(ListQueueContext);
    const {resetLocationQueue} = useContext(LocationQueueContext);

    const [username,setUsername] = useState('');
    const [userDatetimeCreated,setDatetimeCreated] = useState('');
    
    const getUser = async()=>{
        const {data: {username, datetimeCreated}} = await locationApi.get('/users');
        // console.log('data:',username,datetimeCreated);
        const date = new Date(datetimeCreated);
        setUsername(username); setDatetimeCreated(date.toLocaleString());
    };

    useEffect(() => {
        console.log('accountScreen useEffect called');
        token && getUser();
        clearErrorMessage();
    },[]);

    const handleSignOut = async () => {
        navigate('Map',{hideDrawer:true});
        const resetedLocs = resetLocations();
        const resetedLists = resetLists();
        const resetedLocQueue = resetLocationQueue();
        const resetedListQueue = resetListQueue();
        await Promise.all([resetedLocs,resetedLists,resetedLocQueue,resetedListQueue]).then(signout())
    }

    return (
    <SafeAreaView forceInset={{ top: 'always' }}>
    
    {token && <> 
        <Text style={{fontWeight:'bold'}} >Username: </Text><Text>{username}</Text>
        <Text style={{fontWeight:'bold'}} >Date joined: </Text><Text>{userDatetimeCreated}</Text>
        <Button title="Sign Out" onPress={handleSignOut}/> 
    </>}
    {!token && <>
        <AuthForm
            headerText="Sign Up"
            subtitle="Access your places on all your devices!"
            errorMessage={errorMessage}
            submitButtonText="Sign Up"
            onSubmit={signup}
            navText='Or Sign-In if you already have an account'
            navRoute='Signin'
        />
    </>}

    </SafeAreaView>
    )
};

AccountScreen.navigationOptions = ()=>{
    return {
        title: ''
    }
}

// const styles = StyleSheet.create({});

export default AccountScreen;

