import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenRefreshed, setTokenRefreshed] = useState(false);

  // Hàm lấy token mới
  const getRefreshedToken = async (user) => {
    if (!user) return null;
    try {
      // Force refresh token
      const token = await user.getIdToken(true);
      setTokenRefreshed(true);
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  // Register with email and password
  const register = async (email, password, displayName, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Lưu thông tin user trực tiếp vào Firestore
      await saveUserToFirestore(user, displayName, role);
      
      // Đồng thời lưu vào API nếu có
      try {
        await saveUserToDatabase(user, displayName, role);
      } catch (apiError) {
        console.log("API error but continuing with Firestore data:", apiError);
      }
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Load user data from Firestore
      await loadUserFromFirestore(user);
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async (role) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userExists = await checkUserInFirestore(user);
      
      if (!userExists) {
        // If new user, save with role
        await saveUserToFirestore(user, user.displayName, role);
        
        // Try API but don't fail if API fails
        try {
          await saveUserToDatabase(user, user.displayName, role);
        } catch (apiError) {
          console.log("API error but continuing with Firestore data:", apiError);
        }
      } else {
        // If existing user, load their data
        await loadUserFromFirestore(user);
        
        // Update role if provided
        if (role) {
          await updateUserRole(user, role);
        }
      }
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Save user directly to Firestore
  const saveUserToFirestore = async (user, displayName, role) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        role: role || 'renter', // Default to renter if no role specified
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userRef, userData);
      setUserDetails(userData);
      
      return userData;
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
      throw error;
    }
  };
  
  // Load user data from Firestore
  const loadUserFromFirestore = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserDetails(userData);
        return userData;
      } else {
        // User not found in Firestore, create minimal record
        const minimalData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          // No role, will prompt for role selection
        };
        setUserDetails(minimalData);
        return minimalData;
      }
    } catch (error) {
      console.error('Error loading user from Firestore:', error);
      throw error;
    }
  };
  
  // Check if user exists in Firestore
  const checkUserInFirestore = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error checking user in Firestore:', error);
      return false;
    }
  };
  
  // Update user role in Firestore
  const updateUserRole = async (user, role) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { role });
      
      // Update local state
      setUserDetails(prev => {
        if (!prev) return { uid: user.uid, role };
        return { ...prev, role };
      });
      
      return true;
    } catch (error) {
      console.error('Error updating role in Firestore:', error);
      throw error;
    }
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Update user role
  const updateRole = async (role) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Bạn cần đăng nhập để thực hiện chức năng này');
      }
      
      // Update role in Firestore first - this is reliable
      await updateUserRole(auth.currentUser, role);
      
      // Then try updating via API
      try {
        // Get fresh token
        const token = await getRefreshedToken(auth.currentUser);
        
        if (token) {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/auth/role`,
            { role },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        }
      } catch (apiError) {
        console.log("API update failed but Firestore update succeeded:", apiError);
        // API error is not fatal since we've updated Firestore successfully
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  };

  // Save user to MongoDB - now optional
  const saveUserToDatabase = async (user, displayName, role) => {
    try {
      const token = await user.getIdToken();
      
      const userData = {
        firebaseUid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName || '',
        photoURL: user.photoURL || '',
        phoneNumber: user.phoneNumber || '',
        role
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error saving user to database:', error);
      throw error;
    }
  };

  // Get user details from backend - now optional
  const fetchUserDetails = async (user) => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Merge with Firestore data, prioritizing API data
      const firestoreData = await loadUserFromFirestore(user);
      const mergedData = { ...firestoreData, ...response.data };
      setUserDetails(mergedData);
      
      return mergedData;
    } catch (error) {
      console.error('Error fetching user details from API:', error);
      
      // Fall back to Firestore data
      const firestoreData = await loadUserFromFirestore(user);
      return firestoreData;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // First load from Firestore which is reliable
          await loadUserFromFirestore(user);
          
          // Then attempt to get any additional data from API
          try {
            await fetchUserDetails(user);
          } catch (apiError) {
            console.log("API error but continuing with Firestore data:", apiError);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDetails,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    updateRole,
    fetchUserDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 