import React, {useState,useContext} from 'react';
import {View, StyleSheet} from 'react-native';
import { Text, Button, Input} from 'react-native-elements';
import Spacer from './Spacer';
import {Context as ListQueueContext} from '../context/ListQueueContext';
import {Context as LocationQueueContext} from '../context/LocationQueueContext';
import NavLink from './NavLink';

const AuthForm = ({ headerText, subtitle, errorMessage, onSubmit, submitButtonText, navText, navRoute }) => {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const {state:listQueue,resetListQueue} = useContext(ListQueueContext);
  const {state:locQueue,resetLocationQueue} = useContext(LocationQueueContext);

  const queues = {
    lists: listQueue,
    locs: locQueue
  }

  const resetQueues =async()=>{
    const resetListQP = await resetListQueue();
    const resetLocQP = await resetLocationQueue();
    return Promise.all([resetListQP,resetLocQP]).then(console.log('Queues were reset'))
  };

  return (
    <>
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

    <Button 
      containerStyle={styles.buttonBox} 
      buttonStyle={styles.button} 
      title={submitButtonText} 
      onPress={()=>onSubmit({username,password,queues,resetQueues})}/>

    <NavLink 
      text={navText} routeName={navRoute} />

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