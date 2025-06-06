const crypto = require('crypto-js');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * MoMo Payment Service
 * Handles all MoMo payment integration
 */
class MoMoService {
  constructor() {
    // MoMo Sandbox Configuration
    this.partnerCode = process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529";
    this.accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j";
    this.secretKey = process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
    this.endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";
    this.returnUrl = process.env.MOMO_RETURN_URL || "http://localhost:3000/payment/return";
    this.notifyUrl = process.env.MOMO_NOTIFY_URL || "http://localhost:5000/api/payments/momo/callback";
  }

  /**
   * Tạo chữ ký cho request MoMo
   */
  createSignature(data) {
    const rawSignature = [
      'accessKey=' + this.accessKey,
      'amount=' + data.amount,
      'extraData=' + data.extraData,
      'ipnUrl=' + data.notifyUrl,
      'orderId=' + data.orderId,
      'orderInfo=' + data.orderInfo,
      'partnerCode=' + this.partnerCode,
      'redirectUrl=' + data.returnUrl,
      'requestId=' + data.requestId,
      'requestType=' + data.requestType
    ].join('&');

    console.log('MoMo Raw Signature:', rawSignature);
    const signature = crypto.HmacSHA256(rawSignature, this.secretKey).toString();
    console.log('MoMo Signature:', signature);
    return signature;
  }

  /**
   * Tạo payment request tới MoMo
   */
  async createPayment(bookingData) {
    try {
      const requestId = uuidv4();
      const orderId = `BOOKING_${bookingData.bookingId}_${Date.now()}`;

      const paymentData = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId: requestId,
        amount: Math.round(bookingData.amount), // MoMo requires integer
        orderId: orderId,
        orderInfo: `Thanh toán đặt sân ${bookingData.courtName} - ${bookingData.date}`,
        redirectUrl: this.returnUrl,
        ipnUrl: this.notifyUrl,
        extraData: JSON.stringify({
          bookingId: bookingData.bookingId,
          userId: bookingData.userId,
          courtId: bookingData.courtId
        }),
        requestType: 'captureWallet'
      };

      // Tạo chữ ký
      const signature = this.createSignature({
        amount: paymentData.amount,
        extraData: paymentData.extraData,
        notifyUrl: paymentData.ipnUrl,
        orderId: paymentData.orderId,
        orderInfo: paymentData.orderInfo,
        returnUrl: paymentData.redirectUrl,
        requestId: paymentData.requestId,
        requestType: paymentData.requestType
      });

      paymentData.signature = signature;

      console.log('MoMo Payment Request:', paymentData);
      console.log('Using returnUrl:', this.returnUrl);

      // Gửi request tới MoMo
      const response = await axios.post(this.endpoint, paymentData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('MoMo Payment Response:', response.data);

      if (response.data.resultCode === 0) {
        return {
          success: true,
          payUrl: response.data.payUrl,
          orderId: orderId,
          requestId: requestId,
          qrCodeUrl: response.data.qrCodeUrl
        };
      } else {
        return {
          success: false,
          message: response.data.message,
          resultCode: response.data.resultCode
        };
      }
    } catch (error) {
      console.error('MoMo Create Payment Error:', error);
      throw error;
    }
  }

  /**
   * Xác thực callback từ MoMo
   */
  verifyCallback(callbackData) {
    try {
      const {
        partnerCode, orderId, requestId, amount, orderInfo,
        orderType, transId, resultCode, message, payType,
        responseTime, extraData, signature
      } = callbackData;

      // Tạo raw signature để verify
      const rawSignature = [
        'accessKey=' + this.accessKey,
        'amount=' + amount,
        'extraData=' + extraData,
        'message=' + message,
        'orderId=' + orderId,
        'orderInfo=' + orderInfo,
        'orderType=' + orderType,
        'partnerCode=' + partnerCode,
        'payType=' + payType,
        'requestId=' + requestId,
        'responseTime=' + responseTime,
        'resultCode=' + resultCode,
        'transId=' + transId
      ].join('&');

      const expectedSignature = crypto.HmacSHA256(rawSignature, this.secretKey).toString();

      console.log('MoMo Callback Raw Signature:', rawSignature);
      console.log('MoMo Expected Signature:', expectedSignature);
      console.log('MoMo Received Signature:', signature);

      return expectedSignature === signature;
    } catch (error) {
      console.error('MoMo Verify Callback Error:', error);
      return false;
    }
  }

  /**
   * Kiểm tra trạng thái giao dịch
   */
  async checkTransactionStatus(orderId, requestId) {
    try {
      const checkData = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId: requestId,
        orderId: orderId,
        lang: 'vi'
      };

      const rawSignature = [
        'accessKey=' + this.accessKey,
        'orderId=' + orderId,
        'partnerCode=' + this.partnerCode,
        'requestId=' + requestId
      ].join('&');

      checkData.signature = crypto.HmacSHA256(rawSignature, this.secretKey).toString();

      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        checkData
      );

      return response.data;
    } catch (error) {
      console.error('MoMo Check Status Error:', error);
      throw error;
    }
  }
}

module.exports = new MoMoService(); 