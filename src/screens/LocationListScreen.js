import React,{useEffect,useContext} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {Context as LocationContext} from '../context/LocationContext';
import {ListItem} from 'react-native-elements';
import {navigate} from '../navigationRef'

const LocationListScreen = ({navigation}) => {

  const {fetchLocs, state} = useContext(LocationContext);
  
  useEffect(()=>{
    fetchLocs();
  }, [])

  const list = navigation.getParam('list')
  // console.log(list)

  return (
    <View>
      <Text>{list._id}</Text>
      <Text>{list.name}</Text>
      <FlatList 
        data={state.filter(item=>item.listId === list._id)}
        renderItem={({item})=>{
          return (
            <TouchableOpacity
              onPress={()=>navigate('LocationEdit',{loc: item})}
            >
              <ListItem title={item.name} />
            </TouchableOpacity>
          )
        }}
        keyExtractor={item=>item._id}
      />
    </View>
  )
};

export default LocationListScreen;