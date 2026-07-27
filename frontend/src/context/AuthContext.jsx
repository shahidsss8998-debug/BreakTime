/**
 * Auth Context
 * Provides customer authentication state across the app.
 * Wraps Firebase onAuthStateChanged and exposes user data,
 * login/signup/logout methods.
 */
import { createContext, useState, useContext, useEffect } from 'react';
import { onAuthChange, getCustomerProfile } from '../services/authService';

const AuthContext = createContext();

/**
 * Hook to access auth context
 * @returns {{ user, userProfile, loading, isLoggedIn }}
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
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch the customer profile from Firestore
        try {
          const profile = await getCustomerProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,             // Firebase Auth user (has .uid, .email, .displayName)
    userProfile,      // Firestore profile (has .name, .email, .createdAt)
    loading,          // True during initial auth check
    isLoggedIn: !!user // Convenience boolean
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
