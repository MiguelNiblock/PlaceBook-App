import React, {useContext,useEffect} from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Button, Text, Icon} from 'react-native-elements';
import {Context as AuthContext} from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import {NavigationEvents} from 'react-navigation';
import * as WebBrowser from 'expo-web-browser';

const SignupScreen = ({navigation})=>{
    
    const {state:{token,errorMessage},signup,clearErrorMessage} = useContext(AuthContext);

    return (
    <ScrollView>
    <View style={styles.container}>
    <NavigationEvents onWillFocus={clearErrorMessage}/>
    <AuthForm
        headerText="Sign Up"
        subtitle="Access your places on all your devices!"
        submitButtonText="Sign Up"
        onSubmit={signup} />

    <TouchableOpacity 
        style={styles.link} 
        onPress={ ()=>navigation.navigate('Signin') } >
        <Text style={styles.blue} >Or <Text style={[styles.blue,{textDecorationLine:'underline'}]} >Sign-In</Text> if you already have an account </Text>
    </TouchableOpacity>

    <TouchableOpacity 
        style={styles.link} 
        onPress={ ()=>WebBrowser.openBrowserAsync('https://miguelniblock.github.io/PlaceBook-App/android-privacy-policy.html') } >
        <Text >By signing up you agree to our <Text style={{textDecorationLine:'underline'}} >Privacy Policy</Text></Text>
    </TouchableOpacity>
    
    </View> 
    </ScrollView>
    );
};

SignupScreen.navigationOptions = ({navigation})=>{
    return {
        title: '',
        headerLeft: ()=>(
            <Icon name='arrow-left' 
            type='material-community' 
            size={27} 
            onPress={()=>navigation.popToTop()} 
            containerStyle={{marginLeft:10}} />
        )
    }
}

const styles = StyleSheet.create({
    container: {
        // borderColor: 'red',
        // borderWidth: 10,
        flex:1, // expands the view to take all the screen
        justifyContent: 'center', //centers vertically
        marginBottom: 150 // centering starts from higher
    },
    link: {
        alignSelf: 'center',
        marginTop: '6%'
    },
    blue: {
        color: '#2089dc'
    }
});

export default SignupScreen;