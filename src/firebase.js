import firebase from 'firebase/app'
import "firebase/auth"
import "firebase/database"
import "firebase/storage"

var config = {
    apiKey: "AIzaSyD2Szwvnj8ofDLwtmtzzdkeF212tIq6UK0",
    authDomain: "slack-b1d0a.firebaseapp.com",
    databaseURL: "https://slack-b1d0a.firebaseio.com",
    projectId: "slack-b1d0a",
    storageBucket: "slack-b1d0a.appspot.com",
    messagingSenderId: "532488165096"
  };
firebase.initializeApp(config);

export default firebase