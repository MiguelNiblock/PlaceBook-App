//Allows user to enter name of track and begin/ end tracking.
import React from 'react';
import {Input, Button} from 'react-native-elements';
import Spacer from './Spacer';

const TrackForm = () => {
  return (
    <>
    <Spacer>
      <Input placeholder="Enter name"/>
    </Spacer>
    <Button title="Start Recording" />
    </>
  )
};

export default TrackForm;