import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

const dbId = !firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === 'default'
  ? '(default)'
  : firebaseConfig.firestoreDatabaseId;

export const db = getFirestore(app, dbId);
export const auth = getAuth(app);

