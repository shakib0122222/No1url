import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDpv3NaTYjrmeoN19itDACcvEpMggd72H8",
  authDomain: "url-c576f.firebaseapp.com",
  projectId: "url-c576f",
  storageBucket: "url-c576f.firebasestorage.app",
  messagingSenderId: "681639648878",
  appId: "1:681639648878:web:31d36b7e0c8031c806d07f",
  measurementId: "G-HKS96B2T7T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);