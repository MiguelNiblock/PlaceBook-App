import * as React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button } from 'react-native';

export default function MapScreen({navigation}) {
  return (
    <View style={styles.container}>
      <Button
        onPress={() => navigation.openDrawer()}
        title="Drawer"
      />
      <MapView style={styles.map} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 150,
  },
});
