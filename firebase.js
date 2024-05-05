// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5LW811j-NPrunsS17Mh-Fx4qOaVoa0P8",
  authDomain: "iteminsight-e107f.firebaseapp.com",
  projectId: "iteminsight-e107f",
  storageBucket: "iteminsight-e107f.appspot.com",
  messagingSenderId: "1079057056267",
  appId: "1:1079057056267:web:88730a00d65aa0455cbd0e",
  measurementId: "G-N2QBJYJTZ1"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseFirestore = getFirestore(firebaseApp); // Firestore'u başlatma
export const firebaseStorage = getStorage(firebaseApp);
