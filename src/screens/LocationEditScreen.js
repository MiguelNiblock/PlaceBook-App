import React,{useEffect,useContext,useState} from 'react';
import {View, ScrollView,TextInput, FlatList, TouchableOpacity, StyleSheet, Picker} from 'react-native';
// import {Context as LocationContext} from '../context/LocationContext';
import {ListItem, Input, Rating, AirbnbRating, Text, Button, Icon} from 'react-native-elements';
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

  const coordsString = [latitude,longitude].join(', ');

  return (
    <ScrollView>

      <Input label="Place Name" value={name} onChangeText={changeName} multiline={true} leftIcon={{ type:'material-community', name:'map-marker' }} />

      <Input label="Notes" value={notes} onChangeText={changeNotes} multiline={true}  leftIcon={{ type:'material-community', name:'text' }} />

      <Input disabled label="Address" InputComponent={()=>(<Text style={styles.disabledInput} selectable numberOfLines={0} >{loc.address}</Text> )} leftIcon={{ type:'material-community', name:'map-legend' }} />

      {/* <AirbnbRating ratingCount={5} showRating={true} fractions={0} startingValue={stars} onFinishRating={changeStars}/> */}

      {/* <Input label="Tags" value={tags.join(' ')} onChangeText={changeTags} multiline={true} /> */}

      <Input disabled label="Coordinates" InputComponent={()=>(<Text style={styles.disabledInput} selectable numberOfLines={0} >{[latitude,longitude].join(',\n ')}</Text> )} leftIcon={{ type:'material-community', name:'crosshairs-gps' }} />

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

      <Button title="Save" containerStyle={styles.button} onPress={()=>saveLocation(loc._id,name,address,coords,notes,stars,tags,listId)}/>

      {loc._id && <Button onPress={()=>handleDeleteLocation(loc._id)} title='Delete' />} 
    </ScrollView>
  )
};

LocationEditScreen.navigationOptions = ({navigation}) => {
  const placeName = navigation.getParam('placeName');
  return {
    title: placeName,
    headerRight: ()=><View style={{paddingRight:20}} ><Icon name='trash-can-outline' type='material-community' size={30} color='rgb(184, 3, 14)' /></View>,
    // headerRightContainerStyle: {paddingRight:'30%',width:'20%'}
  }
}

const styles = StyleSheet.create({
  disabledInput: {
    fontSize: 16,
    padding:'2%'
  },
  button: {
    width: '40%',
    alignSelf:'center',
    margin:'5%'
  }
})

export default LocationEditScreen;