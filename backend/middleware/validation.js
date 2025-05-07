const { validationResult } = require('express-validator');

/**
 * Middleware xử lý kết quả validation
 * @param {Array} validations - Mảng các validation rule
 * @returns {Function} Middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    next();
  };
};

/**
 * Validation rules cho user
 */
const userValidation = {
  register: [
    {
      field: 'email',
      rules: [
        { type: 'notEmpty', message: 'Email không được để trống' },
        { type: 'isEmail', message: 'Email không hợp lệ' }
      ]
    },
    {
      field: 'password',
      rules: [
        { type: 'notEmpty', message: 'Mật khẩu không được để trống' },
        { type: 'isLength', options: { min: 6 }, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
      ]
    },
    {
      field: 'displayName',
      rules: [
        { type: 'notEmpty', message: 'Tên hiển thị không được để trống' },
        { type: 'isLength', options: { min: 2, max: 50 }, message: 'Tên hiển thị phải từ 2-50 ký tự' }
      ]
    }
  ],
  updateProfile: [
    {
      field: 'displayName',
      rules: [
        { type: 'optional' },
        { type: 'isLength', options: { min: 2, max: 50 }, message: 'Tên hiển thị phải từ 2-50 ký tự' }
      ]
    },
    {
      field: 'phone',
      rules: [
        { type: 'optional' },
        { type: 'isMobilePhone', options: ['vi-VN'], message: 'Số điện thoại không hợp lệ' }
      ]
    }
  ]
};

/**
 * Validation rules cho court
 */
const courtValidation = {
  create: [
    {
      field: 'name',
      rules: [
        { type: 'notEmpty', message: 'Tên sân không được để trống' },
        { type: 'isLength', options: { min: 2, max: 100 }, message: 'Tên sân phải từ 2-100 ký tự' }
      ]
    },
    {
      field: 'address',
      rules: [
        { type: 'notEmpty', message: 'Địa chỉ không được để trống' }
      ]
    },
    {
      field: 'price',
      rules: [
        { type: 'notEmpty', message: 'Giá không được để trống' },
        { type: 'isNumeric', message: 'Giá phải là số' },
        { type: 'isFloat', options: { min: 0 }, message: 'Giá phải lớn hơn 0' }
      ]
    }
  ],
  update: [
    {
      field: 'name',
      rules: [
        { type: 'optional' },
        { type: 'isLength', options: { min: 2, max: 100 }, message: 'Tên sân phải từ 2-100 ký tự' }
      ]
    },
    {
      field: 'price',
      rules: [
        { type: 'optional' },
        { type: 'isNumeric', message: 'Giá phải là số' },
        { type: 'isFloat', options: { min: 0 }, message: 'Giá phải lớn hơn 0' }
      ]
    }
  ]
};

/**
 * Validation rules cho booking
 */
const bookingValidation = {
  create: [
    {
      field: 'courtId',
      rules: [
        { type: 'notEmpty', message: 'ID sân không được để trống' },
        { type: 'isMongoId', message: 'ID sân không hợp lệ' }
      ]
    },
    {
      field: 'date',
      rules: [
        { type: 'notEmpty', message: 'Ngày đặt không được để trống' },
        { type: 'isDate', message: 'Ngày đặt không hợp lệ' }
      ]
    },
    {
      field: 'timeSlot',
      rules: [
        { type: 'notEmpty', message: 'Khung giờ không được để trống' },
        { type: 'isIn', options: { values: ['morning', 'afternoon', 'evening'] }, message: 'Khung giờ không hợp lệ' }
      ]
    }
  ]
};

/**
 * Validation rules cho review
 */
const reviewValidation = {
  create: [
    {
      field: 'courtId',
      rules: [
        { type: 'notEmpty', message: 'ID sân không được để trống' },
        { type: 'isMongoId', message: 'ID sân không hợp lệ' }
      ]
    },
    {
      field: 'rating',
      rules: [
        { type: 'notEmpty', message: 'Đánh giá không được để trống' },
        { type: 'isInt', options: { min: 1, max: 5 }, message: 'Đánh giá phải từ 1-5' }
      ]
    },
    {
      field: 'comment',
      rules: [
        { type: 'notEmpty', message: 'Bình luận không được để trống' },
        { type: 'isLength', options: { min: 10, max: 500 }, message: 'Bình luận phải từ 10-500 ký tự' }
      ]
    }
  ]
};

module.exports = {
  validate,
  userValidation,
  courtValidation,
  bookingValidation,
  reviewValidation
}; 