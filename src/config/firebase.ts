// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// TODO: Paste your actual Firebase config object here from Firebase Console
// Example: Copy the firebaseConfig object from Firebase Console and replace this
const firebaseConfig = {
  apiKey: "AIzaSyCowSxJ1ZDHO9g18nBKdUi4P-4CQsg-ef4",
  authDomain: "taskflow-todo-website.firebaseapp.com",
  projectId: "taskflow-todo-website",
  storageBucket: "taskflow-todo-website.firebasestorage.app",
  messagingSenderId: "1097269769609",
  appId: "1:1097269769609:web:2d4f5860218c65a52a9d58",
  measurementId: "G-Y7658GQ639"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
