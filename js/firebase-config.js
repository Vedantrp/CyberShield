// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, get, child, query, limitToLast, orderByKey } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// config
const firebaseConfig = {
    apiKey: "AIzaSyDtysVgrpxZ3UwqNDZhrLKoVHnnsoWvtcU",
    authDomain: "cybershield-731d2.firebaseapp.com",
    projectId: "cybershield-731d2",
    storageBucket: "cybershield-731d2.firebasestorage.app",
    messagingSenderId: "719542908856",
    appId: "1:719542908856:web:ed1b016ed1029d308c014d",
    measurementId: "G-YJSXCJ7B1W",
    databaseURL: "https://cybershield-731d2-default-rtdb.firebaseio.com" // Assuming default RTDB URL pattern
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = getAnalytics(app);

// Export db to be used in data.js
export { db, ref, push, get, child, query, limitToLast, orderByKey, analytics };
