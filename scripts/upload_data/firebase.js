// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");
const config = require('./env.json');

// Your web app's Firebase configuration
// const firebaseConfig = config.firebase;
const firebaseConfig = {
    apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: config.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = {
    app,
    auth,
    db,
    storage
};
