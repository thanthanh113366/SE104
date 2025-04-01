const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let db;

try {
  // Get environment variables
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_DATABASE_URL,
    FIREBASE_SERVICE_ACCOUNT
  } = process.env;

  // Initialize Firebase Admin SDK
  let firebaseConfig;

  if (FIREBASE_SERVICE_ACCOUNT && FIREBASE_SERVICE_ACCOUNT.trim() !== '') {
    console.log('Using Firebase service account from environment variable');
    try {
      const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
      firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: FIREBASE_DATABASE_URL
      };
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error.message);
      throw new Error('Failed to parse private key: ' + error.message + '. Please make sure your FIREBASE_SERVICE_ACCOUNT environment variable is properly set');
    }
  } else {
    console.log('Using fallback initialization for development');
    // Initialize without service account for local development
    firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID
    };
  }

  // Initialize the app
  if (!admin.apps.length) {
    admin.initializeApp(firebaseConfig);
  }

  // Get Firestore instance
  db = admin.firestore();

} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.log('Using fallback initialization for development');
  
  // Initialize without service account for local development as fallback
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }
  
  db = admin.firestore();
}

module.exports = { admin, db }; 