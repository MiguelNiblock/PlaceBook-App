//custom drawer content component. by default only the routes are shown as links
import React,{useEffect,useContext,useState} from 'react';
import {ScrollView, FlatList, TouchableOpacity, Text, View,SafeAreaView,StyleSheet,StatusBar} from 'react-native';
import { DrawerItems } from 'react-navigation-drawer';
import locationApi from '../api/location';
import {Context as ListContext} from '../context/ListContext';
import {Context as PlacesContext} from '../context/LocationContext';
import {ListItem,Button,CheckBox,Icon} from 'react-native-elements';
import {navigate} from '../navigationRef';

const DrawerContentComponent = (props) => {

  const {toggleExpandList,toggleShowList,state:lists} = useContext(ListContext);
  const {state:places} = useContext(PlacesContext);
  // console.log('lists:',lists);
  // console.log('places:',places);
  
  return (
      <SafeAreaView style={styles.container}
        // forceInset={{ top: 'always', horizontal: 'never' }}
      >
      <ScrollView>
      
        <Button title="New List" onPress={()=>navigate('ListEdit',{listId:null})} type='solid' icon={ {name:'playlist-plus', type:'material-community', color:'white'} } />
        <FlatList
          data={lists}
          keyExtractor={item=>item._id}
          renderItem={({item:list})=>{
            return (
              <>
              <ListItem.Accordion containerStyle={styles.accordion} //noIcon
                isExpanded={list.expanded}
                onPress={() => toggleExpandList(list)}
                content={
                  <>
                    <ListItem.CheckBox checked={list.shown} onPress={()=>toggleShowList(list)} />
                    <Icon
                      name={list.icon}
                      type='material-community'
                      color={list.color}
                      size={45}
                    />
                    <ListItem.Content numberOfLines={1} >
                      <ListItem.Title>{list.name}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron name='playlist-edit' type='material-community' size={25} onPress={()=>navigate('ListEdit',{list,listName:list.name})} />
                  </>
                }
              >
                {places.filter(place=>place.listId === list._id).map((place, i) => (
                  <ListItem containerStyle={styles.listItem} key={i} bottomDivider onPress={()=>navigate('Map',{hideDrawer:true, loc:place})} >
                    <ListItem.Content>
                      <ListItem.Title numberOfLines={1} >{place.name}</ListItem.Title>
                      <ListItem.Subtitle numberOfLines={1} style={styles.subtitle} >{place.address}</ListItem.Subtitle>
                    </ListItem.Content>
                    <ListItem.Chevron name='playlist-edit' type='material-community' size={23} onPress={()=>navigate('LocationEdit',{loc:place, placeName:place.name})} />
                  </ListItem>
                ))}
              </ListItem.Accordion>


                {/* <TouchableOpacity
                  onPress={()=>navigate('LocationList',{listId: list._id,listName:list.name})}
                >
                  <ListItem title={list.name} />
                </TouchableOpacity>
                <Button 
                  title="Edit"
                  onPress={()=>navigate('ListEdit',{listId: list._id})}
                  buttonStyle={{width:50}}
                />
                <CheckBox title='Shown' checked={list.shown} onPress={()=>editList(list._id,list.name,list.color,list.icon,!list.shown)} /> */}
              </>
            )
          }}
          
        />
        {/* <DrawerItems {...props} /> */}
        <Button title="Settings" onPress={()=>navigate('Account')}/>
      
      </ScrollView>
      </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  accordion: {
    padding: 5
  },
  listItem: {
    padding: 10
  },
  subtitle: {
    fontSize: 12,
  },
});

export default DrawerContentComponent;