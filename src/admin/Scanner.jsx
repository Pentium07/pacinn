import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { BrowserQRCodeReader } from '@zxing/library';
import { FaQrcode, FaTimes, FaTrash, FaCamera } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Scanner = () => {
  const [qrData, setQrData] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [codeReader, setCodeReader] = useState(null);
  const [checkInQuantity, setCheckInQuantity] = useState(1);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Initialize ZXing code reader and get video devices
  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    setCodeReader(reader);

    // Get available video devices
    const getDevices = async () => {
      try {
        const devices = await reader.getVideoInputDevices();
        setVideoDevices(devices);
        // Prioritize back camera by checking for common labels
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') || 
          device.label.toLowerCase().includes('environment')
        ) || devices[0]; // Fallback to first device if no back camera found
        setSelectedDeviceId(backCamera?.deviceId || '');
      } catch (err) {
        console.error('Error getting video devices:', err);
      }
    };
    getDevices();

    return () => {
      reader.reset();
    };
  }, []);

  // Function to start QR code scanning
  const startScanning = async () => {
    if (!codeReader || !selectedDeviceId) return;

    setIsScanning(true);
    setError(null);

    try {
      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      const result = await codeReader.decodeFromInputVideoDevice(
        selectedDeviceId,
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

  // Function to switch camera
  const switchCamera = () => {
    if (videoDevices.length < 2) return;
    if (codeReader) codeReader.reset(); // Reset scanner before switching
    const currentIndex = videoDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setSelectedDeviceId(videoDevices[nextIndex].deviceId);
    if (isScanning) {
      // Restart scanning with the new camera
      startScanning();
    }
  };

  // Function to stop scanning
  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  // Function to clear transaction reference input and purchase details
  const clearTransactionRef = () => {
    setTransactionRef('');
    setResult(null);
    setError(null);
    setCheckInQuantity(1);
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
      else throw new Error('No authentication token found. Please log in.');

      const response = await axios.get(`${API_URL}/api/purchases/crypt/${qrCode}`, {
        headers,
        withCredentials: true,
      });

      console.log('QR validation response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        const purchaseData = response.data.data || response.data.purchase || response.data;
        if (!purchaseData?.id) throw new Error('Invalid purchase data in response');
        setResult({
          id: purchaseData.id,
          full_name: purchaseData.full_name || 'N/A',
          email: purchaseData.email || 'N/A',
          ticket_type: purchaseData.ticket_type || 'N/A',
          quantity: parseInt(purchaseData.quantity) || 0,
          checked_in_quantity: parseInt(purchaseData.checked_in_quantity) || 0,
          remaining: parseInt(purchaseData.quantity) - parseInt(purchaseData.checked_in_quantity) || 0,
          checked_in_by: purchaseData.checked_in_by || 'N/A',
          used: purchaseData.used || '0',
          checked_in_at: purchaseData.checked_in_at || null,
          event: purchaseData.event || { name: 'N/A' },
        });
        setCheckInQuantity(1);
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
            : err.response?.data?.message || err.message || 'Failed to validate QR code';
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
      else throw new Error('No authentication token found. Please log in.');

      const response = await axios.get(`${API_URL}/api/purchases/ref/${transactionRef}`, {
        headers,
        withCredentials: true,
      });

      console.log('Transaction ref validation response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        const purchaseData = response.data.data || response.data.purchase || response.data;
        if (!purchaseData?.id) throw new Error('Invalid purchase data in response');
        setResult({
          id: purchaseData.id,
          full_name: purchaseData.full_name || 'N/A',
          email: purchaseData.email || 'N/A',
          ticket_type: purchaseData.ticket_type || 'N/A',
          quantity: parseInt(purchaseData.quantity) || 0,
          checked_in_quantity: parseInt(purchaseData.checked_in_quantity) || 0,
          remaining: parseInt(purchaseData.quantity) - parseInt(purchaseData.checked_in_quantity) || 0,
          checked_in_by: purchaseData.checked_in_by || 'N/A',
          used: purchaseData.used || '0',
          checked_in_at: purchaseData.checked_in_at || null,
          event: purchaseData.event || { name: 'N/A' },
        });
        setCheckInQuantity(1);
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
            : err.response?.data?.message || err.message || 'Failed to validate transaction reference';
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

    if (checkInQuantity < 1 || checkInQuantity > result.remaining) {
      setError('Invalid check-in quantity');
      toast.error('Invalid check-in quantity');
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
      else throw new Error('No authentication token found. Please log in.');

      const response = await axios.post(
        `${API_URL}/api/purchases/${result.id}/checkin`,
        { quantity: checkInQuantity },
        { headers, withCredentials: true }
      );

      console.log('Check-in response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        const purchaseData = response.data.data || response.data.purchase || response.data;
        setResult(null);
        setTransactionRef('');
        setCheckInQuantity(1);
        toast.success(response.data.message || 'Ticket checked in successfully', { id: toastId });
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
            : err.response?.data?.message || err.message || 'Failed to check in';
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
  }, [isScanning, codeReader, selectedDeviceId]);

  return (
    <div className="min-h-screen bg-trdClr/15 py-8 md:py-12 w-full">
      <div className="w-[90%] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Verify Ticket
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mx-auto">
            Scan a QR code or enter a transaction reference to check in.
          </p>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 md:p-2 lg:p-4 border-b border-secClr bg-tetClr/30">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">Scan or Enter Details</h2>
          </div>
          <div className="p-4 lg:p-4 space-y-8">
            {/* QR Scanner Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsScanning(true)}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base lg:text-lg"
                disabled={loading}
              >
                <FaQrcode className="text-base md:text-lg lg:text-xl" />
                <span>Scan QR Code</span>
              </button>
            </div>

            {/* Transaction Reference Input */}
            <div className="space-y-4">
              <label className="block text-sm md:text-base lg:text-lg font-medium text-gray-600">
                Transaction Reference
              </label>
              <div className="flex flex-col md:flex-row md:space-x-2 space-y-4 md:space-y-0">
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter transaction reference (e.g., TXN68cea2f7da4da)"
                  className="flex-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm md:text-base lg:text-lg"
                  disabled={loading}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={validateTransactionRef}
                    className="w-full md:w-auto px-3 md:px-4 py-2 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base lg:text-lg"
                    disabled={loading}
                  >
                    Validate
                  </button>
                  <button
                    onClick={clearTransactionRef}
                    className="w-full md:w-auto px-3 md:px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base lg:text-lg flex items-center justify-center"
                    disabled={loading || !transactionRef}
                  >
                    <FaTrash className="text-base md:text-lg lg:text-xl mr-1 md:mr-2" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Result and Check-in */}
            {loading && <div className="text-center text-gray-600 text-sm md:text-base lg:text-lg">Loading...</div>}
            {error && <div className="text-center text-red-500 text-sm md:text-base lg:text-lg">{error}</div>}
            {result && (
              <div className="space-y-4">
                <div className="p-1 md:p-2 lg:p-4 bg-tetClr/30 rounded-lg border border-secClr">
                  <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">Purchase Details</h3>
                  <div className="space-y-2 text-sm md:text-base lg:text-lg">
                    <p className="text-gray-600">Purchase ID: {result.id}</p>
                    <p className="text-gray-600">Full Name: {result.full_name}</p>
                    <p className="text-gray-600">Email: {result.email}</p>
                    <p className="text-gray-600">Event: {result.event?.name || 'N/A'}</p>
                    <p className="text-gray-600">Ticket Type: {result.ticket_type}</p>
                    <p className="text-gray-600">Quantity: {result.quantity}</p>
                    <p className="text-gray-600">Checked-in Quantity: {result.checked_in_quantity}</p>
                    <p className="text-gray-600">Remaining: {result.remaining}</p>
                    <p className="text-gray-600">Used: {result.used === '1' || result.used === true ? 'Yes' : 'No'}</p>
                    <p className="text-gray-600">Checked-in By: {result.checked_in_by}</p>
                    {result.checked_in_at && (
                      <p className="text-gray-600">
                        Checked-in At: {new Date(result.checked_in_at).toLocaleString()}
                      </p>
                    )}
                    {result.created_at && (
                      <p className="text-gray-600">
                        Created: {new Date(result.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                {result.remaining > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="text-sm md:text-base lg:text-lg font-medium text-gray-600">
                        Check-in Quantity:
                      </label>
                      <select
                        value={checkInQuantity}
                        onChange={(e) => setCheckInQuantity(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm md:text-base lg:text-lg"
                        disabled={loading}
                      >
                        {[...Array(result.remaining + 1).keys()].slice(1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleCheckIn}
                      className="w-full px-3 md:px-4 py-2 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base lg:text-lg"
                      disabled={loading || result.remaining === 0}
                    >
                      Check In {checkInQuantity} Ticket{checkInQuantity > 1 ? 's' : ''}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* QR Scanner Modal */}
        {isScanning && (
          <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-1 md:p-2 lg:p-4 pt-8 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-lg p-1 md:p-2 lg:p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900">Scan QR Code</h3>
                <div className="flex space-x-2">
                  {videoDevices.length > 1 && (
                    <button
                      onClick={switchCamera}
                      className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full transition-colors"
                      title="Switch Camera"
                    >
                      <FaCamera className="text-base md:text-lg lg:text-xl" />
                    </button>
                  )}
                  <button
                    onClick={stopScanning}
                    className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full transition-colors"
                  >
                    <FaTimes className="text-base md:text-lg lg:text-xl" />
                  </button>
                </div>
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