import React,{useEffect,useContext,useState} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as ListContext} from '../context/ListContext';
import {ListItem, Button} from 'react-native-elements';
import {navigate} from '../navigationRef'

const LocationListScreen = ({navigation}) => {

  const {fetchLocs, state:locations} = useContext(LocationContext);
  const {state:lists} = useContext(ListContext);

  const listId = navigation.getParam('listId');
  const list = lists.find((item)=>item._id===listId);

  useEffect(()=>{
    fetchLocs();
  }, [])


  return (
    <View>
      <Text>{listId}</Text>
      <Text>{list.name}</Text>
      <FlatList 
        data={locations.filter(item=>item.listId === listId)}
        renderItem={({item})=>{
          return (
            <TouchableOpacity
              style={{}}
              // onPress={}
            >
              <ListItem 
                title={item.name} 
              />
              <Button 
                title="Edit"
                onPress={()=>navigate('LocationEdit',{loc: item})}
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

export default LocationListScreen;