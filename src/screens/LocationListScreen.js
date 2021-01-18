import React from 'react';
import {Text} from 'react-native';

const LocationListScreen = ({navigation}) => {

  const listId = navigation.getParam('listId')
  // console.log(listId)

  return <Text>{listId}</Text>;
};

export default LocationListScreen;