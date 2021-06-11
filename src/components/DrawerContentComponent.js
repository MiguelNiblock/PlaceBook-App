//custom drawer content component. by default only the routes are shown as links
import React,{useEffect,useContext} from 'react';
import {ScrollView, FlatList, TouchableOpacity, Text} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { DrawerItems } from 'react-navigation-drawer';
import locationApi from '../api/location';
import {Context as ListContext} from '../context/ListContext';
import {ListItem,Button,CheckBox} from 'react-native-elements';
import {navigate} from '../navigationRef';

const DrawerContentComponent = (props) => {

  const {fetchLists,editList,state:lists} = useContext(ListContext);
  // console.log('lists:',lists);
  
  return (
    <ScrollView>
      <SafeAreaView
        style={{flex: 1}}
        forceInset={{ top: 'always', horizontal: 'never' }}
      >
        <Button title="Settings" onPress={()=>navigate('Account')}/>
        <Button title="Create List" onPress={()=>navigate('ListEdit',{listId:null})}/>
        <FlatList
          data={lists}
          renderItem={({item})=>{
            return (
              <>
                <TouchableOpacity
                  onPress={()=>navigate('LocationList',{listId: item._id,listName:item.name})}
                >
                  <ListItem title={item.name} />
                </TouchableOpacity>
                <Button 
                  title="Edit"
                  onPress={()=>navigate('ListEdit',{listId: item._id})}
                  buttonStyle={{width:50}}
                />
                <CheckBox title='Shown' checked={item.shown} onPress={()=>editList(item._id,item.name,item.color,item.icon,!item.shown)} />
              </>
            )
          }}
          keyExtractor={item=>item._id}
        />
        <DrawerItems {...props} />
      </SafeAreaView>
    </ScrollView>
  );
};

export default DrawerContentComponent;