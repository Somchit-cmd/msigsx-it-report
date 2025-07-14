
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJpmIi0eU0bj0iv5jgS8A1cWxrukIiOWc",
  authDomain: "msigsx-it-report.firebaseapp.com",
  projectId: "msigsx-it-report",
  storageBucket: "msigsx-it-report.firebasestorage.app",
  messagingSenderId: "380241327685",
  appId: "1:380241327685:web:569f422238c5753fde152c",
  measurementId: "G-35SZCX5GHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
