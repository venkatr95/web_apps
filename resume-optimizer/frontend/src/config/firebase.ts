import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // These would normally come from environment variables
  // For demo purposes, using placeholder values
  apiKey: "demo-api-key",
  authDomain: "resume-builder-demo.firebaseapp.com",
  projectId: "resume-builder-demo",
  storageBucket: "resume-builder-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;