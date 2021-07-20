import React, {useContext,useEffect} from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import AuthForm from '../components/AuthForm';
import {Context as AuthContext} from '../context/AuthContext';

const SigninScreen = ({navigation})=>{
    const {state, signin, clearErrorMessage} = useContext(AuthContext);

    return (
        <ScrollView>
        <View style={styles.container}>
            <AuthForm
                headerText="Sign In"
                subtitle="Access all your saved places!"
                submitButtonText="Sign In"
                onSubmit={signin}
                navText="Don't have an account? Sign-Up instead"
                navRoute='Signup' />

            <TouchableOpacity 
                style={styles.link} 
                onPress={ ()=>navigation.navigate('Signup') } >
                <Text style={styles.blue} >Don't have an account? <Text style={[styles.blue,{textDecorationLine:'underline'}]} >Sign-Up</Text> instead</Text>
            </TouchableOpacity>
        </View>
        </ScrollView>
    )
};

SigninScreen.navigationOptions = ({navigation})=> {
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

export default SigninScreen;