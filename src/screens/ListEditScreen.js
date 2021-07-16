import React,{useState,useContext,useEffect} from 'react';
import {ScrollView, View, TouchableOpacity,StyleSheet,Dimensions} from 'react-native';
import {ListItem, Input, Text, Button, CheckBox, Overlay, Chip, Icon} from 'react-native-elements';
import { TriangleColorPicker, toHsv, fromHsv } from 'react-native-color-picker'
import {Context as ListContext} from '../context/ListContext';
import {Context as ListQueueContext} from '../context/ListQueueContext';
import {Context as LocationContext} from '../context/LocationContext';
import {Context as LocationQueueContext} from '../context/LocationQueueContext';
import iconNames from '../hooks/iconNames';

const ListEditScreen = ({navigation})=>{

  const {createList,editList,deleteList,state:lists} = useContext(ListContext);
  const {listCreateQueue,listUpdateQueue,listDeleteQueue} = useContext(ListQueueContext);
  const {deleteLocation,state:locations} = useContext(LocationContext);
  const {locationDeleteQueue} = useContext(LocationQueueContext);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [listName,setListName] = useState('');
  const [listColor,setListColor] = useState('rgba(0,0,0,1)');
  const [listIcon,setListIcon] = useState('map-marker');
  const [error,setError] = useState(null);

  const list = navigation.getParam('list');

  useEffect(()=>{
    navigation.setParams({handleDeleteList});
    if (list?._id){
      // console.log('list in useEffect:',list);
      setListName(list.name);
      setListColor(list.color);
      setListIcon(list.icon);
    };
  },[]);

  const validate = (inputs) => {
    let errorMsg = '';
    Object.keys(inputs).forEach( (field) => {
      switch(field) {
        case 'name': if (inputs[field].length === 0) {
          errorMsg += 'List name is required\n'
        }
      }
    })
    return errorMsg
  }

  const saveList = (name,color,icon)=>{
    // console.log('list in saveList before ifListId:',list);
    setError(null);
    const validationErrors = validate({name});
    if (!validationErrors){
      if(list?._id) { editList( {...list,name,color,icon}, listUpdateQueue ) }
      else {createList(name,color,icon,listCreateQueue)};
    } else {setError(validationErrors)}
  };

  const deleteLocsByListId = (listId,locations,deleteLoc,queueDeletion) => {
    const locsToDelete = locations.filter((item)=>item.listId === listId);
    locsToDelete.forEach((item)=>deleteLoc(item,queueDeletion))
  };

  const handleDeleteList = () => {
    deleteList(list,listDeleteQueue);
    deleteLocsByListId(list._id,locations,deleteLocation,locationDeleteQueue);
    navigation.goBack();
  };

  const toggleColorPicker = ()=>setShowColorPicker(!showColorPicker);
  const toggleIconPicker = ()=>setShowIconPicker(!showIconPicker);

  return (
    <ScrollView>
      <Input 
        label="List Name *" 
        value={listName} 
        onChangeText={setListName} 
        multiline={true} 
        leftIcon={{ type:'material-community', name:'format-list-bulleted-type' }} 
        disabled={list?._id.startsWith('default')} />

      <Input label="List Marker" disabled leftIconContainerStyle={styles.markerIconBox}
        leftIcon={
          { type:'material-community', name:listIcon, color:listColor, size:55 }
        }
        InputComponent={()=>(
          <>
          <Chip title='Color' type='outline' containerStyle={styles.chipBox} buttonStyle={styles.chipButton} onPress={toggleColorPicker}
            icon={{
              name:'palette',
              type:'material-community'
            }}
          />
          <Chip title='Icon' type='outline' containerStyle={styles.chipBox} buttonStyle={styles.chipButton} onPress={toggleIconPicker}
            icon={{
              name:'map-marker-plus',
              type:'material-community'
            }}
          />
          </>
        )}
      />

      {/* <Input label="Color" value={listColor} onChangeText={setListColor} /> */}
      {/* <View style={{backgroundColor:listColor,height:50,width:50}} /> */}
      {/* <Button title="Choose List Color" onPress={toggleColorPicker} /> */}
      <Overlay isVisible={showColorPicker} onBackdropPress={toggleColorPicker} style={{}} >
        <TriangleColorPicker color={listColor} 
          onColorChange={color=>setListColor(color)}
          onColorSelected={color=>{setListColor(color);toggleColorPicker()}}
          style={styles.colorPickerBox}
        />
        <Text>{"\n"}Press the rectangle to confirm color.</Text>
      </Overlay>
      
      {/* <Icon
        name={listIcon}
        type='material-community'
        color={listColor}
        size={45}
      /> */}
      {/* <Input label="Icon" value={listIcon} onChangeText={setListIcon} /> */}
      {/* <Button title="Choose List Icon" onPress={toggleIconPicker} /> */}
      <Overlay isVisible={showIconPicker} onBackdropPress={toggleIconPicker} overlayStyle={styles.iconPickerOverlay} >
        <ScrollView contentContainerStyle={styles.iconPickerScrollContent} horizontal={true} >
          {iconNames.map((iconName)=>{
            return (
                <Icon
                  name={iconName}
                  type='material-community'
                  color={listColor}
                  size={45}
                  onPress={()=>{setListIcon(iconName);toggleIconPicker()}}
                  containerStyle={styles.iconPickerIcons}
                  key={iconName}
                />
            )
          })}
        </ScrollView>
      </Overlay>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* <Button title="Save" onPress={()=>saveList(listId,listName,listColor,listIcon)} /> */}
      <Button title="Save" containerStyle={styles.button} onPress={()=>saveList(listName,listColor,listIcon)} />
      {/* {listId && <Button title='Delete' onPress={()=>handleDeleteList(listId)} />}  */}
    </ScrollView>
  )
};

ListEditScreen.navigationOptions = ({navigation}) => {
  const listName = navigation.getParam('listName');
  const list = navigation.getParam('list');
  const handleDeleteList = navigation.getParam('handleDeleteList');
  return {
    title: listName || 'New list',
    headerRight: ()=>(
      list && !list?._id.startsWith('default') && <View style={{paddingRight:20}} >
        <Icon 
          name='trash-can-outline' 
          type='material-community' 
          size={30} color='rgb(184, 3, 14)' 
          onPress={()=>handleDeleteList()} />
      </View>
    ) ,
    // headerRightContainerStyle: {paddingRight:'30%',width:'20%'}
  }
}

const styles = StyleSheet.create({
  button: {
    width: '40%',
    alignSelf:'center',
    margin:'5%'
  },
  markerIconBox:{
    // flex:1,
    // alignContent:'center',
    // alignItems: 'center',
    height: 55
  },
  chipBox: {
    margin: 10,
    marginLeft: 5,
    marginRight:5
    // width: '35%',
    // alignItems: 'center',
    // alignContent: 'center',
  },
  chipButton: {
    width: 115,
    padding: 10
    // alignSelf: 'center',
    // alignItems: 'center',
    // alignContent: 'center'
  },
  colorPickerBox:{
    height:Dimensions.get('window').height*.6, 
    width: Dimensions.get('window').width*.8
  },
  iconPickerOverlay: {
    width: '70%',
    height: '70%',
  },
  iconPickerScrollContent:{
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  iconPickerIcons: {
    margin: 5,
  },
  error: {
    fontSize: 16,
    color: 'red',
    marginLeft: 15,
    // marginTop: 15
},
})

export default ListEditScreen;