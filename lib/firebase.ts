import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDez6IfHOKgadVs0_JcCZ9rtaX4eJOfK4E",
    authDomain: "curata-api.firebaseapp.com",
    projectId: "curata-api",
    storageBucket: "curata-api.firebasestorage.app",
    messagingSenderId: "474398344459",
    appId: "1:474398344459:web:1930598096bc21f4f0ce0e",
    measurementId: "G-98BZF4QDRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };