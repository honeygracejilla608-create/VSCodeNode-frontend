// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCleOSnhrKnXz0TZZ-zkUXNyEen7C9vXe4",
  authDomain: "studio-7693519829-4e97b.firebaseapp.com",
  projectId: "studio-7693519829-4e97b",
  storageBucket: "studio-7693519829-4e97b.firebasestorage.app",
  messagingSenderId: "3133407941",
  appId: "1:3133407941:web:3883822caba86c856a26ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);