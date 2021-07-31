## PlaceBook

### The app to save your life's places

PlaceBook aims to be an easy-to-use tool for bookmarking, organizing and accessing locations in a map. It is motivated by the lack of existing tools to accomplish this, and by the need being so ubiquitous. Although similar features are offered by existing apps (Like Google Maps, or other navigation apps), their interfaces prioritize other features, making it inconvenient to manage or customize saved pins. The ultimate goal of PlaceBook is to become a social media platform that revolves around places.

Expo project: https://expo.dev/@miguelniblock/PlaceBook

Play Store url: https://play.google.com/store/apps/details?id=com.miguelniblock.PlaceBook

Try the app live on expo snack: https://snack.expo.io/@miguelniblock/github.com-miguelniblock-placebook-app 


### Technology stack:

- React native front end, app available in IOS and Android
- REST API made with Express
- Heroku dyno for API server
- MongoDB Atlas for data
- CI/CD pipeline (Github -> Heroku). Builds and deploys API on push.

### Main features:

- Offline-first functionality. Places and lists can be saved offline. On sign-in, or sign-up, they'll be synced.
- On app load, automatically find and display the device's current address.
- On map long-press, find and display address.
- Save addresses to a list, and assign a name to each place.
- Customize the map marker for places in a given list. Options: Icon and color.
- Create an account and access places in other devices.
- Show/ hide all markers, per list, using the drawer menu.

### Planned features:

- Share lists of places with other users.
- Provide information about places, from public APIs like Yelp or GoogleMaps.
- Export or import account data in JSON or CSV. 
- Sharing places to other apps.
- Deeplinking. Sharing places from other apps, into PlaceBook.
- Displaying contacts' addresses.
- More interface customizations.
