import React,{useState,useContext,useEffect} from 'react';
import {ScrollView} from 'react-native';
import {ListItem, Input, Text, Button} from 'react-native-elements';
import {Context as ListContext} from '../context/ListContext';

const ListEditScreen = ({navigation})=>{
  const [listName,setListName] = useState('');
  const [listColor,setListColor] = useState('');
  const [listIcon,setListIcon] = useState('');
  const {createList,editList,state:lists} = useContext(ListContext);

  const listId = navigation.getParam('listId');

  useEffect(()=>{
    if (listId){
      const list = lists.find((item)=>item._id===listId)
      setListName(list.name);
      setListColor(list.color);
      setListIcon(list.icon);
    };
  },[]);

  const saveList = (name,icon,color)=>{
    if(listId) {editList(listId,name,icon,color)}
    else {createList(name,icon,color)}
  };

  return (
    <ScrollView>
      <Input label="List Name" value={listName} onChangeText={setListName} />
      <Input label="Color" value={listColor} onChangeText={setListColor} />
      <Input label="Icon" value={listIcon} onChangeText={setListIcon} />
      <Button title="Save" onPress={()=>saveList(listName,listIcon,listColor)} />
    </ScrollView>
  )
};

export default ListEditScreen;