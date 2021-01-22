import React,{useEffect,useContext,useState} from 'react';
import {View, ScrollView,TextInput, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
// import {Context as LocationContext} from '../context/LocationContext';
import {ListItem, Input, Rating, Text, Button} from 'react-native-elements';
import {navigate} from '../navigationRef'
import {Context as LocationEditContext} from '../context/LocationEditContext';
import {Context as LocationContext} from '../context/LocationContext';

const LocationEditScreen = ({navigation}) => {

  const {state:{name,address,coords,notes,stars,tags,listId},changeName,changeAddress,changeCoords,changeStars,changeNotes,changeTags,changeList} = useContext(LocationEditContext);
  const {editLocation,createLocation} = useContext(LocationContext);

  const loc = navigation.getParam('loc')
  const list = navigation.getParam('list')
  const {latitude, longitude} = loc.coords

  useEffect(()=>{
    changeName(loc.name)
    changeAddress(loc.address)
    changeCoords(loc.coords)
    changeNotes(loc.notes)
    changeStars(loc.stars)
    changeTags(loc.tags)
    changeList(loc.listId)
  },[])

  const saveLocation = (_id,name,address,coords,notes,stars,tags,listId) => {
    if (_id){//if location exists...
      editLocation(_id,name,address,coords,notes,stars,tags,listId);
    } else {
      createLocation(name,address,coords,notes,stars,tags,listId);
    }
  }

  return (
    <ScrollView>
      <Input label="Place Name" value={name} onChangeText={changeName}/>
      <Input style={styles.addressInput} disabled label="Address" value={loc.address} />
      <Rating startingValue={stars} onFinishRating={changeStars}/>
      <Input label="Notes" value={notes} onChangeText={changeNotes}/>
      <Input label="Tags" value={tags.join(' ')} onChangeText={changeTags}/>
      <Input disabled label="Coordinates" value={[latitude,longitude].join(', ')} />
      <Input disabled label="List" value={list.name} />      
      <Button title="Save" onPress={()=>saveLocation(loc._id,name,address,coords,notes,stars,tags,listId)}/>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  addressInput: {
    // height: 150
  }
})

export default LocationEditScreen;