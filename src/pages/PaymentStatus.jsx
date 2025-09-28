import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import * as domtoimage from 'dom-to-image';
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
      try {
        console.log(`Calling GET verify endpoint: ${API_URL}/api/purchases/${refNo}/verify`);
        response = await axios.get(`${API_URL}/api/purchases/${refNo}/verify`, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });
      } catch (getError) {
        console.warn('GET request failed, trying POST /purchases/verify:', getError.response || getError);
        response = await axios.post(
          `${API_URL}/api/purchases/verify`,
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
        const element = flyerRefs.current[index];
        const dataUrl = await domtoimage.toPng(element, {
          quality: 1.0,
          bgcolor: 'transparent',
          width: element.offsetWidth * 3,
          height: element.offsetHeight * 3,
          style: {
            transform: 'scale(3)',
            transformOrigin: 'top left',
          },
        });
        const link = document.createElement('a');
        link.download = `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_Ticket_${index + 1}.png`;
        link.href = dataUrl;
        link.click();
        toast.success(`Ticket ${index + 1} downloaded successfully!`);
      } catch (error) {
        console.error('Error generating ticket flyer:', error);
        toast.error('Failed to download ticket. Please try again.');
      }
      setLoading(false);
    }
  };

  const animations = `
    @keyframes shake {
      0% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
      100% { transform: translateX(0); }
    }
    .shake {
      animation: shake 0.5s ease-in-out;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .float {
      animation: float 3s ease-in-out infinite;
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 8, 20, 0.5); }
      50% { box-shadow: 0 0 30px rgba(0, 8, 20, 0.8); }
    }
    .glow {
      animation: glow 2s ease-in-out infinite alternate;
    }
    .glass-effect {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .ticket-glass {
      background: linear-gradient(135deg, rgb(0, 8, 20), rgb(0, 53, 102));
      border: 2px solid rgba(240, 203, 70, 0.5);
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    .ticket-glass::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      // background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: rotate(45deg);
      // animation: shine 4s infinite;
    }
    @keyframes shine {
      // 0% { transform: rotate(45deg) translateX(-100%); }
      // 100% { transform: rotate(45deg) translateX(100%); }
    }
    .perforation {
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 90%;
      background: 
        radial-gradient(circle at 50% 0%, transparent 45%, #fff 45%, #fff 55%, transparent 55%) 0 0,
        radial-gradient(circle at 50% 100%, transparent 45%, #fff 45%, #fff 55%, transparent 55%) 0 100%;
      background-size: 12px 24px;
      background-repeat: repeat-y;
    }
    .perforation-left {
      position: absolute;
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 90%;
      background: 
        radial-gradient(circle at 50% 0%, transparent 45%, #fff 45%, #fff 55%, transparent 55%) 0 0,
        radial-gradient(circle at 50% 100%, transparent 45%, #fff 45%, #fff 55%, transparent 55%) 0 100%;
      background-size: 12px 24px;
      background-repeat: repeat-y;
    }
    .ticket-header {
      background: linear-gradient(to right, rgb(0, 8, 20), rgb(240, 203, 70));
      color: white;
      padding: 4px;
      text-align: center;
      font-weight: bold;
      font-size: 1.5rem;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
    }
    .decorative-corner {
      position: absolute;
      width: 40px;
      height: 40px;
      background: radial-gradient(circle at 0 0, transparent 60%, rgb(240, 203, 70) 60%);
    }
    .decorative-corner.top-left {
      top: -2px;
      left: -2px;
      border-top-left-radius: 20px;
    }
    .decorative-corner.bottom-right {
      bottom: -2px;
      right: -2px;
      border-bottom-right-radius: 20px;
      transform: rotate(180deg);
    }
  `;

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center py-8 px-4 pt-26 backdrop-blur-sm"
      style={{ background: 'linear-gradient(to bottom right, rgb(0, 8, 20), rgb(0, 53, 102), rgb(204, 160, 0))' }}
    >
      <style>{animations}</style>
      <div className="glass-effect rounded-3xl shadow-2xl w-[90%] md:w-[60%] p-10 mx-auto border border-[#F0CB46]/30">
        {status === 'success' ? (
          <>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={400}
              gravity={0.15}
            />
            <div className="text-center mb-10 relative">
              <div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 float glow bg-tetClr"
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-tetClr mb-4">
                Payment Successful!
              </h1>
              <h2 className="text-xl md:text-3xl font-semibold text-white mb-6">{eventName}</h2>

              <div className="grid grid-cols-2 gap-6 mb-8 mt-4">
                <div className="glass-effect p-4 rounded-2xl border border-[#F0CB46]/30">
                  <div className="text-2xl font-bold text-black mb-1">{ticketQuantity}</div>
                  <div className="text-sm text-white">Tickets</div>
                </div>
                <div className="glass-effect p-4 rounded-2xl border border-[#000814]/30">
                  <div className="text-2xl font-bold text-black mb-1">₦{ticketPrice}</div>
                  <div className="text-sm text-white">Total Amount</div>
                </div>
              </div>
            </div>

            {qrCode && (
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#CCA000] to-[#F0CB46] mb-2">
                  Your Exclusive Tickets
                </h3>
                <p className="text-white text-center mb-8">Download your  tickets below for event entry.</p>

                <div
                  className={`w-full ${ticketQuantity === 1
                    ? "flex justify-center"
                    : "grid grid-cols-1 md:grid-cols-2 gap-8"
                    }`}
                >
                  {Array.from({ length: ticketQuantity }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        ref={(el) => (flyerRefs.current[index] = el)}
                        className="ticket-glass relative py-4 px-8 w-full "
                      >

                        <div className="perforation"></div>
                        <div className="perforation-left"></div>
                        <div className="ticket-header text-sm md:text-base">Ticket</div>
                        <div className="relative z-10">
                          <h4 className="text-xl md:text-2xl font-bold mb-4 text-center drop-shadow-lg text-white mt-4">{eventName}</h4>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-[#F0CB46]/30">
                            {/* <div className="text-center mb-3">
                              <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-semibold text-white">
                                Ticket {index + 1} of {ticketQuantity}
                              </span>
                            </div> */}
                            <div className="flex flex-col items-center">
                              <img
                                src={qrCode}
                                alt={`QR Code for ticket ${index + 1}`}
                                className="w-36 h-36 border-4 border-[#F0CB46] rounded-lg mt-2 shadow-lg bg-white"
                              />
                              {/* <p className="text-xs text-white/80 text-center">Scan QR code at venue</p> */}
                            </div>
                            <div className="mt-4 text-center">
                              <div className="font-mono text-xs bg-black/20 px-3 py-2 rounded-lg break-all border border-[#CCA000]/30 text-white">
                                 {transactionRef}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadIndividualTicket(index)}
                        disabled={loading}
                        className="mt-4 w-full max-w-sm bg-[#000814] text-[#F0CB46] py-3 rounded-lg font-bold text-lg hover:bg-[#003566] transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#F0CB46]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Downloading...
                          </span>
                        ) : (
                          `Download Ticket ${index + 1}`
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center glass-effect p-6 rounded-2xl border border-[#F0CB46]/3">
              <p className="text-pryClr mb-2">
                <span className="font-semibold "> Email Sent:</span> A confirmation with your ticket details has been sent to your email.
              </p>
              <p className="text-sm text-pryClr">Please keep your tickets safe and present them at the event entrance.</p>
            </div>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="text-center mb-8 shake">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-[#F0CB46]/20 rounded-full mb-4 glass-effect">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-[#F0CB46]"
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Payment Pending</h1>
              <p className="text-sm md:text-base text-white/80 mb-6 max-w-md mx-auto">
                Your payment is pending. You will receive an email with the QR code once confirmed.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8 shake">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full mb-4 glass-effect">
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Payment Failed</h1>
              <p className="text-sm md:text-base text-white/80 mb-6 max-w-md mx-auto">
                Your payment could not be processed. Please try again or contact support.
              </p>
            </div>
            {localStorage.getItem('pendingPurchaseId') && (
              <Link
                to="/ticket"
                className="inline-block bg-[#000814] text-[#F0CB46] py-2 px-6 rounded-lg font-semibold hover:bg-[#003566] transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base mb-4 glass-effect"
              >
                Try Again
              </Link>
            )}
          </>
        )}

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-block bg-pryClr text-white py-3 px-8 rounded-xl font-semibold  transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;