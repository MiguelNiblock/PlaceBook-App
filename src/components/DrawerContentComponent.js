//custom drawer content component. by default only the routes are shown as links
import React,{useEffect,useContext} from 'react';
import {ScrollView, FlatList, TouchableOpacity, Text } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import { DrawerItems } from 'react-navigation-drawer';
import locationApi from '../api/location';
import {Context as ListContext} from '../context/ListContext';
import {ListItem} from 'react-native-elements';
import {navigate} from '../navigationRef';

const DrawerContentComponent = (props) => {

  const {fetchLists, state} = useContext(ListContext);

  useEffect(()=>{
    fetchLists();
  },[])
  
  return (
    <ScrollView>
      <SafeAreaView
        style={{flex: 1}}
        forceInset={{ top: 'always', horizontal: 'never' }}
      >
        <DrawerItems {...props} />
        <FlatList
          data={state}
          renderItem={({item})=>{
            return (
              <TouchableOpacity
                onPress={()=>navigate('LocationList',{listId: item._id})}
              >
                <ListItem title={item.name} />
              </TouchableOpacity>
            )
          }}
          keyExtractor={item=>item._id}
        />
      </SafeAreaView>
    </ScrollView>
  );
};

export default DrawerContentComponent;