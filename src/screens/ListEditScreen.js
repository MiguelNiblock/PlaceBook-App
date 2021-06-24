import React,{useState,useContext,useEffect} from 'react';
import {ScrollView, View, TouchableOpacity,StyleSheet,Dimensions} from 'react-native';
import {ListItem, Input, Text, Button, CheckBox, Overlay, Chip, Icon} from 'react-native-elements';
import { TriangleColorPicker, toHsv, fromHsv } from 'react-native-color-picker'
import {Context as ListContext} from '../context/ListContext';
import iconNames from '../hooks/iconNames';

const ListEditScreen = ({navigation})=>{

  const [listName,setListName] = useState('');
  const [listColor,setListColor] = useState('rgba(0,0,0,1)');
  const [listIcon,setListIcon] = useState('map-marker');
  const {createList,editList,deleteList,state:lists} = useContext(ListContext);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const listId = navigation.getParam('listId');

  useEffect(()=>{
    if (listId){
      const list = lists.find((item)=>item._id===listId);
      // console.log('list:',list)
      setListName(list.name);
      setListColor(list.color);
      setListIcon(list.icon);
    };
  },[]);

  const saveList = (listId,name,color,icon)=>{
    if(listId) {editList(listId,name,color,icon,list.shown,list.expanded)}
    else {createList(name,color,icon)};
  };

  const handleDeleteList = (listId) => {
    deleteList(listId);
    navigation.goBack();
  };

  const toggleColorPicker = ()=>setShowColorPicker(!showColorPicker);
  const toggleIconPicker = ()=>setShowIconPicker(!showIconPicker);

  return (
    <ScrollView>
      <Input label="List Name" value={listName} onChangeText={setListName} multiline={true} leftIcon={{ type:'material-community', name:'format-list-bulleted-type' }} />

      <Input label="List Marker" disabled leftIconContainerStyle={styles.markerIconBox}
        leftIcon={
          { type:'material-community', name:listIcon || 'map-marker', color:listColor || 'black', size:55 }
        }
        InputComponent={()=>(
          <>
          <Chip title='Color' type='outline' containerStyle={styles.chipBox} buttonStyle={styles.chipButton} onPress={toggleColorPicker}
            icon={{
              name:'palette',
              type:'material-community'
            }}
          />
          <Chip title='Icon' type='outline' containerStyle={styles.chipBox} buttonStyle={styles.chipButton}
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
        <TriangleColorPicker color={toHsv(listColor)} 
          onColorChange={color=>setListColor(fromHsv(color))}
          onColorSelected={color=>{setListColor(fromHsv(color));toggleColorPicker()}}
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
      <Overlay isVisible={showIconPicker} onBackdropPress={toggleIconPicker} style={{}} >
        <ScrollView style={{width: 100}}>
          {iconNames.map((iconName)=>{
            return (
              <TouchableOpacity onPress={()=>{setListIcon(iconName);toggleIconPicker()}} >
                <Icon
                  name={iconName}
                  type='material-community'
                  color={listColor}
                  size={45}
                />
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Overlay>

      {/* <Button title="Save" onPress={()=>saveList(listId,listName,listColor,listIcon)} /> */}
      {/* {listId && <Button title='Delete' onPress={()=>handleDeleteList(listId)} />}  */}
    </ScrollView>
  )
};

const styles = StyleSheet.create({
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
    width: Dimensions.get('window').width*.8}
})

export default ListEditScreen;