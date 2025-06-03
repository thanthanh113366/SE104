/**
 * File cấu hình Firebase Admin SDK sử dụng biến môi trường
 */
const path = require('path');
const fs = require('fs');

// Debug đường dẫn .env
const envPath = path.resolve(__dirname, '../.env');
console.log('Service Account Config - Đường dẫn .env:', envPath);
console.log('Service Account Config - File .env có tồn tại không:', fs.existsSync(envPath));

// Debug: Đọc nội dung file .env
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Service Account Config - Nội dung file .env (100 ký tự đầu):');
  console.log(envContent.substring(0, 100));
  console.log('Service Account Config - Số dòng trong file .env:', envContent.split('\n').length);
} catch (error) {
  console.error('Service Account Config - Lỗi đọc file .env:', error.message);
}

require('dotenv').config({ path: envPath });

// Log tất cả biến môi trường Firebase
console.log('Service Account Config - Tất cả biến môi trường Firebase:', {
  type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
  project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key_length: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY ? process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.length : 0,
  client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID
});

// Debug private key format
if (process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY) {
  const privateKey = process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY;
  console.log('Service Account Config - Private Key Debug:');
  console.log('- Bắt đầu với:', privateKey.substring(0, 30));
  console.log('- Kết thúc với:', privateKey.substring(privateKey.length - 30));
  console.log('- Có \\n không:', privateKey.includes('\\n'));
  console.log('- Có newline thật không:', privateKey.includes('\n'));
  console.log('- Có BEGIN không:', privateKey.includes('BEGIN PRIVATE KEY'));
  console.log('- Có END không:', privateKey.includes('END PRIVATE KEY'));
}

// Log để debug
console.log('Service Account Config - Kiểm tra biến môi trường:', {
  type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
  project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL
});

const serviceAccount = {
  type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE || "service_account",
  project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID || "se104-85ce1",
  private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@se104-85ce1.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40se104-85ce1.iam.gserviceaccount.com",
  universe_domain: process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN || "googleapis.com"
};

// Kiểm tra các giá trị bắt buộc
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  console.error('Thiếu thông tin quan trọng trong service account:', {
    hasProjectId: !!serviceAccount.project_id,
    hasPrivateKey: !!serviceAccount.private_key,
    hasClientEmail: !!serviceAccount.client_email
  });
  throw new Error('Thiếu thông tin xác thực Firebase Admin SDK. Vui lòng kiểm tra file .env');
}

module.exports = serviceAccount; 