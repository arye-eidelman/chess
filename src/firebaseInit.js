// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVudiKQ_8S6gdaeWliNztjduu_r6ufV9U",
  authDomain: "chess-f7a64.firebaseapp.com",
  databaseURL: "https://chess-f7a64-default-rtdb.firebaseio.com/",
  projectId: "chess-f7a64",
  storageBucket: "chess-f7a64.appspot.com",
  messagingSenderId: "588621177659",
  appId: "1:588621177659:web:59fafb19c5b5fc75174d1e",
  measurementId: "G-BE3DS7Y8TS"
};

initializeApp(firebaseConfig);

// sign in anonymously
const auth = getAuth()
signInAnonymously(auth)
  .then(() => {
    console.log('signed in anonymously');
  })
  .catch((error) => {
    console.error('error signing in anonymously', error);
    // const errorCode = error.code;
    // const errorMessage = error.message;
    // ...
  });