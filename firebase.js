// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBE4-gN4HpJOVG0PrymM_XvtyCmbYDFjII",
  authDomain: "iteminsight-54769.firebaseapp.com",
  projectId: "iteminsight-54769",
  storageBucket: "iteminsight-54769.appspot.com",
  messagingSenderId: "945369030609",
  appId: "1:945369030609:web:fe23d51ae34e5555678af0",
  measurementId: "G-XJJMB091EX"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseFirestore = getFirestore(firebaseApp); // Firestore'u başlatma
export const firebaseStorage = getStorage(firebaseApp);
