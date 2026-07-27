/**
 * Firebase Configuration
 * Initializes Firebase app, Auth, and Firestore instances.
 * All other services import from here.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrZugPIRfbmku8E7zNddBv8nup1D7-Sn8",
  authDomain: "raihan-cafe.firebaseapp.com",
  projectId: "raihan-cafe",
  storageBucket: "raihan-cafe.firebasestorage.app",
  messagingSenderId: "824763763652",
  appId: "1:824763763652:web:165d9a1fe1891905483291",
  measurementId: "G-RZZFJ7X37K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;
