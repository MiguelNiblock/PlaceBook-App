import React, {useState,useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import { Text, Button, Input} from 'react-native-elements';
import Spacer from './Spacer';
import {Context as ListQueueContext} from '../context/ListQueueContext';
import {Context as LocationQueueContext} from '../context/LocationQueueContext';
import {Context as AuthContext} from '../context/AuthContext';
import {NavigationEvents} from 'react-navigation';

const AuthForm = ({ headerText, subtitle, onSubmit, submitButtonText, navText, navRoute }) => {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {state:{token,errorMessage},clearErrorMessage} = useContext(AuthContext);
  const {state:listQueue,resetListQueue} = useContext(ListQueueContext);
  const {state:locQueue,resetLocationQueue} = useContext(LocationQueueContext);
  const [validationError,setValError] = useState(null);

  const clearAllErrors = ()=> {
    clearErrorMessage();
    setValError(null);
  }

  const validate = (inputs) => {
    let errorMsg = '';
    Object.keys(inputs).forEach( (field) => {
      switch(field) {
        case 'username': 
          if (inputs[field].length === 0 ) {
            errorMsg += "Username can't be empty\n"
          }
          break
        case 'password': 
          if(inputs[field].length === 0 ) {
            errorMsg += "Password can't be empty\n"
          }
          break
      }
    })
    return errorMsg
  }

  const queues = {
    lists: listQueue,
    locs: locQueue
  }

  const resetQueues =async()=>{
    const resetListQP = await resetListQueue();
    const resetLocQP = await resetLocationQueue();
    return Promise.all([resetListQP,resetLocQP]).then(console.log('Queues were reset'))
  }

  const handleOnSubmit = async ({username,password}) => {
    setLoading(true);
    setValError(null);
    const validationErrors = validate({username,password});
    if (!validationErrors){
      await onSubmit({username,password,queues,resetQueues});
      setLoading(false);
    } else {
      setValError(validationErrors);
      setLoading(false);
    }
  }

  return (
    <>
    <NavigationEvents onWillFocus={clearAllErrors}/>
    <Spacer>
      <Text h3>{headerText}</Text>
      <Text style={styles.subtitle} >{subtitle}</Text>
    </Spacer>
    
    <Input
      label="Username" 
      value={username} 
      onChangeText={setUsername}
      autoCapitalize="none"
      autoCorrect={false}/>
    <Input 
      label="Password" 
      value={password} 
      onChangeText={setPassword} 
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry/>

    {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

    {validationError ? <Text style={styles.errorMessage}>{validationError}</Text> : null}

    <Button 
      containerStyle={styles.buttonBox} 
      buttonStyle={styles.button} 
      title={submitButtonText} 
      disabled={loading}
      loading={loading}
      onPress={()=>handleOnSubmit({username,password})}/>

    {/* {listQueue.create.map( (item)=> <Text>{item.name}</Text> )}  */}
    </>
  )

}

const styles = StyleSheet.create({
  subtitle: {
    fontSize:15,
    margin: 5
  },
  buttonBox: {
    marginTop: 10,
    width: '40%',
    alignSelf:'center'
  },
  button: {
    borderRadius: 20
  },
  errorMessage: {
    fontSize: 16,
    color: 'red',
    marginLeft: 15,
    // marginTop: 15
},
});

export default AuthForm;