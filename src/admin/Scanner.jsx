import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BrowserQRCodeReader } from '@zxing/library';
import { FaQrcode, FaTimes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Scanner = () => {
  const [qrData, setQrData] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [codeReader, setCodeReader] = useState(null);

  // Initialize ZXing code reader
  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    setCodeReader(reader);
    return () => {
      reader.reset();
    };
  }, []);

  // Function to start QR code scanning
  const startScanning = async () => {
    if (!codeReader) return;

    setIsScanning(true);
    setError(null);

    try {
      const videoInputDevices = await codeReader.getVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      const result = await codeReader.decodeFromInputVideoDevice(
        videoInputDevices[0].deviceId,
        'qr-video'
      );
      console.log('QR code detected:', result.getText());
      setQrData(result.getText());
      setIsScanning(false);
      validateQrCode(result.getText());
    } catch (err) {
      console.error('QR scan error:', err);
      const errorMessage = err.message.includes('Permission denied')
        ? 'Camera access denied. Please allow camera permissions.'
        : 'Failed to scan QR code: ' + err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      setIsScanning(false);
    }
  };

  // Function to stop scanning
  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  // Function to validate QR code
  const validateQrCode = async (qrCode) => {
    const toastId = toast.loading('Validating QR code...');
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token for QR validation:', token ? 'Present' : 'Missing');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await axios.get(`${API_URL}/purchases/crypt/${qrCode}`, {
        headers,
        withCredentials: true,
      });

      console.log('QR validation response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        setResult(response.data.purchase); // Adjust based on Postman response structure
        toast.success('QR code validated successfully', { id: toastId });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      console.error('Error validating QR code:', err.response || err);
      const errorMessage =
        err.response?.data?.message === 'Unauthenticated'
          ? 'You are not authenticated. Please log in again.'
          : err.code === 'ERR_NETWORK'
            ? 'Failed to validate QR code due to network issues. Please contact the administrator.'
            : err.response?.data?.message || 'Failed to validate QR code';
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Function to validate transaction reference
  const validateTransactionRef = async () => {
    if (!transactionRef) {
      setError('Please enter a transaction reference');
      toast.error('Please enter a transaction reference');
      return;
    }

    const toastId = toast.loading('Validating transaction reference...');
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token for transaction ref validation:', token ? 'Present' : 'Missing');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await axios.get(`${API_URL}/purchases/ref/${transactionRef}`, {
        headers,
        withCredentials: true,
      });

      console.log('Transaction ref validation response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        setResult(response.data.purchase); // Adjust based on Postman response structure
        toast.success('Transaction reference validated successfully', { id: toastId });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      console.error('Error validating transaction ref:', err.response || err);
      const errorMessage =
        err.response?.data?.message === 'Unauthenticated'
          ? 'You are not authenticated. Please log in again.'
          : err.code === 'ERR_NETWORK'
            ? 'Failed to validate transaction reference due to network issues. Please contact the administrator.'
            : err.response?.data?.message || 'Failed to validate transaction reference';
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle check-in
  const handleCheckIn = async () => {
    if (!result?.id) {
      setError('No valid purchase data to check in');
      toast.error('No valid purchase data to check in');
      return;
    }

    const toastId = toast.loading('Checking in...');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Token for check-in:', token ? 'Present' : 'Missing');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await axios.post(`${API_URL}/purchases/${result.id}/checkin`, {}, {
        headers,
        withCredentials: true,
      });

      console.log('Check-in response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        toast.success(response.data.message || 'Ticket checked in successfully', { id: toastId });
        setResult(null);
        setQrData('');
        setTransactionRef('');
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      console.error('Error checking in:', err.response || err);
      const errorMessage =
        err.response?.data?.message === 'Unauthenticated'
          ? 'You are not authenticated. Please log in again.'
          : err.code === 'ERR_NETWORK'
            ? 'Failed to check in due to network issues. Please contact the administrator.'
            : err.response?.data?.message || 'Failed to check in';
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal and body overflow
  useEffect(() => {
    if (isScanning) {
      document.body.style.overflow = 'hidden';
      startScanning();
    } else {
      document.body.style.overflow = 'unset';
      if (codeReader) codeReader.reset();
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (codeReader) codeReader.reset();
    };
  }, [isScanning, codeReader]);

  return (
    <div className="min-h-screen bg-trdClr/15 py-12 w-full pt-28">
      <div className="w-[90%] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            QR Code & Transaction Scanner
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Scan a QR code or enter a transaction reference to validate and check in.
          </p>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-secClr bg-tetClr/30">
            <h2 className="text-xl font-semibold text-gray-900">Scan or Enter Details</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* QR Scanner Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsScanning(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                <FaQrcode className="text-lg" />
                <span>Scan QR Code</span>
              </button>
            </div>

            {/* Transaction Reference Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Transaction Reference
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter transaction reference (e.g., TXN68cd3c347a069)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pryClr focus:border-pryClr"
                  disabled={loading}
                />
                <button
                  onClick={validateTransactionRef}
                  className="px-4 py-2 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  Validate
                </button>
              </div>
            </div>

            {/* Result and Check-in */}
            {loading && <div className="text-center text-gray-600">Loading...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-tetClr/30 rounded-lg border border-secClr">
                  <h3 className="text-lg font-semibold text-gray-900">Purchase Details</h3>
                  <p className="text-sm text-gray-600">ID: {result.id}</p>
                  {result.created_at && (
                    <p className="text-sm text-gray-600">
                      Created: {new Date(result.created_at).toLocaleString()}
                    </p>
                  )}
                  {result.event?.name && (
                    <p className="text-sm text-gray-600">Event: {result.event.name}</p>
                  )}
                  {result.email && (
                    <p className="text-sm text-gray-600">Email: {result.email}</p>
                  )}
                  {result.ticket_type && (
                    <p className="text-sm text-gray-600">Ticket Type: {result.ticket_type}</p>
                  )}
                  {result.quantity && (
                    <p className="text-sm text-gray-600">Quantity: {result.quantity}</p>
                  )}
                </div>
                <button
                  onClick={handleCheckIn}
                  className="w-full px-4 py-2 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  Check In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QR Scanner Modal */}
        {isScanning && (
          <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-4 pt-8 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Scan QR Code</h3>
                <button
                  onClick={stopScanning}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                <video id="qr-video" style={{ width: '100%', height: '100%' }}></video>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;