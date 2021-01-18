import React,{useEffect,useContext,useState} from 'react';
import {View, ScrollView,TextInput, FlatList, TouchableOpacity} from 'react-native';
// import {Context as LocationContext} from '../context/LocationContext';
import {ListItem, Input, Rating, Text, Button} from 'react-native-elements';
import {navigate} from '../navigationRef'
import {Context as LocationEditContext} from '../context/LocationEditContext';

const LocationEditScreen = ({navigation}) => {

  const {state:{name,stars,notes,tags},changeName,changeStars,changeNotes,changeTags} = useContext(LocationEditContext);

  const loc = navigation.getParam('loc')
  const list = navigation.getParam('list')
  const {latitude, longitude} = loc.coords

  useEffect(()=>{
    changeName(loc.name)
    changeStars(loc.stars)
    changeNotes(loc.notes)
    changeTags(loc.tags)
  },[])

  return (
    <ScrollView>
      <Input label="Place Name" value={name} onChangeText={changeName}/>
      <Input disabled label="Address" value={loc.address} />
      <Rating startingValue={stars} onFinishRating={changeStars}/>
      <Input label="Notes" value={notes} onChangeText={changeNotes}/>
      <Input label="Tags" value={tags.join(' ')} onChangeText={changeTags}/>
      <Input disabled label="Coordinates" value={[latitude,longitude].join(', ')} />
      <Input disabled label="List" value={list.name} />      
      <Button title="Save"/>
    </ScrollView>
  )
};

export default LocationEditScreen;