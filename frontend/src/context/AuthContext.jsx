/**
 * Auth Context
 * Provides customer authentication state across the app.
 * Wraps Firebase onAuthStateChanged and exposes user data,
 * session loading state, and auth methods.
 */
import { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthChange,
  getCustomerProfile,
  loginCustomer,
  signUpCustomer,
  logoutCustomer
} from '../services/authService';

const AuthContext = createContext();

/**
 * Hook to access auth context
 * @returns {{ currentUser, user, userProfile, loading, authLoading, isLoggedIn, login, signup, logout }}
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Auth Provider component
 * Wraps the app to provide authentication state to all children.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // Firebase Auth user object
  const [userProfile, setUserProfile] = useState(null); // Firestore user profile data
  const [loading, setLoading] = useState(true);      // True while checking auth state

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          // Fetch the customer profile from Firestore
          const profile = await getCustomerProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser: user,    // Firebase Auth user object
    user,                 // Alias for backward compatibility
    userProfile,          // Firestore profile data
    loading,              // True during initial auth check
    authLoading: loading, // Alias for auth loading
    isLoggedIn: !!user,   // Convenience boolean
    login: loginCustomer,
    signup: signUpCustomer,
    logout: logoutCustomer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
