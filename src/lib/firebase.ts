// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARNfyhDVfxiY5vdFCRM8-Rqd7K5ZbVx-c",
  authDomain: "wedding-8e7d2.firebaseapp.com",
  projectId: "wedding-8e7d2",
  storageBucket: "wedding-8e7d2.appspot.com",
  messagingSenderId: "892873030575",
  appId: "1:892873030575:web:32da223c439be903b7cd5a"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
