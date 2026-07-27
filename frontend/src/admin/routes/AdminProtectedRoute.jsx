/**
 * Admin Protected Route
 * Wraps admin routes to ensure only authenticated admins can access them.
 * Redirects to /admin/login if not authenticated or not an admin.
 */
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAdminAuthChange, checkIsAdmin } from '../../services/adminAuthService';

export default function AdminProtectedRoute({ children }) {
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    const unsubscribe = onAdminAuthChange(async (user) => {
      if (!user) {
        setAuthState('unauthenticated');
        return;
      }

      // Check if this user is in the admins collection
      try {
        const isAdmin = await checkIsAdmin(user.uid);
        setAuthState(isAdmin ? 'authenticated' : 'unauthenticated');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAuthState('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
