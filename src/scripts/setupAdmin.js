// Script để thiết lập tài khoản admin
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

console.log('Đang thiết lập tài khoản admin...');

// Import động để tương thích với Node.js
import('../utils/createAdmin.js')
  .catch(error => {
    console.error('Lỗi khi import createAdmin:', error);
    process.exit(1);
  }); 