import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    "AIzaSyDJhlz8ZZ1GZPfFigBPT_eLFicpUECTqRE",
  authDomain:
    "pippinway-e9719.firebaseapp.com",
  projectId:
    "pippinway-e9719",
  storageBucket:
    "pippinway-e9719.firebasestorage.app",
  messagingSenderId:
    "573182272909",
  appId:
    "1:573182272909:web:1206b5ae5f74b4325a09c4",
  measurementId:
    "G-DY79Z04KX0",
};

const app =
  initializeApp(
    firebaseConfig
  );

export const auth =
  getAuth(app);

export const db =
  getFirestore(app);

export const storage =
  getStorage(app);

export const functions =
  getFunctions(app, "us-central1");

export default app;