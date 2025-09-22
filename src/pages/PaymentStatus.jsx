import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentStatus = () => {
  const location = useLocation();
  const [status, setStatus] = useState('pending');
  const [purchaseId, setPurchaseId] = useState(location.state?.purchaseId || localStorage.getItem('pendingPurchaseId') || null);
  const [qrCode, setQrCode] = useState(null);
  const [eventName, setEventName] = useState(location.state?.eventName || localStorage.getItem('eventName') || 'Unnamed Event');
  const [ticketQuantity, setTicketQuantity] = useState(location.state?.ticketQuantity || parseInt(localStorage.getItem('ticketQuantity')) || 1);
  const [transactionRef, setTransactionRef] = useState(location.state?.trxref || localStorage.getItem('transactionRef') || 'N/A');
  const [ticketPrice, setTicketPrice] = useState(location.state?.ticketPrice || localStorage.getItem('ticketPrice') || 'N/A');
  const [loading, setLoading] = useState(false);
  const flyerRefs = useRef([]);

  const verifyPayment = async (refNo) => {
    const toastId = toast.loading('Verifying payment...');
    setLoading(true);
    console.log('Starting payment verification:', { refNo });

    try {
      if (!refNo) {
        throw new Error('Transaction reference is missing.');
      }

      let response;
      // Try GET /purchases/{refNo}/verify first
      try {
        console.log(`Calling GET verify endpoint: ${API_URL}/purchases/${refNo}/verify`);
        response = await axios.get(`${API_URL}/purchases/${refNo}/verify`, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
      } catch (getError) {
        console.warn('GET request failed, trying POST /purchases/verify:', getError.response || getError);
        // Fallback to POST /purchases/verify
        response = await axios.post(
          `${API_URL}/purchases/verify`,
          { reference: refNo },
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
      }

      console.log('Payment verification response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data) {
        const isSuccess =
          response.data.transaction?.paystack_response?.status === true ||
          response.data.message?.toLowerCase().includes('transaction verified');
        const status = isSuccess
          ? 'success'
          : response.data.transaction?.paystack_response?.data?.status || 'failed';
        setStatus(status);
        setQrCode(response.data.qr_code || null);
        setTransactionRef(response.data.transaction?.ref_no || refNo || 'N/A');
        setTicketPrice(
          response.data.transaction?.paystack_response?.data?.amount
            ? (response.data.transaction.paystack_response.data.amount / 100).toFixed(2)
            : location.state?.ticketPrice || localStorage.getItem('ticketPrice') || 'N/A'
        );
        setEventName(
          response.data.transaction?.purchase?.event?.name ||
            location.state?.eventName ||
            localStorage.getItem('eventName') || 'Unnamed Event'
        );
        setTicketQuantity(
          response.data.transaction?.purchase?.quantity
            ? parseInt(response.data.transaction.purchase.quantity)
            : location.state?.ticketQuantity || parseInt(localStorage.getItem('ticketQuantity')) || 1
        );

        toast.success(response.data.message || `Transaction ${status}`, { id: toastId });

        if (isSuccess) {
          localStorage.removeItem('pendingPurchaseId');
          localStorage.removeItem('eventName');
          localStorage.removeItem('ticketQuantity');
          localStorage.removeItem('ticketPrice');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('transactionRef');
        }
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      const errorMessage =
        err.code === 'ERR_NETWORK'
          ? 'Failed to verify payment due to network issues.'
          : err.response?.status === 404
            ? 'Verification endpoint not found. Please confirm payment status manually or contact support.'
            : err.response?.data?.message || err.message || 'Error verifying payment';
      setStatus(location.state?.status === 'success' ? 'success' : 'failed');
      toast.error(errorMessage, { id: toastId });

      if (err.response?.status === 404 && location.state?.status === 'success') {
        setQrCode(location.state?.qrCode || null);
        setTransactionRef(location.state?.trxref || refNo);
        setTicketPrice(
          location.state?.ticketPrice || (location.state?.ticketPrice / 100)?.toFixed(2) || ticketPrice
        );
        setEventName(location.state?.eventName || eventName);
        setTicketQuantity(location.state?.ticketQuantity || ticketQuantity);
        toast.info('Payment appears successful based on callback data. Please download your tickets.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trxref = params.get('trxref') || params.get('reference') || location.state?.trxref;
    const statePurchaseId = location.state?.purchaseId || localStorage.getItem('pendingPurchaseId');

    console.log('Initial state and params:', { trxref, statePurchaseId });

    setPurchaseId(statePurchaseId);
    setTransactionRef(trxref);

    if (trxref || location.state?.trxref) {
      verifyPayment(trxref || location.state?.trxref);
    } else {
      setStatus('failed');
      toast.error('Missing transaction reference. Please try again or contact support.');
    }
  }, [location]);

  const downloadIndividualTicket = async (index) => {
    if (flyerRefs.current[index] && qrCode) {
      setLoading(true);
      try {
        const canvas = await html2canvas(flyerRefs.current[index], {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `Ticket-${index + 1}-${purchaseId || 'unknown'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating ticket flyer:', error);
        const link = document.createElement('a');
        link.download = `QR-Ticket-${index + 1}-${purchaseId || 'unknown'}.png`;
        link.href = qrCode;
        link.click();
      }
      setLoading(false);
    }
  };

  const shakeAnimation = `
    @keyframes shake {
      0% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
      100% { transform: translateX(0); }
    }
    .shake {
      animation: shake 0.5s ease-in-out;
    }
  `;

  return (
    <div className="w-full bg-trdClr/15 flex items-center justify-center py-26">
      <style>{shakeAnimation}</style>
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-[90%] md:w-[55%]  mx-auto">
        {status === 'success' ? (
          <>
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">{eventName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm md:text-base text-gray-600 mb-6">
                <p>Quantity: {ticketQuantity} ticket(s)</p>
                <p>Total Price: ₦{ticketPrice}</p>
                <p>Ref: {transactionRef}</p>
              </div>
            </div>
            {qrCode && (
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 text-center">Your Tickets</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">Download each ticket individually below.</p>
                <div className="flex flex-wrap justify-center gap-6">
                  {Array.from({ length: ticketQuantity }).map((_, index) => {
                    const uniqueRef = `${transactionRef}-TKT${String(index + 1).padStart(3, '0')}`;
                    return (
                      <div
                        key={index}
                        ref={(el) => (flyerRefs.current[index] = el)}
                        className="p-4 bg-white border-2 border-tetClr/20 rounded-lg shadow-md w-full max-w-xs"
                      >
                        <div className="relative bg-gradient-to-b from-tetClr/10 to-white rounded-lg p-4">
                          <div className="absolute top-0 left-0 w-full h-8 bg-tetClr/30 rounded-t-lg"></div>
                          <h4 className="text-lg font-bold text-gray-900 mt-8 mb-3 text-center">{eventName}</h4>
                          <p className="text-sm text-gray-600 mb-2 text-center">Ticket {index + 1} of {ticketQuantity}</p>
                          <p className="text-sm text-gray-600 mb-3 text-center">Ref: {uniqueRef}</p>
                          <img
                            src={qrCode}
                            alt={`QR Code for ticket ${index + 1}`}
                            className="w-40 h-40 mx-auto border-2 border-gray-200 rounded-md mb-3"
                          />
                          <p className="text-xs text-gray-500 text-center">Scan this QR code at the event</p>
                        </div>
                        <button
                          onClick={() => downloadIndividualTicket(index)}
                          disabled={loading}
                          className="mt-4 w-full bg-tetClr text-white py-2 rounded-lg text-sm font-semibold hover:bg-tetClr/90 transition-all duration-300 disabled:opacity-50"
                        >
                          {loading ? 'Downloading...' : `Download Ticket ${index + 1}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-6 text-center">
              A confirmation email with your ticket details has been sent to your email.
            </p>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="text-center mb-8 shake">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-yellow-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Payment Pending</h1>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
                Your payment is pending. You will receive an email with the QR code once confirmed.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8 shake">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Payment Failed</h1>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto">
                Your payment could not be processed. Please try again or contact support.
              </p>
            </div>
            {localStorage.getItem('pendingPurchaseId') && (
              <Link
                to="/ticket"
                className="inline-block bg-pryClr text-white py-2 px-6 rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base mb-4"
              >
                Try Again
              </Link>
            )}
          </>
        )}
        <Link
          to="/"
          className="inline-block bg-pryClr text-white py-2 px-6 rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentStatus;