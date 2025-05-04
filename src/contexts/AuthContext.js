import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Đăng ký với email và password
  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Cập nhật hiển thị tên
      await updateProfile(user, { displayName });
      
      // Lưu thông tin người dùng vào Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        role: null, // sẽ được thiết lập sau
        photoURL: user.photoURL || null
      });
      
      return user;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  // Đăng nhập với email và password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  // Đăng nhập với Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Kiểm tra xem người dùng đã tồn tại trong Firestore chưa
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Nếu chưa tồn tại, tạo mới
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          role: null, // sẽ được thiết lập sau
          photoURL: user.photoURL || null
        });
      }
      
      return user;
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw error;
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserDetails(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  };

  // Cập nhật vai trò người dùng
  const updateUserRole = async (role) => {
    try {
      if (!currentUser) throw new Error("Người dùng chưa đăng nhập");
      
      // Cập nhật vai trò trong Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { role });
      
      // Cập nhật state
      setUserDetails(prev => ({ ...prev, role }));
      
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  // Lắng nghe sự thay đổi trạng thái xác thực
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Lấy thông tin chi tiết từ Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          } else {
            // Trường hợp hiếm gặp: người dùng xác thực nhưng không có trong Firestore
            console.warn("User authenticated but not found in Firestore");
            setUserDetails(null);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setError(error.message);
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
    updateUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Đang tải...</div>}
    </AuthContext.Provider>
  );
} 