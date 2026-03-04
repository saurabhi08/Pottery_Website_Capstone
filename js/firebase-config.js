/**
 * Firebase Configuration - Mumbaa Ceramic Studio
 * Uses your Pottery Project config from Firebase.
 */
var firebaseConfig = {
  apiKey: "AIzaSyAiJyAdMh2uzlmv9Xtkn8XqQaAPQ0vZyUw",
  authDomain: "pottery-project-117cd.firebaseapp.com",
  projectId: "pottery-project-117cd",
  storageBucket: "pottery-project-117cd.firebasestorage.app",
  messagingSenderId: "1094165756802",
  appId: "1:1094165756802:web:884591a5822a1151ae2d9b"
};

var app = null;
var auth = null;
var db = null;

if (typeof firebase !== 'undefined' && firebaseConfig.apiKey) {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
}
