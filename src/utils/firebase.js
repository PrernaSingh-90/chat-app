import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgFeHW21XfuM6E1sC-i4FDqRnPhxrwyss",
  authDomain: "social-app-d30ef.firebaseapp.com",
  projectId: "social-app-d30ef",
  storageBucket: "social-app-d30ef.firebasestorage.app",
  messagingSenderId: "677861830288",
  appId: "1:677861830288:web:c66015939bbf81fa07b215",
  measurementId: "G-W8S9EJWPWJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
 
