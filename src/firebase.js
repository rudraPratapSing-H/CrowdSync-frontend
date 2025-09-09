// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqZnc4PInvjwu1znXjHPiRM3LA0lgs8j4",
  authDomain: "crowdmanagement-e36d0.firebaseapp.com",
  projectId: "crowdmanagement-e36d0",
  storageBucket: "crowdmanagement-e36d0.firebasestorage.app",
  messagingSenderId: "495969928255",
  appId: "1:495969928255:web:80d9b0589ccaa7e88e648a",
  databaseURL: "https://crowdmanagement-e36d0-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
