# Tracks App

With this react-native app, users can record and save their location as  tracks on a map. Tracks can be displayed later and are associated with a user account.        

Snack Online IDE: https://snack.expo.io/@miguelniblock/github.com-miguelniblock-rn-tracks-app

Front end app for [RN-Tracks-Server](https://github.com/MiguelNiblock/RN-Tracks-Server)

## Features

- User signup & signin authentication via Express.js API.
- Record device location and display track on map.
- Name a track and save to a list of tracks.
- Select a previously-saved track in order to display again on a map.

## Technical Specifications

- Various kinds of navigators and context/providers used.
- Authentication token is stored in AsyncStorage.
- Custom hooks.
- Mock_location script for testing purposes.
- Data for users and tracks stored in MongoDB atlas.
- Mongoose used by RN-Tracks-Server to interface with DB.