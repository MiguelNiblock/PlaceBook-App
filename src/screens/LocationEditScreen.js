import React,{useEffect,useContext,useState} from 'react';
import {View, ScrollView,TextInput, FlatList, TouchableOpacity, StyleSheet, Picker} from 'react-native';
// import {Context as LocationContext} from '../context/LocationContext';
import {ListItem, Input, Rating, AirbnbRating, Text, Button} from 'react-native-elements';
import {navigate} from '../navigationRef'
import {Context as LocationEditContext} from '../context/LocationEditContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as ListContext} from '../context/ListContext';

const LocationEditScreen = ({navigation}) => {

  const {state:{name,address,coords,notes,stars,tags,listId},changeName,changeAddress,changeCoords,changeStars,changeNotes,changeTags,changeListId} = useContext(LocationEditContext);
  const {editLocation,createLocation,deleteLocation} = useContext(LocationContext);
  const {state:lists} = useContext(ListContext);

  const loc = navigation.getParam('loc');
  // console.log('loc:',loc)
  const {latitude, longitude} = loc.coords;

  useEffect(()=>{
    changeName(loc.name)
    changeAddress(loc.address)
    changeCoords(loc.coords)
    changeNotes(loc.notes)
    changeStars(loc.stars)
    changeTags(loc.tags)
    changeListId(loc.listId)
  },[])

  const saveLocation = (locId,name,address,coords,notes,stars,tags,listId) => {
    if (locId){//if location exists...
      editLocation(locId,name,address,coords,notes,stars,tags,listId);
    } else {
      createLocation(name,address,coords,notes,stars,tags,listId);
    }
  }

  const handleDeleteLocation = (locId) => {
    deleteLocation(locId);
    navigation.goBack();
  }

  return (
    <ScrollView>
      <Input label="Place Name" value={name} onChangeText={changeName} multiline={true} />
      <Input style={styles.addressInput} disabled label="Address" value={loc.address} multiline={true} />
      {/* <AirbnbRating ratingCount={5} showRating={true} fractions={0} startingValue={stars} onFinishRating={changeStars}/> */}
      <Input label="Notes" value={notes} onChangeText={changeNotes} multiline={true} />
      {/* <Input label="Tags" value={tags.join(' ')} onChangeText={changeTags} multiline={true} /> */}
      <Input disabled label="Coordinates" value={[latitude,longitude].join(', ')} multiline={true} />
      <Picker
        selectedValue={listId}
        onValueChange={(itemValue)=>changeListId(itemValue)}
        mode="dropdown"
        prompt="Lists of Places"
      >
        <Picker.Item label="Select a List" value={null} />
        {lists.map((item)=>{
          return <Picker.Item label={item.name} value={item._id} />
        })}
      </Picker>
      <Button title="Save" onPress={()=>saveLocation(loc._id,name,address,coords,notes,stars,tags,listId)}/>
      <Button onPress={()=>handleDeleteLocation(loc._id)} title='Delete' />
    </ScrollView>
  )
};

LocationEditScreen.navigationOptions = {
  title:'Place: '
}

const styles = StyleSheet.create({
})

export default LocationEditScreen;