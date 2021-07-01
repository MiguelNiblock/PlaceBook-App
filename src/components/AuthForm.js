import React, {useState,useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import { Text, Button, Input} from 'react-native-elements';
import Spacer from './Spacer';
import {Context as ListQueueContext} from '../context/ListQueueContext';

const AuthForm = ({ headerText, errorMessage, onSubmit, submitButtonText }) => {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const {state:listQueue} = useContext(ListQueueContext);
  // console.log(listQueue);

  const queues = {
    lists: listQueue,
    // places: placesQueue
  }

  return (
    <>
    <Spacer>
      <Text h3>{headerText}</Text>
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
      secureTextEntry
        />
    {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
    <Spacer>
      <Button title={submitButtonText} onPress={()=>onSubmit({username,password,queues})}/>
    </Spacer>
    {/* {listQueue.create.map( (item)=> <Text>{item.name}</Text> )}  */}
    </>
  )

}

const styles = StyleSheet.create({
  errorMessage: {
    fontSize: 16,
    color: 'red',
    marginLeft: 15,
    // marginTop: 15
},
});

export default AuthForm;