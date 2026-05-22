import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | undefined
let db: Firestore | undefined

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}

export function getFirebaseApp(): FirebaseApp | undefined {
  if (!isFirebaseConfigured()) {
    return undefined
  }
  
  if (!app && getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else if (!app) {
    app = getApps()[0]
  }
  
  return app
}

export function getFirestoreDb(): Firestore | undefined {
  if (!isFirebaseConfigured()) {
    return undefined
  }
  
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) {
    return undefined
  }
  
  if (!db) {
    db = getFirestore(firebaseApp)
  }
  
  return db
}
