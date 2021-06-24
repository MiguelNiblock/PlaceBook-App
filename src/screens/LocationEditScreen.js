import React,{useEffect,useContext,useState} from 'react';
import {View, ScrollView,TextInput, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
// import {Context as LocationContext} from '../context/LocationContext';
import {ListItem, Input, Rating, AirbnbRating, Text, Button, Icon, BottomSheet} from 'react-native-elements';
import {navigate} from '../navigationRef'
import {Context as LocationEditContext} from '../context/LocationEditContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as ListContext} from '../context/ListContext';

const LocationEditScreen = ({navigation}) => {

  const {state:{name,address,coords,notes,listId},changeName,changeAddress,changeCoords,changeNotes,changeListId} = useContext(LocationEditContext);
  const {editLocation,createLocation,deleteLocation} = useContext(LocationContext);
  const {state:lists} = useContext(ListContext);
  const [showBottomSheet,setshowBottomSheet] = useState(false);

  const loc = navigation.getParam('loc');
  // console.log('loc:',loc)
  const {latitude, longitude} = loc.coords;

  useEffect(()=>{
    changeName(loc.name)
    changeAddress(loc.address)
    changeCoords(loc.coords)
    changeNotes(loc.notes)
    // changeStars(loc.stars)
    // changeTags(loc.tags)
    changeListId(loc.listId)
    navigation.setParams({handleDeleteLocation})
  },[])

  const saveLocation = async(locId,name,address,coords,notes,stars,tags,listId) => {
    if (locId){//if location exists...
      const editedLoc = await editLocation(locId,name,address,coords,notes,stars,tags,listId);
      navigate('Map',{loc:editedLoc,hideDrawer:true,hideExplorerMarker:true});
    } else {
      const createdLoc = await createLocation(name,address,coords,notes,stars,tags,listId);
      // console.log('createdLoc from locEdit scr:',createdLoc);
      navigate('Map',{loc:createdLoc,hideDrawer:true,hideExplorerMarker:true});
    }
  }

  const handleDeleteLocation = (locId) => {
    deleteLocation(locId);
    navigation.goBack();
  }

  const list = lists.find((item)=>item._id === listId);

  const selectList = (l)=>{changeListId(l._id);setshowBottomSheet(false)}

  return (
    <ScrollView>

      <Input label="Place Name" value={name} onChangeText={changeName} multiline={true} leftIcon={{ type:'material-community', name:'map-marker' }} />

      <Input label="Notes" value={notes} onChangeText={changeNotes} multiline={true}  leftIcon={{ type:'material-community', name:'text' }} />

      <Input disabled label="Address" InputComponent={()=>(<Text style={styles.disabledInput} selectable numberOfLines={0} >{loc.address}</Text> )} leftIcon={{ type:'material-community', name:'map-legend' }} />

      {/* <AirbnbRating ratingCount={5} showRating={true} fractions={0} startingValue={stars} onFinishRating={changeStars}/> */}

      {/* <Input label="Tags" value={tags.join(' ')} onChangeText={changeTags} multiline={true} /> */}

      <Input disabled label="Coordinates" InputComponent={()=>(<Text style={styles.disabledInput} selectable numberOfLines={0} >{[latitude,longitude].join(', ')}</Text> )} leftIcon={{ type:'material-community', name:'crosshairs-gps' }} />

      <TouchableOpacity onPress={()=>setshowBottomSheet(true)} >
      <Input disabled label="List" 
        InputComponent={()=>(
          <Text style={styles.disabledInput} >
            {list?.name || 'Choose a list'}
          </Text>
        )}
        leftIcon={{ type:'material-community', name: list?.icon || 'format-list-bulleted-type', color: list?.color || 'black' }} />
      </TouchableOpacity>

      <BottomSheet isVisible={showBottomSheet} >
        {lists.map(
          (item)=>(
            <ListItem key={item._id} bottomDivider onPress={()=>selectList(item)} activeOpacity={.9} >
              <ListItem.CheckBox checked={item._id===listId} onPress={()=>selectList(item)} />
              <Icon
                name={item.icon}
                type='material-community'
                color={item.color}
                size={30}
              />
              <ListItem.Content>
                <ListItem.Title>{item.name}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          )
        )}
        <ListItem key={'cancel'} onPress={()=>setshowBottomSheet(false)} containerStyle={{ backgroundColor: 'red' }} >
          <ListItem.Content>
            <ListItem.Title style={{color:'white'}} >Cancel</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      </BottomSheet>

      <Button title="Save" containerStyle={styles.button} onPress={()=>saveLocation(loc._id,name,address,coords,notes,stars,tags,listId)}/>

    </ScrollView>
  )
};

LocationEditScreen.navigationOptions = ({navigation}) => {
  const placeName = navigation.getParam('placeName');
  const loc = navigation.getParam('loc');
  const handleDeleteLocation = navigation.getParam('handleDeleteLocation')
  return {
    title: placeName,
    headerRight: ()=>(
      loc._id && <View style={{paddingRight:20}} ><Icon name='trash-can-outline' type='material-community' size={30} color='rgb(184, 3, 14)' onPress={()=>handleDeleteLocation(loc._id)} /></View>
    ) ,
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