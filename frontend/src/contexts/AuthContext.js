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
      console.log("==== DEBUGGING updateUserRole START ====");
      
      if (!currentUser) {
        console.error("ERROR: currentUser không tồn tại");
        throw new Error("Người dùng chưa đăng nhập");
      }
      
      console.log(`Bắt đầu cập nhật vai trò: "${role}" cho user ID: "${currentUser.uid}"`);
      console.log("Current user object:", JSON.stringify(currentUser));
      console.log("Current userDetails:", userDetails);
      
      // Cập nhật vai trò trong Firestore
      const userRef = doc(db, "users", currentUser.uid);
      console.log("Đã tạo tham chiếu đến document:", `users/${currentUser.uid}`);
      
      try {
        await updateDoc(userRef, { role });
        console.log("✅ Đã cập nhật vai trò trong Firestore");
      } catch (updateError) {
        console.error("❌ Lỗi khi cập nhật document:", updateError);
        
        // Nếu lỗi do document không tồn tại, thử tạo mới
        if (updateError.code === 'not-found') {
          console.log("Document không tồn tại, thử tạo mới...");
          try {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Người dùng',
              createdAt: new Date().toISOString(),
              role: role,
              photoURL: currentUser.photoURL || null
            });
            console.log("✅ Đã tạo document mới với vai trò:", role);
          } catch (setError) {
            console.error("❌ Lỗi khi tạo document mới:", setError);
            throw setError;
          }
        } else {
          throw updateError;
        }
      }
      
      // Cập nhật state
      setUserDetails(prev => {
        const newDetails = { ...prev, role };
        console.log("UserDetails trước khi cập nhật:", prev);
        console.log("UserDetails sau khi cập nhật:", newDetails);
        return newDetails;
      });
      
      // Đọc lại dữ liệu từ Firestore để xác nhận
      try {
        const updatedDoc = await getDoc(userRef);
        if (updatedDoc.exists()) {
          console.log("Dữ liệu người dùng sau khi cập nhật:", updatedDoc.data());
        } else {
          console.warn("⚠️ Không thể đọc dữ liệu sau khi cập nhật, document không tồn tại");
        }
      } catch (readError) {
        console.error("❌ Lỗi khi đọc dữ liệu sau cập nhật:", readError);
      }
      
      console.log("==== DEBUGGING updateUserRole END ====");
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  // Lắng nghe sự thay đổi trạng thái xác thực
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          // Lấy thông tin chi tiết từ Firestore
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data from Firestore:", userData);
            setUserDetails(userData);
          } else {
            // Trường hợp hiếm gặp: người dùng xác thực nhưng không có trong Firestore
            console.warn("User authenticated but not found in Firestore");
            
            // Tạo document cho người dùng
            try {
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Người dùng',
                createdAt: new Date().toISOString(),
                role: null,
                photoURL: user.photoURL || null
              });
              console.log("Created new user document in Firestore");
            } catch (createError) {
              console.error("Error creating user document:", createError);
            }
            
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