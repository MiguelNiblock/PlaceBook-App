import React, {useContext} from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import AuthForm from '../components/AuthForm';
import NavLink from '../components/NavLink';
import {Context as AuthContext} from '../context/AuthContext';
import {NavigationEvents} from 'react-navigation';

const SigninScreen = ()=>{
    const {state, signin, clearErrorMessage} = useContext(AuthContext);

    return (
        <ScrollView>
        <View style={styles.container}>
            <NavigationEvents onWillFocus={clearErrorMessage}/>
            <AuthForm 
                headerText="Sign In to Your Account"
                errorMessage={state.errorMessage}
                onSubmit={signin}
                submitButtonText="Sign In"
            />
            <NavLink 
                text="Don't have an account? Sign up instead"
                routeName="Signup"
            />
        </View>
        </ScrollView>
    )
};

SigninScreen.navigationOptions = {
    headerShown: false
}

const styles = StyleSheet.create({
    container: {
        // borderColor: 'red',
        // borderWidth: 10,
        flex:1, // expands the view to take all the screen
        justifyContent: 'center', //centers vertically
        marginBottom: 150 // centering starts from higher
    },
});

export default SigninScreen;