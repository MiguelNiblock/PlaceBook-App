import React,{useState,useContext,useEffect} from 'react';
import {ScrollView, View} from 'react-native';
import {ListItem, Input, Text, Button, CheckBox, Overlay} from 'react-native-elements';
import { TriangleColorPicker } from 'react-native-color-picker'
import {Context as ListContext} from '../context/ListContext';

const ListEditScreen = ({navigation})=>{

  const [listName,setListName] = useState('');
  const [listColor,setListColor] = useState('');
  const [listIcon,setListIcon] = useState('');
  const [shown,setShown] = useState(true);
  const {createList,editList,deleteList,state:lists} = useContext(ListContext);
  const [visible, setVisible] = useState(false);

  const listId = navigation.getParam('listId');

  useEffect(()=>{
    if (listId){
      const list = lists.find((item)=>item._id===listId)
      console.log('list:',list)
      setListName(list.name);
      setListColor(list.color);
      setListIcon(list.icon);
      setShown(list.shown);
    };
  },[]);

  const saveList = (listId,name,color,icon,shown)=>{
    if(listId) {editList(listId,name,color,icon,shown)}
    else {createList(name,color,icon,shown)}
  };

  const handleDeleteList = (listId) => {
    deleteList(listId);
    navigation.goBack();
  };

  const toggleOverlay = ()=>setVisible(!visible)
  return (
    <ScrollView>
      <Input label="List Name" value={listName} onChangeText={setListName} />
      {/* <Input label="Color" value={listColor} onChangeText={setListColor} /> */}
      <View style={{backgroundColor:listColor,height:50,width:50}} />
      <Button title="Pick color" onPress={toggleOverlay} />
      <Overlay isVisible={visible} onBackdropPress={toggleOverlay} style={{}} >
        <TriangleColorPicker
          onColorSelected={color=>{setListColor(color);toggleOverlay()}}
          style={{height: 400, width: 250}}
        />
        <Text>{"\n"}Press the rectangle when done.</Text>
      </Overlay>
      <Input label="Icon" value={listIcon} onChangeText={setListIcon} />
      <CheckBox title='Shown' checked={shown} onPress={()=>setShown(!shown)} />
      <Button title="Save" onPress={()=>saveList(listId,listName,listColor,listIcon,shown)} />
      {listId && <Button onPress={()=>handleDeleteList(listId)} title='Delete' />} 
    </ScrollView>
  )
};

export default ListEditScreen;