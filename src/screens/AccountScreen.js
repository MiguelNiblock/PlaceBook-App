import React,{useContext,useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import {Context as AuthContext} from '../context/AuthContext'
import {SafeAreaView} from 'react-navigation';
import {Text} from 'react-native-elements';
import locationApi from '../api/location';
import AuthForm from '../components/AuthForm';
import * as SecureStore from 'expo-secure-store';

const AccountScreen = ()=>{

    const {signout,signup,state:{token,errorMessage}} = useContext(AuthContext);
    const [userEmail,setUserEmail] = useState('');
    const [userDatetimeCreated,setDatetimeCreated] = useState('');
    
    const getUser = async()=>{
        const {data: {email, datetimeCreated}} = await locationApi.get('/users');
        // console.log('data:',email,datetimeCreated);
        const date = new Date(datetimeCreated);
        setUserEmail(email); setDatetimeCreated(date.toLocaleString());
    };

    useEffect(() => {
        console.log('accountScreen useEffect called');
        token && getUser();
    },[]);

    return (
    <SafeAreaView forceInset={{ top: 'always' }}>
    
    {token && <> 
        <Text style={{fontWeight:'bold'}} >Username: </Text><Text>{userEmail}</Text>
        <Text style={{fontWeight:'bold'}} >Date joined: </Text><Text>{userDatetimeCreated}</Text>
        <Button title="Sign Out" onPress={signout}/> 
    </>}
    {!token && <>
        <AuthForm
            headerText="Sign Up"
            errorMessage={errorMessage}
            submitButtonText="Sign Up"
            onSubmit={signup}
        />
    </>}

    </SafeAreaView>
    )
};

// const styles = StyleSheet.create({});

export default AccountScreen;

