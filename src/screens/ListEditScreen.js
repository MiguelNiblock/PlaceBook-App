import React,{useState,useContext,useEffect} from 'react';
import {ScrollView} from 'react-native';
import {ListItem, Input, Text, Button, CheckBox} from 'react-native-elements';
import {Context as ListContext} from '../context/ListContext';

const ListEditScreen = ({navigation})=>{
  const [listName,setListName] = useState('');
  const [listColor,setListColor] = useState('');
  const [listIcon,setListIcon] = useState('');
  const [shown,setShown] = useState(true);
  const {createList,editList,state:lists} = useContext(ListContext);

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

  return (
    <ScrollView>
      <Input label="List Name" value={listName} onChangeText={setListName} />
      <Input label="Color" value={listColor} onChangeText={setListColor} />
      <Input label="Icon" value={listIcon} onChangeText={setListIcon} />
      <CheckBox title='Shown' checked={shown} onPress={()=>setShown(!shown)} />
      <Button title="Save" onPress={()=>saveList(listId,listName,listColor,listIcon,shown)} />
    </ScrollView>
  )
};

export default ListEditScreen;