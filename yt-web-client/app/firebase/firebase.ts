// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, signInWithPopup, GoogleAuthProvider,onAuthStateChanged,User} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLKBP1ulUZaTfPyaV2eWkHWIL9WxLLC6U",
  authDomain: "yt-clone-d7174.firebaseapp.com",
  projectId: "yt-clone-d7174", 
  appId: "1:407296678698:web:ab12be81253fbfa2d89c53",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
//signs the user in with a google popup @returns a promise that resolves with the user's credentials.
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}
//signs with user out. @returns a promise that solves when the user is signed out.
export function signOut(){
    return auth.signOut();
}

//triger a callback whtn user auth state changes. @returns a function to unsubscribe callback.

export function onAuthStateChangedHelper(callback: (user: User |null) => void){
    return onAuthStateChanged(auth, callback);
}