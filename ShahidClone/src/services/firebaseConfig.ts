import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AlzaSyBS3fFr9wEzwSjWFwlM8y_4yu41ZSR_tQQ",
  authDomain: "shahidclone-c5b01.firebaseapp.com",
  projectId: "shahidclone-c5b01",
  storageBucket: "shahidclone-c5b01.appspot.com",
  messagingSenderId: "144466312443",
  appId: "1:144466312443:ios:61c4ee01fc143c4fadc45e"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// OAuth configurations
export const OAUTH_CONFIG = {
  facebookRedirectUri: "https://shahidclone-c5b01.firebaseapp.com/__/auth/handler",
  facebookAppId: "769921625431517",
};

export default app;


