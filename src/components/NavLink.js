import React from 'react';
import {Text,TouchableOpacity,StyleSheet} from 'react-native';
import Spacer from './Spacer';
import {withNavigation} from 'react-navigation';

const NavLink = ({navigation, text, routeName}) => {

  return (
    <TouchableOpacity style={styles.navLink} onPress={ ()=> navigation.navigate(routeName)}>
        <Text style={styles.link}>{text}</Text>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  navLink: {
    alignSelf: 'center',
    marginTop: '6%'
  },
  link: {
    color: 'blue',
    // fontStyle: 'italic',
    
}
});

export default withNavigation(NavLink);