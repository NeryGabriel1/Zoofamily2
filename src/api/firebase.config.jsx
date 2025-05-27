
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPjg2Jc-cOtgcDz6k7M9Ibg5JOZgRTTVo",
  authDomain: "my-zoofamily.firebaseapp.com",
  projectId: "my-zoofamily",
  storageBucket: "my-zoofamily.firebasestorage.app",
  messagingSenderId: "283890645972",
  appId: "1:283890645972:web:dd17aeff4fa8f7fb08b441"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)