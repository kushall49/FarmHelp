import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../config/firebase';

let app;
let auth;

try {
  // Check if Firebase config is valid before initializing
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured - using placeholder config. Auth features disabled.');
  }
} catch (error: any) {
  console.warn('⚠️ Firebase initialization failed:', error.message);
}

export { app, auth };
