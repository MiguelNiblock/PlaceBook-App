import React,{useEffect,useContext,useState} from 'react';
import {ScrollView, FlatList, TouchableOpacity, Text, View,SafeAreaView,StyleSheet,StatusBar,Platform,Dimensions} from 'react-native';
import {Context as ListContext} from '../context/ListContext';
import {Context as PlacesContext} from '../context/LocationContext';
import {Context as AuthContext} from '../context/AuthContext';
import {ListItem,Button,CheckBox,Icon,FAB} from 'react-native-elements';
import {navigate} from '../navigationRef';

const DrawerContentComponent = (props) => {

  const {state:lists,toggleExpandList,toggleShowList} = useContext(ListContext);
  const {state:places} = useContext(PlacesContext);
  const {state:{token}} = useContext(AuthContext);
  // console.log('lists:',lists);
  // console.log('places:',places);
  
  return (
    <SafeAreaView style={styles.container}
      // forceInset={{ top: 'always', horizontal: 'never' }}
    >
    <ScrollView>
    
      <View style={styles.topButtonsView} > 
        <Button 
          title="New List"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          onPress={()=>navigate('ListEdit')}
          type='solid' 
          icon={{name:'playlist-plus', type:'material-community', color:'white'}} />
        <Button 
          title="Settings" 
          containerStyle={styles.buttonContainer} 
          buttonStyle={[styles.button,{backgroundColor:'#8f8399'}]}
          onPress={()=>{if(token){navigate('Settings')}else{navigate('Signup')}}}
          type='solid'
          icon={{name:'cog',type:'material-community',color:'white'}} />
      </View>

      <FlatList
        data={lists}
        keyExtractor={item=>item._id}
        renderItem={ ({item:list}) => {
          return (<>
            <ListItem.Accordion containerStyle={styles.accordion} //noIcon
              isExpanded={list.expanded}
              onPress={() => toggleExpandList(list)}
              content={<>
                <ListItem.CheckBox checked={list.shown} onPress={()=>toggleShowList(list)} />
                <Icon
                  name={list.icon}
                  type='material-community'
                  color={list.color}
                  size={45} />
                <ListItem.Content numberOfLines={1} >
                  <ListItem.Title>{list.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron 
                  name='playlist-edit' 
                  type='material-community' 
                  size={25} 
                  onPress={()=>navigate('ListEdit',{list,listName:list.name})} />
              </>} 
            >
              {places.filter( place => {
                if( list._id.startsWith('default') ){
                  return place.listId.startsWith('default')
                } else { return place.listId === list._id}
              }).map((place) => (
                <ListItem containerStyle={styles.listItem} key={place._id} bottomDivider onPress={()=>navigate('Map',{hideDrawer:true, loc:place})} >
                  <ListItem.Content>
                    <ListItem.Title numberOfLines={1} >{place.name}</ListItem.Title>
                    <ListItem.Subtitle numberOfLines={1} style={styles.subtitle} >{place.address}</ListItem.Subtitle>
                  </ListItem.Content>
                  <ListItem.Chevron name='playlist-edit' type='material-community' size={23} onPress={()=>navigate('LocationEdit',{loc:place, placeName:place.name})} />
                </ListItem>
              ))}
            </ListItem.Accordion>
          </>)
        }}
      />

      {/* <DrawerItems {...props} /> */}
    
    </ScrollView>
    </SafeAreaView>
  );
}

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
  topButtonsView: {
    flexDirection:'row'
  },
  buttonContainer: {
    width:'50%',
  },
  button:{
    borderRadius: 20,
    
  }
});

export default DrawerContentComponent;