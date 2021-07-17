import React,{useEffect,useContext,useState} from 'react';
import {View, ScrollView,TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {ListItem, Input, Rating, AirbnbRating, Text, Button, Icon, BottomSheet} from 'react-native-elements';
import {navigate} from '../navigationRef'
import {Context as LocationEditContext} from '../context/LocationEditContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as ListContext} from '../context/ListContext';
import {Context as LocationQueueContext} from '../context/LocationQueueContext';

const LocationEditScreen = ({navigation}) => {

  const {state:{name,address,coords,notes,stars,tags,listId},changeName,changeAddress,changeCoords,changeNotes,changeStars,changeTags,changeListId} = 
  useContext(LocationEditContext);
  const {editLocation,createLocation,deleteLocation} = 
  useContext(LocationContext);
  const {locationCreateQueue,locationUpdateQueue,locationDeleteQueue} = 
  useContext(LocationQueueContext);
  const {state:lists} = 
  useContext(ListContext);
  const [showBottomSheet,setshowBottomSheet] = 
  useState(false);

  const [loading, setLoading] = useState(false);
  const [error,setError] = useState(null);

  const loc = navigation.getParam('loc');
  // console.log('loc:',loc);
  // console.log('lists:',lists);
  const {latitude, longitude} = loc.coords;

  useEffect(()=>{
    changeName(loc.name)
    changeAddress(loc.address)
    changeCoords(loc.coords)
    changeNotes(loc.notes)
    changeStars(loc.stars)
    changeTags(loc.tags)
    changeListId(loc.listId || lists.find(item=>item._id.startsWith('default'))._id )
    navigation.setParams({handleDeleteLocation})
  },[])

  useEffect(()=>{
    navigation.setParams({loading});
  },[loading])

  const validate = (inputs) => {
    let errorMsg = '';
    Object.keys(inputs).forEach( (field) => {
      switch(field) {
        case 'name': 
          if (inputs[field].length === 0) {
            errorMsg += 'Place name is required\n'
          }
          break
      }
    })
    return errorMsg
  }

  const saveLocation = async(locId,name,address,coords,notes,stars,tags,listId) => {
    setLoading(true);
    setError(null);
    const validationErrors = validate({name});
    if (!validationErrors){
      if (locId){//if location exists...
        const editedLoc = await editLocation(locId,name,address,coords,notes,stars,tags,listId,locationUpdateQueue);
        navigate('Map',{loc:editedLoc,hideDrawer:true,hideExplorerMarker:true});
        setLoading(false);
      } else {
        const createdLoc = await createLocation(name,address,coords,notes,stars,tags,listId,locationCreateQueue);
        // console.log('createdLoc from locEdit scr:',createdLoc);
        navigate('Map',{loc:createdLoc,hideDrawer:true,hideExplorerMarker:true});
        setLoading(false);
      }
    } else {
      setError(validationErrors)
      setLoading(false);
    }
  }

  const handleDeleteLocation = async () => {
    setLoading(true);
    await deleteLocation(loc,locationDeleteQueue);
    navigate('Map',{hideBottomSheet:true});
    setLoading(false);
  }

  const list = lists.find((item)=>item._id === listId);

  const selectList = (l)=>{changeListId(l._id);setshowBottomSheet(false)}

  return (
    <ScrollView>

      <Input label="Place Name *" value={name} onChangeText={changeName} multiline={true} leftIcon={{ type:'material-community', name:'map-marker' }} />

      <Input label="Notes" value={notes} onChangeText={changeNotes} multiline={true}  leftIcon={{ type:'material-community', name:'text' }} />

      <Input disabled label="Address" InputComponent={()=>(<Text style={styles.disabledInput} selectable numberOfLines={0} >{loc.address}</Text> )} leftIcon={{ type:'material-community', name:'map-legend' }} />

      {/* <AirbnbRating ratingCount={5} showRating={true} fractions={0} startingValue={stars} onFinishRating={changeStars}/> */}

      {/* <Input label="Tags" value={tags.join(' ')} onChangeText={changeTags} multiline={true} /> */}

      <Input disabled label="Coordinates" InputComponent={()=>(<Text style={[styles.disabledInput,{fontSize:14}]} selectable numberOfLines={0} >{[latitude,longitude].join(', ')}</Text> )} leftIcon={{ type:'material-community', name:'crosshairs-gps' }} />

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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button 
        title="Save" 
        containerStyle={styles.button} 
        onPress={()=>saveLocation(loc._id,name,address,coords,notes,stars,tags,listId)}
        loading={loading}
        disabled={loading} />

    </ScrollView>
  )
};

LocationEditScreen.navigationOptions = ({navigation}) => {
  const placeName = navigation.getParam('placeName');
  const loc = navigation.getParam('loc');
  const handleDeleteLocation = navigation.getParam('handleDeleteLocation');
  const headerLoading = navigation.getParam('loading');
  return {
    title: placeName,
    headerRight: ()=>(
      loc._id && 
      <View style={{paddingRight:20}} >
        {!headerLoading
        ? <Icon name='trash-can-outline' 
            type='material-community' 
            size={30} 
            color='rgb(184, 3, 14)' 
            onPress={()=>handleDeleteLocation()} 
            disabled={headerLoading} />
        : <ActivityIndicator color='rgb(184, 3, 14)' />}
      </View>
    ) ,
    // headerRightContainerStyle: {paddingRight:'30%',width:'20%'}
  }
}

const styles = StyleSheet.create({
  disabledInput: {
    fontSize: 16,
    padding:'2%',
    paddingRight:10
  },
  button: {
    width: '40%',
    alignSelf:'center',
    margin:'5%'
  },
  error: {
    fontSize: 16,
    color: 'red',
    marginLeft: 15,
    // marginTop: 15
},
})

export default LocationEditScreen;