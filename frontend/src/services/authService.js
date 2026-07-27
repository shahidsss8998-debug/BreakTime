/**
 * Customer Authentication Service
 * Handles signup, login, logout, and auth state for customer accounts.
 * Customer profiles are stored in the 'users' Firestore collection.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in or Sign up with Google
 * Creates a Firestore profile if this is a new user
 * @returns {Object} The signed-in user object
 */
export async function signInWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;

  // Check if user already exists in Firestore
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  // If this is a first-time login, create their profile
  if (!docSnap.exists()) {
    await setDoc(docRef, {
      uid: user.uid,
      name: user.displayName || 'Customer',
      email: user.email,
      createdAt: serverTimestamp()
    });
  }

  return user;
}

/**
 * Sign up a new customer account
 * Creates Firebase Auth user + writes profile to 'users' collection
 * @param {string} email 
 * @param {string} password 
 * @param {string} name 
 * @returns {Object} The created user object
 */
export async function signUpCustomer(email, password, name) {
  // Create the Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update the display name on the auth profile
  await updateProfile(user, { displayName: name });

  // Write customer profile to Firestore 'users' collection
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email,
    createdAt: serverTimestamp()
  });

  return user;
}

/**
 * Log in an existing customer
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} The signed-in user object
 */
export async function loginCustomer(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Log out the current customer
 */
export async function logoutCustomer() {
  await signOut(auth);
}

/**
 * Fetch customer profile data from Firestore
 * @param {string} uid 
 * @returns {Object|null} Customer profile or null if not found
 */
export async function getCustomerProfile(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Listen to Firebase Auth state changes
 * @param {Function} callback - Called with (user) on auth state change
 * @returns {Function} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Update customer profile data in Firestore
 * @param {string} uid 
 * @param {Object} profileData 
 */
export async function updateCustomerProfile(uid, profileData) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    ...profileData,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

