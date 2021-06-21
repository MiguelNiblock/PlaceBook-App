import React,{useState,useContext,useEffect} from 'react';
import {ScrollView, View, TouchableOpacity} from 'react-native';
import {ListItem, Input, Text, Button, CheckBox, Overlay} from 'react-native-elements';
import { TriangleColorPicker } from 'react-native-color-picker'
import {Context as ListContext} from '../context/ListContext';
import iconNames from '../hooks/iconNames';
import {Icon} from 'react-native-elements';

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
      console.log('list:',list)
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
      <Input label="List Name" value={listName} onChangeText={setListName} />
      {/* <Input label="Color" value={listColor} onChangeText={setListColor} /> */}
      <View style={{backgroundColor:listColor,height:50,width:50}} />
      <Button title="Choose List Color" onPress={toggleColorPicker} />
      <Overlay isVisible={showColorPicker} onBackdropPress={toggleColorPicker} style={{}} >
        <TriangleColorPicker
          onColorSelected={color=>{setListColor(color);toggleColorPicker()}}
          style={{height: 400, width: 250}}
        />
        <Text>{"\n"}Press the rectangle when done.</Text>
      </Overlay>
      
      <Icon
        name={listIcon}
        type='material-community'
        color={listColor}
        size={45}
      />
      {/* <Input label="Icon" value={listIcon} onChangeText={setListIcon} /> */}
      <Button title="Choose List Icon" onPress={toggleIconPicker} />
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

      <Button title="Save" onPress={()=>saveList(listId,listName,listColor,listIcon)} />
      {listId && <Button title='Delete' onPress={()=>handleDeleteList(listId)} />} 
    </ScrollView>
  )
};

export default ListEditScreen;