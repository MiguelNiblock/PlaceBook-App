import React,{useContext,useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import {Context as AuthContext} from '../context/AuthContext'
import Spacer from '../components/Spacer';
import {SafeAreaView} from 'react-navigation';
// import {FontAwesome} from '@expo/vector-icons';
import {Text} from 'react-native-elements';
import locationApi from '../api/location';

const AccountScreen = ()=>{

    const [userEmail,setUserEmail] = useState('');
    const [userDatetimeCreated,setDatetimeCreated] = useState('');
    
    const getUser = async()=>{
        const {data: {email, datetimeCreated}} = await locationApi.get('/users');
        const date = new Date(datetimeCreated);
        setUserEmail(email); setDatetimeCreated(date.toLocaleString());
    };

    useEffect(() => {
        console.log('accountScreen useEffect called');
        getUser(); 
    },[]);

    const {signout} = useContext(AuthContext);

    return (
    <SafeAreaView forceInset={{ top: 'always' }}>
    <Spacer> 
        <Text h2>Account</Text> 
    </Spacer>
    <Spacer>
        <Text style={{fontWeight:'bold'}} >Username: </Text><Text>{userEmail}</Text>
        <Text style={{fontWeight:'bold'}} >Date joined: </Text><Text>{userDatetimeCreated}</Text>
        {/* <Text>Map style:</Text> */}
    </Spacer>
    <Spacer>
        <Button title="Sign Out" onPress={signout}/>
    </Spacer>
    </SafeAreaView>
    )
};

// const styles = StyleSheet.create({});

export default AccountScreen;

