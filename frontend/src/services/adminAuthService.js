/**
 * Admin Authentication Service
 * Separate from customer auth — admin accounts live in the 'admins' Firestore collection.
 * Admin signup requires a secret registration code to prevent unauthorized creation.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const ADMIN_REGISTRATION_CODE = 'BREAKTIME-ADMIN-2026';

/**
 * Sign up a new admin account
 * Requires a valid registration code.
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @param {string} code
 * @returns {Object} The registered user object
 */
export async function signUpAdmin(email, password, name, code) {
  if (code !== ADMIN_REGISTRATION_CODE) {
    throw new Error('Invalid admin registration code.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, 'admins', user.uid), {
    uid: user.uid,
    name,
    email,
    role: 'admin',
    createdAt: serverTimestamp()
  });

  return user;
}

/**
 * Log in as the single admin
 * Signs in via Firebase Auth, then verifies the user exists in 'admins' collection.
 * Auto-creates the single admin account if it does not exist yet.
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} The signed-in user object
 */
export async function loginAdmin(email, password) {
  const ADMIN_EMAIL = 'admin@breaktime.com';
  const ADMIN_PASS = 'admin@123';

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    try {
      // Try to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verify this user is actually an admin in the database
      const isAdmin = await checkIsAdmin(user.uid);
      if (!isAdmin) {
        // Just in case it's missing from the collection
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          name: 'Admin',
          email,
          role: 'admin',
          createdAt: serverTimestamp()
        });
      }
      return user;
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
         // Create the single admin user if they don't exist yet
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         const user = userCredential.user;
         
         await updateProfile(user, { displayName: 'Admin' });
         
         await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            name: 'Admin',
            email,
            role: 'admin',
            createdAt: serverTimestamp()
         });
         return user;
      }
      throw err;
    }
  }
  
  throw new Error('Invalid admin credentials.');
}

/**
 * Log out the current admin
 */
export async function logoutAdmin() {
  await signOut(auth);
}

/**
 * Check if a user ID exists in the 'admins' collection
 * @param {string} uid 
 * @returns {boolean}
 */
export async function checkIsAdmin(uid) {
  if (!uid) return false;
  const docSnap = await getDoc(doc(db, 'admins', uid));
  return docSnap.exists();
}

/**
 * Get admin profile data from Firestore
 * @param {string} uid 
 * @returns {Object|null}
 */
export async function getAdminProfile(uid) {
  const docSnap = await getDoc(doc(db, 'admins', uid));
  return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Listen to Firebase Auth state changes (for admin context)
 * @param {Function} callback 
 * @returns {Function} Unsubscribe function
 */
export function onAdminAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
