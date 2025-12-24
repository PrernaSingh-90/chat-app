import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqbL2MmA3tA6ahwfepHPBGTk1vM5eR4Ac",
  authDomain: "mychatapp-d9185.firebaseapp.com",
  projectId: "mychatapp-d9185",
  storageBucket: "mychatapp-d9185.firebasestorage.app",
  messagingSenderId: "899064224780",
  appId: "1:899064224780:web:f952762acec913abe5e229",
  measurementId: "G-VF6JYVZE9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
