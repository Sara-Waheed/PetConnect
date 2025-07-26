import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VerifyOTP = ({ onOTPSuccess, onClose, type = 'email', email, role}) => {
  const [otp, setOtp] = useState(new Array(6).fill('')); // State for six digits
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [disable, setDisable] = useState(false);
  const [timerCount, setTimerCount] = useState(30);
  const [resendAttempts, setResendAttempts] = useState(0); // Track resend attempts
  const MAX_RESEND_ATTEMPTS = 3; // Maximum allowed attempts

  useEffect(() => {
    let timer;
    if (disable && timerCount > 0) {
      timer = setInterval(() => setTimerCount((prev) => prev - 1), 1000);
    } else if (timerCount === 0) {
      setDisable(false);
    }
    return () => clearInterval(timer);
  }, [disable, timerCount]);

  const handleInputChange = (value, index) => {
    if (!/^\d$/.test(value) && value !== '') return; // Allow only digits
    const updatedOtp = [...otp];
    updatedOtp[index] = value.slice(-1); // Only keep the last digit
    setOtp(updatedOtp);

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("role in verify otp:", role);

    try {
      const otpCode = otp.join(''); // Combine digits into a single string
      const response = await axios.post('http://localhost:5000/auth/verifyEmail', {
        code: otpCode,
        type,
        role,
      });

      if (response.data.success) {
        onOTPSuccess(otpCode);
      } else {
        setMessage(response.data.message || 'Invalid OTP. Please try again!');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(
        error.response?.data?.message || 'An error occurred. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = async () => {
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      setMessageType('error');
      setMessage('Maximum OTP resend attempts reached. Please try again later.');
      return;
    }

    try {
      setDisable(true);
      setTimerCount(30);
      setResendAttempts((prev) => prev + 1); // Increment resend attempts

      let endpoint = '';
      if (type === 'email') {
        endpoint = 'http://localhost:5000/auth/resendVerificationCode';
      } else if (type === 'reset') {
        endpoint = 'http://localhost:5000/auth/resendResetOtp';
      }

      const response = await axios.post(endpoint, { email, role, });
      setMessageType('success');
      setMessage(response.data.message || 'OTP resent successfully!');
    } catch (error) {
      console.error('Error:', error);
      setMessage(
        error.response?.data?.message || 'Failed to resend OTP. Please try again later.'
      );
      setDisable(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full min-h-96 max-w-xs sm:max-w-sm md:max-w-sm px-4 sm:px-6 pt-4 sm:pt-6 relative">
        <div className="absolute top-0 left-0 w-full flex justify-end">
          <button
            onClick={onClose}
            className="w-full text-gray-600 text-2xl py-2 px-4 text-right"
          >
            &times;
          </button>
        </div>
        <div className="flex justify-center pt-10">
          <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            Verify Your Email
          </span>
        </div>
        <div>
          <div className="text-gray-800 my-8">
            <p className="mb-4">
              Enter the 6-digit code sent to your email address.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex space-x-2 justify-center text-gray-800">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleInputChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-10 h-10 text-center p-2 border border-gray-600 rounded focus:outline-none focus:border-orange-500"
                  />
                ))}
              </div>

              <button
                type="submit"
                className={`w-full p-2 text-white font-medium bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 rounded ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : type === 'email' ? 'Verify Account' : 'Reset Password'}
              </button>
            </form>
            {message && (
              <p
                className={`mt-4 ${
                  messageType === 'success' ? 'text-teal-600' : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}
          </div>

          <div className="flex flex-row  mb-12 items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
            <p>Didn't receive code?</p>{' '}
            <a
              className="flex flex-row items-center"
              style={{
                color: disable || resendAttempts >= MAX_RESEND_ATTEMPTS ? 'gray' : 'olive',
                cursor: disable || resendAttempts >= MAX_RESEND_ATTEMPTS ? 'none' : 'pointer',
                textDecorationLine: disable || resendAttempts >= MAX_RESEND_ATTEMPTS ? 'none' : 'underline',
              }}
              onClick={!disable && resendAttempts < MAX_RESEND_ATTEMPTS ? resendOTP : undefined}
            >
              {disable
                ? `Resend OTP in ${timerCount}s`
                : resendAttempts >= MAX_RESEND_ATTEMPTS
                ? 'Resend Limit Reached'
                : 'Resend OTP'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
