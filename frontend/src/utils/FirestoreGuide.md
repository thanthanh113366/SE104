# Hướng dẫn kết nối Firebase Firestore

## Bước 1: Kích hoạt Firestore trong Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn dự án của bạn: `se104-85ce1`
3. Trong menu bên trái, chọn **Firestore Database**
4. Nếu chưa tạo database, nhấn **Create database**
5. Chọn vị trí gần khu vực của bạn (ví dụ: `asia-southeast1`)
6. Bắt đầu ở **test mode** để dễ phát triển (sau này có thể thay đổi)

## Bước 2: Thiết lập Firestore Rules

1. Trong Firestore Database, chọn tab **Rules**
2. Cập nhật rules để cho phép đọc/ghi khi người dùng đã đăng nhập:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Nhấn **Publish**

## Bước 3: Tạo Collections và Documents mẫu

Bạn có thể tạo dữ liệu mẫu trên Firebase Console:

1. Trong Firestore Database, chọn **Start collection**
2. Tạo collection `users` để lưu thông tin người dùng
3. Tạo collection `courts` để lưu thông tin sân thể thao
4. Tạo collection `bookings` để lưu thông tin đặt sân

## Bước 4: Sử dụng Firestore trong React Component

### Đọc dữ liệu từ Firestore:

```jsx
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Trong component React
const fetchCourts = async () => {
  try {
    const courtsCollection = collection(db, 'courts');
    const querySnapshot = await getDocs(courtsCollection);
    
    const courts = [];
    querySnapshot.forEach((doc) => {
      courts.push({ id: doc.id, ...doc.data() });
    });
    
    setCourts(courts); // Lưu vào state
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sân:", error);
  }
};
```

### Đọc dữ liệu với điều kiện:

```jsx
const fetchAvailableCourts = async (sportType) => {
  try {
    const courtsRef = collection(db, 'courts');
    const q = query(courtsRef, where("sport", "==", sportType), where("isAvailable", "==", true));
    const querySnapshot = await getDocs(q);
    
    const availableCourts = [];
    querySnapshot.forEach((doc) => {
      availableCourts.push({ id: doc.id, ...doc.data() });
    });
    
    return availableCourts;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sân:", error);
    return [];
  }
};
```

### Lấy một document cụ thể:

```jsx
import { doc, getDoc } from 'firebase/firestore';

const fetchCourtDetails = async (courtId) => {
  try {
    const courtRef = doc(db, 'courts', courtId);
    const courtSnap = await getDoc(courtRef);
    
    if (courtSnap.exists()) {
      return { id: courtSnap.id, ...courtSnap.data() };
    } else {
      console.log("Không tìm thấy sân!");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sân:", error);
    return null;
  }
};
```

### Thêm dữ liệu mới:

```jsx
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const addBooking = async (bookingData) => {
  try {
    const bookingWithTimestamp = {
      ...bookingData,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'bookings'), bookingWithTimestamp);
    console.log("Đã tạo đặt sân với ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Lỗi khi tạo đặt sân:", error);
    return null;
  }
};
```

### Cập nhật dữ liệu:

```jsx
import { doc, updateDoc } from 'firebase/firestore';

const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    console.log("Đã cập nhật trạng thái đặt sân");
    return true;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    return false;
  }
};
```

### Xóa dữ liệu:

```jsx
import { doc, deleteDoc } from 'firebase/firestore';

const cancelBooking = async (bookingId) => {
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
    console.log("Đã hủy đặt sân");
    return true;
  } catch (error) {
    console.error("Lỗi khi hủy đặt sân:", error);
    return false;
  }
};
```

## Cấu trúc dữ liệu đề xuất

### Collection `users`:
```
{
  uid: "user123",
  email: "user@example.com",
  displayName: "Nguyễn Văn A",
  role: "renter",  // hoặc "owner"
  createdAt: timestamp,
  phone: "0901234567",
  photoURL: "https://example.com/photo.jpg"
}
```

### Collection `courts`:
```
{
  ownerId: "owner123",
  name: "Sân bóng đá XYZ",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  description: "Sân cỏ nhân tạo chất lượng cao",
  sport: "football",  // football, basketball, tennis, etc.
  price: 300000,  // VND/giờ
  images: ["url1", "url2"],
  facilities: ["Phòng thay đồ", "Chỗ để xe", "Nước uống"],
  openTime: "06:00",
  closeTime: "22:00",
  isAvailable: true,
  rating: 4.5,
  location: {
    latitude: 10.7769,
    longitude: 106.7009
  }
}
```

### Collection `bookings`:
```
{
  userId: "user123",
  courtId: "court123",
  date: "2023-05-15",
  startTime: "18:00",
  endTime: "20:00",
  totalPrice: 600000,
  status: "confirmed",  // pending, confirmed, completed, cancelled
  createdAt: timestamp,
  paymentStatus: "paid",  // pending, paid
  notes: "Đặt sân cho 10 người"
}
```

## Xử lý lỗi phổ biến

### 1. Lỗi "Missing or insufficient permissions"
- **Nguyên nhân:** Firestore rules đang chặn quyền truy cập
- **Giải pháp:** Kiểm tra và cập nhật Firestore rules, đảm bảo người dùng đã đăng nhập

### 2. Lỗi "Failed to get document because the client is offline"
- **Nguyên nhân:** Mất kết nối internet
- **Giải pháp:** Thêm xử lý offline và thử lại khi có kết nối

### 3. Lỗi "Quota exceeded"
- **Nguyên nhân:** Vượt quá giới hạn Firestore free tier
- **Giải pháp:** Tối ưu hóa truy vấn hoặc nâng cấp lên gói trả phí

### 4. Lỗi "Document does not exist"
- **Nguyên nhân:** Truy cập vào document không tồn tại
- **Giải pháp:** Luôn kiểm tra tồn tại document trước khi truy cập 