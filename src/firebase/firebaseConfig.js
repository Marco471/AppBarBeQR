// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase (seus dados)
const firebaseConfig = {
  apiKey: "AIzaSyCjjPcelpQgjd9_5P7WHCAKl6InZWfjubs",
  authDomain: "app-barbeqr.firebaseapp.com",
  projectId: "app-barbeqr",
  storageBucket: "app-barbeqr.appspot.com", // corrigido
  messagingSenderId: "598398470149",
  appId: "1:598398470149:web:06a1a9d768082b4f87746c",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Autenticação com persistência (React Native)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
const db = getFirestore(app);

export { auth, db };



