// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
import {getFirestore} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGekz905CxyAPdaiOx3uNQDKlSX6h9ktI",
  authDomain: "to-do-list-native.firebaseapp.com",
  projectId: "to-do-list-native",
  storageBucket: "to-do-list-native.appspot.com",
  messagingSenderId: "218362722375",
  appId: "1:218362722375:web:4efa6d1bd4d61b000b1962"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);