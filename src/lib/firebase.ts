// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuknyjUo4sjhQ9xzauqgFr_Cqxx6b7Jo8",
    authDomain: "letsride-web.firebaseapp.com",
    projectId: "letsride-web",
    storageBucket: "letsride-web.firebasestorage.app",
    messagingSenderId: "543830556048",
    appId: "1:543830556048:web:7e000a327771aeabe14715"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
