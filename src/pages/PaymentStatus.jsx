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
  const [purchaseId, setPurchaseId] = useState(localStorage.getItem('pendingPurchaseId') || null);
  const [qrCode, setQrCode] = useState(null);
  const [eventName, setEventName] = useState(localStorage.getItem('eventName') || 'Unnamed Event');
  const [ticketQuantity, setTicketQuantity] = useState(parseInt(localStorage.getItem('ticketQuantity')) || 1);
  const [transactionRef, setTransactionRef] = useState(localStorage.getItem('transactionRef') || 'N/A');
  const [ticketPrice, setTicketPrice] = useState(localStorage.getItem('ticketPrice') || 'N/A');
  const [loading, setLoading] = useState(false);
  const flyerRefs = useRef([]);

  const verifyPayment = async (refNo, purchaseId) => {
    const toastId = toast.loading('Verifying payment...');
    setLoading(true);
    console.log('Starting payment verification:', { refNo, purchaseId });
    try {
      const token = localStorage.getItem('token');
      console.log('Verification inputs:', { refNo, purchaseId, token: token ? 'Present' : 'Missing' });

      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      const response = await axios.get(`${API_URL}/purchases/${purchaseId}/verify`, {
        params: { ref_no: refNo },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log('Payment verification response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data) {
        const isSuccess = response.data.transaction?.paystack_response?.status === true ||
                         response.data.message?.toLowerCase().includes('transaction verified');
        const status = isSuccess ? 'success' : response.data.transaction?.paystack_response?.data?.status || 'failed';
        setStatus(status);
        setQrCode(response.data.qr_code || null);
        setTransactionRef(response.data.transaction?.ref_no || refNo || 'N/A');
        setTicketPrice(response.data.transaction?.paystack_response?.data?.amount 
          ? (response.data.transaction.paystack_response.data.amount / 100).toFixed(2) 
          : localStorage.getItem('ticketPrice') || 'N/A');
        setEventName(response.data.transaction?.event_name || localStorage.getItem('eventName') || 'Unnamed Event');
        setTicketQuantity(
          response.data.transaction?.quantity 
            ? parseInt(response.data.transaction.quantity) 
            : parseInt(localStorage.getItem('ticketQuantity')) || 1
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
        setStatus('failed');
        toast.error('Unexpected response structure', { id: toastId });
        console.error('Unexpected response:', response);
      }
    } catch (err) {
      console.error('Error verifying payment:', { error: err.response || err, stack: err.stack });
      const errorMessage =
        err.response?.data?.message === 'Unauthenticated'
          ? 'You are not authenticated. Please log in again.'
          : err.code === 'ERR_NETWORK'
            ? 'Failed to verify payment due to network issues. Please check your connection.'
            : err.response?.data?.message || err.message || 'Error verifying payment';
      setStatus('failed');
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trxref = params.get('trxref') || params.get('reference');
    console.log('URL query params:', { trxref, purchaseId });

    if (trxref && purchaseId) {
      verifyPayment(trxref, purchaseId);
    } else {
      setStatus('failed');
      const errorMessage = !trxref ? 'Missing transaction reference' : 'Missing purchase ID';
      toast.error(errorMessage);
      console.error('Verification skipped:', errorMessage);
    }
  }, [location, purchaseId]);

  const downloadIndividualTicket = async (index) => {
    if (flyerRefs.current[index] && qrCode) {
      setLoading(true);
      console.log('Starting individual ticket download:', { index, qrCode });
      try {
        const canvas = await html2canvas(flyerRefs.current[index], {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `Ticket-${index + 1}-${purchaseId || 'unknown'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log('Individual ticket downloaded:', { index });
      } catch (error) {
        console.error('Error generating individual ticket flyer:', { error, stack: error.stack });
        const link = document.createElement('a');
        link.download = `QR-Ticket-${index + 1}-${purchaseId || 'unknown'}.png`;
        link.href = qrCode;
        link.click();
        console.log('Fallback QR download triggered:', { index });
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
    <div className="min-h-screen w-full bg-gray-100 flex items-start justify-center py-8 md:pt-20">
      <style>{shakeAnimation}</style>
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 w-full md:w-[60%] lg:w-[50%] mx-auto text-center">
        {status === 'success' ? (
          <>
            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />
            <div className="mb-4">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto"
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
            <h1 className="text-base md:text-lg font-bold text-gray-900 mb-3">Payment Successful!</h1>
            <h2 className="text-sm md:text-base font-semibold text-gray-800 mb-2">Event: {eventName}</h2>
            <p className="text-gray-600 text-xs md:text-sm mb-2">Quantity: {ticketQuantity} ticket(s)</p>
            <p className="text-gray-600 text-xs md:text-sm mb-4">Total Price: ₦{ticketPrice}</p>
            {qrCode && (
              <div className="mb-4 w-full">
                <h3 className="text-xs md:text-base font-semibold text-gray-900 mb-3">Your Tickets</h3>
                <p className="text-xs text-gray-500 mb-3">Download each ticket individually below.</p>
                <div className={ticketQuantity === 1 ? 'flex justify-center w-full' : 'grid grid-cols-1 md:grid-cols-2 gap-3 w-full'}>
                  {Array.from({ length: ticketQuantity }).map((_, index) => {
                    const uniqueRef = `${transactionRef}-TKT${String(index + 1).padStart(3, '0')}`;
                    return (
                      <div
                        key={index}
                        ref={(el) => (flyerRefs.current[index] = el)}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center w-full max-w-xs mx-auto"
                      >
                        <p className="text-xs md:text-sm font-medium text-gray-700 mb-2">Ticket {index + 1} of {ticketQuantity}</p>
                        <p className="text-xs text-gray-500 mb-2">Ref: {uniqueRef}</p>
                        <img
                          src={qrCode}
                          alt={`QR Code for ticket ${index + 1}`}
                          className="w-20 h-20 md:w-24 md:h-24 mx-auto border-2 border-gray-300 rounded-lg mb-2"
                        />
                        <button
                          onClick={() => downloadIndividualTicket(index)}
                          disabled={loading}
                          className="bg-tetClr text-white py-1 px-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-tetClr/90 transition-all duration-300 disabled:opacity-50 w-full"
                        >
                          {loading ? 'Downloading...' : `Download Ticket ${index + 1}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-gray-600 text-xs md:text-sm mb-4">
              A confirmation email with your ticket details has been sent to your email.
            </p>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="mb-4 shake">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 mx-auto"
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
            <h1 className="text-base md:text-lg font-bold text-gray-900 mb-3">Payment Pending</h1>
            <p className="text-gray-600 text-xs md:text-sm mb-4 px-2">
              Your payment is pending. You will receive an email with the QR code once confirmed.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 shake">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto"
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
            <h1 className="text-base md:text-lg font-bold text-gray-900 mb-3">Payment Failed</h1>
            <p className="text-gray-600 text-xs md:text-sm mb-4 px-2">
              Your payment could not be processed. Please try again or contact support.
            </p>
          </>
        )}
        <Link
          to="/"
          className="inline-block bg-pryClr text-white py-1 px-3 rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-xs md:text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentStatus;