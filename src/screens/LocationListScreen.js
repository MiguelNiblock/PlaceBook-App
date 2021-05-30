import React,{useEffect,useContext,useState} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as ListContext} from '../context/ListContext';
import {ListItem, Button} from 'react-native-elements';
import {navigate} from '../navigationRef'

const LocationListScreen = ({navigation}) => {

  const {state:locations} = useContext(LocationContext);
  const {state:lists} = useContext(ListContext);

  const listId = navigation.getParam('listId');
  const list = lists.find((item)=>item._id===listId);
  const didCreate = navigation.getParam('didCreate');

  useEffect(()=>{
    navigation.setParams({goToMap: ()=>navigate('Map',{hideDrawer:didCreate})})
  },[])

  return (
    <View>
      <Text>{listId}</Text>
      <Text>{list.name}</Text>
      <FlatList 
        data={locations.filter(item=>item.listId === listId)}
        renderItem={({item})=>{
          return (
            <TouchableOpacity style={{}}
              onPress={()=>navigate('Map',{hideDrawer:true, loc:item})}
            >
              <ListItem title={item.name} />
              <Button 
                title="Edit"
                onPress={()=>navigate('LocationEdit',{loc:item})}
                buttonStyle={{width:50}}
              />
            </TouchableOpacity>
          )
        }}
        keyExtractor={item=>item._id}
      />
    </View>
  )
};

LocationListScreen.navigationOptions = ({navigation}) => {
  const listName = navigation.getParam('listName');

  return {
    title: 'List: '+listName,
    headerLeft: () => (
      <Button 
        onPress={navigation.getParam('goToMap')}
        title='Back'
      />
    )
  }
}

export default LocationListScreen;