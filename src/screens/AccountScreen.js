import React,{useContext,useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Button, Text} from 'react-native-elements';
import {Context as AuthContext} from '../context/AuthContext';
import {Context as ListContext} from '../context/ListContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as ListQueueContext} from '../context/ListQueueContext';
import {Context as LocationQueueContext} from '../context/LocationQueueContext'
import {SafeAreaView} from 'react-navigation';
import locationApi from '../api/location';
import {navigate} from '../navigationRef';

const AccountScreen = ()=>{

    const {signout} = useContext(AuthContext);
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
        getUser();
    },[]);

    const handleSignOut = async () => {
        navigate('Map',{hideDrawer:true,hideBottomSheet:true});
        const resetedLocs = resetLocations();
        const resetedLists = resetLists();
        const resetedLocQueue = resetLocationQueue();
        const resetedListQueue = resetListQueue();
        // await Promise.all([resetedLocs,resetedLists,resetedLocQueue,resetedListQueue]).then(signout())
        signout()
    }

    return (
    <SafeAreaView forceInset={{ top: 'always' }}>
    
    <Text h3 style={styles.title} >Account</Text>
    <Text style={styles.text} >Username: <Text>{username}</Text> </Text>
    <Text style={styles.text} >Date joined: <Text>{userDatetimeCreated}</Text></Text>
    <Button 
        containerStyle={styles.buttonBox} 
        buttonStyle={styles.button} 
        title="Sign Out" 
        onPress={handleSignOut}/> 

    </SafeAreaView>
    )
};

AccountScreen.navigationOptions = ()=>{
    return {
        title: ''
    }
}

const styles = StyleSheet.create({
    title: {
        alignSelf:'flex-start',
        marginLeft:'5%',
        marginTop: '10%',
    },  
    text: {
        alignSelf: 'flex-start',
        marginLeft:'10%',
        marginTop: '10%',
        fontWeight: 'bold',
        fontSize:16
    },
    buttonBox: {
        marginTop: '10%',
        width: '40%',
        alignSelf:'center'
      },
    button: {
        borderRadius: 20
    },

});

export default AccountScreen;

