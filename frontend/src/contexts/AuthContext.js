import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, Timestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
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
  const [rememberMe, setRememberMe] = useState(false);

  // Đăng ký với email và password
  const register = async (email, password, displayName, phoneNumber = null) => {
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
        phoneNumber: phoneNumber || '',
        createdAt: new Date().toISOString(),
        role: null, // sẽ được thiết lập sau
        photoURL: user.photoURL || null,
        status: 'active',
        failedLoginAttempts: 0,
        lastFailedLogin: null
      });
      
      return user;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  };

  // Đăng nhập với email và password
  const login = async (email, password, remember = false) => {
    try {
      setRememberMe(remember);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Lưu token vào localStorage/sessionStorage
      const token = await userCredential.user.getIdToken();
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Nếu đăng nhập thành công, tìm thông tin user trong Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      // Nếu user không có trong Firestore, tạo mới
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || email.split('@')[0],
          createdAt: new Date().toISOString(),
          role: null,
          photoURL: userCredential.user.photoURL || null,
          status: 'active',
          failedLoginAttempts: 0,
          lastFailedLogin: null,
          lockedUntil: null
        });
        return userCredential.user;
      }
      
      // Kiểm tra trạng thái người dùng
      const userData = userDoc.data();
      
      // Kiểm tra tài khoản bị khóa
      if (userData.status === 'inactive') {
        // Đăng xuất và báo lỗi
        await signOut(auth);
        throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
      }
      
      // Cập nhật số lần đăng nhập sai về 0
      await updateDoc(userRef, {
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null
      });
      
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  // Hàm lấy thông tin user bằng email
  const getUserByEmail = async (email) => {
    try {
      // Thêm try-catch để xử lý lỗi truy vấn Firestore
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          return null;
        }
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      } catch (firestoreError) {
        console.error("Error querying Firestore:", firestoreError);
        
        // Thử cách khác - duyệt qua tất cả users để tìm email
        // (cách này không hiệu quả nhưng có thể giúp xử lý lỗi truy vấn)
        try {
          const allUsersRef = collection(db, "users");
          const allSnapshot = await getDocs(allUsersRef);
          
          for (const doc of allSnapshot.docs) {
            const userData = doc.data();
            if (userData.email === email) {
              return { id: doc.id, ...userData };
            }
          }
          
          return null;
        } catch (fallbackError) {
          console.error("Error in fallback query:", fallbackError);
          return null;
        }
      }
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  };

  // Đăng nhập với Google
  const loginWithGoogle = async (remember = false) => {
    try {
      setRememberMe(remember);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Lưu token vào localStorage/sessionStorage
      const token = await user.getIdToken();
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
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
          photoURL: user.photoURL || null,
          status: 'active',
          failedLoginAttempts: 0
        });
      } else {
        // Kiểm tra trạng thái tài khoản
        const userData = userDoc.data();
        if (userData.status === 'inactive') {
          // Đăng xuất nếu tài khoản bị khóa
          await signOut(auth);
          throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }
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
      
      // Cập nhật vai trò trong Firestore
      const userRef = doc(db, "users", currentUser.uid);
      console.log("Đã tạo tham chiếu đến document:", `users/${currentUser.uid}`);
      
      // Kiểm tra document tồn tại hay không
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        console.log("Document không tồn tại, tạo mới...");
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || 'Người dùng',
          createdAt: new Date().toISOString(),
          role: role,
          photoURL: currentUser.photoURL || null,
          status: 'active',
          failedLoginAttempts: 0
        });
        console.log("✅ Đã tạo document mới với vai trò:", role);
      } else {
        console.log("Document tồn tại, cập nhật vai trò...");
        await updateDoc(userRef, { role });
        console.log("✅ Đã cập nhật vai trò trong Firestore");
      }
      
      // Nếu userDetails tồn tại, cập nhật local state
      if (userDetails) {
        setUserDetails({
          ...userDetails,
          role
        });
      } else {
        // Nếu userDetails chưa tồn tại, tạo mới từ document
        const updatedDoc = await getDoc(userRef);
        if (updatedDoc.exists()) {
          setUserDetails(updatedDoc.data());
          console.log("✅ Đã cập nhật userDetails từ Firestore");
        } else {
          console.error("❌ Không thể lấy document sau khi cập nhật");
        }
      }
      
      console.log("==== DEBUGGING updateUserRole END ====");
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật vai trò:", error);
      throw error;
    }
  };
  
  // Gửi email đặt lại mật khẩu
  const resetPassword = async (email) => {
    try {
      // Sử dụng Promise.race với timeout để tránh treo trang
      const sendResetEmailPromise = async () => {
        try {
          // Kiểm tra xem email có tồn tại không
          const user = await getUserByEmail(email);
          if (!user) {
            throw new Error("Không tìm thấy tài khoản với email này.");
          }
          
          // Kiểm tra trạng thái tài khoản
          if (user.status === 'inactive') {
            throw new Error("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
          }
          
          // Gửi email đặt lại mật khẩu
          await sendPasswordResetEmail(auth, email);
          return true;
        } catch (error) {
          console.error("Error in reset password process:", error);
          throw error;
        }
      };
      
      // Tạo promise với timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Thao tác hết thời gian. Vui lòng thử lại sau.")), 15000);
      });
      
      // Chạy cả hai promise và lấy kết quả từ promise nào hoàn thành trước
      return await Promise.race([sendResetEmailPromise(), timeoutPromise]);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  // Lắng nghe sự thay đổi trạng thái xác thực
  useEffect(() => {
    let isInitialMount = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      
      // Không thực hiện logic logout trong lần mount đầu tiên
      if (isInitialMount) {
        isInitialMount = false;
        setCurrentUser(user);
        
        if (user) {
          try {
            // Lưu trạng thái "Ghi nhớ đăng nhập" vào localStorage
            if (rememberMe) {
              localStorage.setItem('rememberMe', 'true');
            } else {
              // Nếu không chọn "Remember me", vẫn cho phép đăng nhập trong phiên hiện tại
              localStorage.removeItem('rememberMe');
            }
            
            // Lấy thông tin chi tiết từ Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("User data from Firestore:", userData);
              
              // Kiểm tra trạng thái tài khoản
              if (userData.status === 'inactive') {
                // Đăng xuất nếu tài khoản bị khóa
                await signOut(auth);
                setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
                setCurrentUser(null);
                setUserDetails(null);
              } else {
                setUserDetails(userData);
              }
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
                  photoURL: user.photoURL || null,
                  status: 'active',
                  failedLoginAttempts: 0
                });
                console.log("Created new user document in Firestore");

                // Lấy lại data sau khi đã tạo
                const newUserDoc = await getDoc(userRef);
                if (newUserDoc.exists()) {
                  setUserDetails(newUserDoc.data());
                } else {
                  setUserDetails(null);
                  console.error("Không thể tạo và lấy dữ liệu người dùng");
                }
              } catch (createError) {
                console.error("Error creating user document:", createError);
                setUserDetails(null);
              }
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
            setError(error.message);
            setUserDetails(null);
          }
        } else {
          setUserDetails(null);
          localStorage.removeItem('rememberMe');
        }
        
        setLoading(false);
        return;
      }
      
      // Logic cho các lần thay đổi auth state sau lần đầu tiên
      setCurrentUser(user);
      
      if (user) {
        try {
          // Lưu trạng thái "Ghi nhớ đăng nhập" vào localStorage
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          } 
          
          // Lấy thông tin chi tiết từ Firestore
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Kiểm tra trạng thái tài khoản
            if (userData.status === 'inactive') {
              // Đăng xuất nếu tài khoản bị khóa
              await signOut(auth);
              setError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
              setCurrentUser(null);
              setUserDetails(null);
            } else {
              setUserDetails(userData);
            }
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
                photoURL: user.photoURL || null,
                status: 'active',
                failedLoginAttempts: 0
              });
              console.log("Created new user document in Firestore");
              
              // Lấy lại data sau khi đã tạo
              const newUserDoc = await getDoc(userRef);
              if (newUserDoc.exists()) {
                setUserDetails(newUserDoc.data());
              } else {
                setUserDetails(null);
                console.error("Không thể tạo và lấy dữ liệu người dùng");
              }
            } catch (createError) {
              console.error("Error creating user document:", createError);
              setUserDetails(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setError(error.message);
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [rememberMe]);

  const value = {
    currentUser,
    userDetails,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUserRole,
    resetPassword,
    setRememberMe,
    rememberMe
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Đang tải...</div>}
    </AuthContext.Provider>
  );
} 