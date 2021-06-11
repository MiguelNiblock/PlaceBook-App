import React,{useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import {Context as AuthContext} from '../context/AuthContext'
import Spacer from '../components/Spacer';
import {SafeAreaView} from 'react-navigation';
import {FontAwesome} from '@expo/vector-icons';
import {Text} from 'react-native-elements';

const AccountScreen = ()=>{

    const {signout} = useContext(AuthContext);

    return (
    <SafeAreaView forceInset={{ top: 'always' }}>
    <Spacer> 
        <Text h2>Account</Text> 
    </Spacer>
    <Spacer>
        <Text>Username:</Text>
        <Text>Date joined:</Text>
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

