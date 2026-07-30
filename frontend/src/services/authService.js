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

/**
 * Sign in or Sign up with Google
 * Creates a Firestore profile if this is a new user
 * @returns {Object} The signed-in user object
 */
export async function signInWithGoogle() {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  let userCredential;
  try {
    userCredential = await signInWithPopup(auth, googleProvider);
  } catch (popupError) {
    if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
      userCredential = await signInWithPopup(auth, googleProvider);
    } else {
      throw popupError;
    }
  }

  const user = userCredential.user;

  // Ensure customer profile exists in Firestore
  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        name: user.displayName || 'Customer',
        email: user.email || '',
        createdAt: serverTimestamp()
      });
    }
  } catch (profileErr) {
    console.warn('Profile creation warning in signInWithGoogle:', profileErr);
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
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

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
 * If profile does not exist yet (e.g. first-time Google sign-in), creates it instantly
 * @param {string} uid 
 * @param {Object} [fallbackUser] - Optional Firebase Auth user object for fallback creation
 * @returns {Object|null} Customer profile
 */
export async function getCustomerProfile(uid, fallbackUser = null) {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    if (fallbackUser) {
      const newProfile = {
        uid: fallbackUser.uid,
        name: fallbackUser.displayName || 'Customer',
        email: fallbackUser.email || '',
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }

    return null;
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    if (fallbackUser) {
      return {
        uid: fallbackUser.uid,
        name: fallbackUser.displayName || 'Customer',
        email: fallbackUser.email || ''
      };
    }
    return null;
  }
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
