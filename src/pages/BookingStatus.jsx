import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import * as domtoimage from 'dom-to-image';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://tunetribe.seniorcub.name.ng/pacInn/public';

const BookingStatus = () => {
    const location = useLocation();
    const [status, setStatus] = useState('pending');
    const [bookingId, setBookingId] = useState(location.state?.bookingId || localStorage.getItem('pendingBookingId') || null);
    const [qrCode, setQrCode] = useState(null);
    const [hotelName, setHotelName] = useState(location.state?.hotelName || localStorage.getItem('hotelName') || 'Unnamed Apartment');
    const [roomType, setRoomType] = useState(location.state?.roomType || localStorage.getItem('roomType') || 'Apartment');
    const [checkInDate, setCheckInDate] = useState(location.state?.checkInDate || localStorage.getItem('checkInDate') || 'N/A');
    const [checkOutDate, setCheckOutDate] = useState(location.state?.checkOutDate || localStorage.getItem('checkOutDate') || 'N/A');
    const [numberOfNights, setNumberOfNights] = useState(1);
    const [roomQuantity, setRoomQuantity] = useState(location.state?.roomQuantity || parseInt(localStorage.getItem('roomQuantity')) || 1);
    const [transactionRef, setTransactionRef] = useState(location.state?.trxref || localStorage.getItem('transactionRef') || 'N/A');
    const [totalAmount, setTotalAmount] = useState(location.state?.totalAmount || localStorage.getItem('totalAmount') || 'N/A');
    const [loading, setLoading] = useState(false);
    const passRefs = useRef([]);

    const calculateNights = (checkIn, checkOut) => {
        try {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            if (isNaN(checkInDate) || isNaN(checkOutDate)) {
                return 1;
            }
            const diffTime = checkOutDate - checkInDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 1;
        } catch {
            return 1;
        }
    };
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    const verifyBooking = async (reference) => {
        const toastId = toast.loading('Verifying booking...');
        setLoading(true);
        console.log('Starting booking verification:', { reference, API_URL });

        try {
            if (!reference) {
                throw new Error('Booking or transaction reference is missing.');
            }

            const endpoint = `${API_URL}/api/public/bookings/reference/${reference}`;
            console.log(`Calling GET verify endpoint: ${endpoint}`);
            const response = await axios.get(endpoint, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            console.log('Booking verification response:', JSON.stringify(response.data, null, 2));

            if (response.status === 200 && response.data) {
                const bookingData = response.data.booking;
                const transactionData = response.data.transaction;
                const isSuccess =
                    bookingData.status === 'confirmed' ||
                    bookingData.payment_status === 'paid' ||
                    transactionData?.status === 'success';

                setStatus(isSuccess ? 'success' : bookingData.status || 'failed');
                setQrCode(bookingData.qr_code || null);
                setBookingId(bookingData.id || bookingId);
                setTransactionRef(transactionData?.transaction_ref || transactionRef || 'N/A');
                setTotalAmount(
                    bookingData.total_amount
                        ? parseFloat(bookingData.total_amount).toFixed(2)
                        : transactionData?.amount
                            ? parseFloat(transactionData.amount / 100).toFixed(2)
                            : totalAmount
                );
                setHotelName(bookingData.apartment?.name || hotelName);
                setRoomType(
                    bookingData.booking_type === 'apartment' ? 'Apartment' :
                        bookingData.rooms?.[0]?.type ||
                        bookingData.booking_rooms?.[0]?.room?.type ||
                        roomType
                );
                const checkIn = bookingData.check_in_date?.split('T')[0] || checkInDate;
                const checkOut = bookingData.check_out_date?.split('T')[0] || checkOutDate;
                setCheckInDate(checkIn);
                setCheckOutDate(checkOut);
                setNumberOfNights(calculateNights(checkIn, checkOut));
                setRoomQuantity(
                    bookingData.booking_type === 'apartment' ? 1 :
                        bookingData.booking_rooms?.length ||
                        roomQuantity
                );

                toast.success(response.data.message || `Booking ${isSuccess ? 'confirmed' : bookingData.status}`, { id: toastId });

                if (isSuccess) {
                    localStorage.removeItem('pendingBookingId');
                    localStorage.removeItem('hotelName');
                    localStorage.removeItem('roomType');
                    localStorage.removeItem('checkInDate');
                    localStorage.removeItem('checkOutDate');
                    localStorage.removeItem('roomQuantity');
                    localStorage.removeItem('totalAmount');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('transactionRef');
                }
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (err) {
            console.error('Error verifying booking:', err);
            const errorMessage =
                err.code === 'ERR_NETWORK'
                    ? 'Failed to verify booking due to network issues.'
                    : err.response?.status === 404
                        ? 'Booking not found. The reference may be incorrect or the booking has not been processed yet. Please contact support.'
                        : err.response?.data?.message || err.message || 'Error verifying booking';

            setStatus(location.state?.status === 'success' ? 'success' : 'failed');
            toast.error(errorMessage, { id: toastId });

            if (err.response?.status === 404 && location.state?.status === 'success') {
                setStatus('success');
                setQrCode(location.state?.qrCode || null);
                setTransactionRef(location.state?.trxref || transactionRef);
                setTotalAmount(
                    location.state?.totalAmount || (location.state?.totalAmount / 100)?.toFixed(2) || totalAmount
                );
                setHotelName(location.state?.hotelName || hotelName);
                setRoomType(location.state?.roomType || roomType);
                setCheckInDate(location.state?.checkInDate || checkInDate);
                setCheckOutDate(location.state?.checkOutDate || checkOutDate);
                setNumberOfNights(calculateNights(location.state?.checkInDate || checkInDate, location.state?.checkOutDate || checkOutDate));
                setRoomQuantity(location.state?.roomQuantity || roomQuantity);
                toast.info('Booking appears successful based on callback data. Please download your room pass.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const trxref = params.get('reference') || location.state?.trxref || localStorage.getItem('transactionRef');
        const bookingRef = params.get('booking') || location.state?.bookingId || localStorage.getItem('pendingBookingId');

        console.log('Initial state and params:', {
            trxref,
            bookingRef,
            locationState: location.state,
            localStorage: {
                transactionRef: localStorage.getItem('transactionRef'),
                pendingBookingId: localStorage.getItem('pendingBookingId'),
            },
        });

        setBookingId(bookingRef || trxref || 'N/A');
        setTransactionRef(trxref || 'N/A');
        setNumberOfNights(calculateNights(checkInDate, checkOutDate));

        if (trxref) {
            verifyBooking(trxref);
        } else if (bookingRef) {
            verifyBooking(bookingRef);
        } else {
            setStatus('failed');
            toast.error('Missing booking or transaction reference. Please try again or contact support.');
            setLoading(false);
        }
    }, [location]);

    const downloadIndividualPass = async (index) => {
        if (passRefs.current[index]) {
            setLoading(true);
            try {
                const element = passRefs.current[index];
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
                link.download = `${hotelName.replace(/[^a-zA-Z0-9]/g, '_')}_Room_Pass_${index + 1}.png`;
                link.href = dataUrl;
                link.click();
                toast.success(`Room Pass ${index + 1} downloaded successfully!`);
            } catch (error) {
                console.error('Error generating room pass:', error);
                toast.error('Failed to download room pass. Please try again.');
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
    .pass-glass {
      background: linear-gradient(135deg, rgb(0, 8, 20), rgb(0, 53, 102));
      border: 2px solid rgba(240, 203, 70, 0.5);
      position: relative;
      overflow: hidden;
      border-radius: 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    .pass-glass::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: rotate(45deg);
      animation: shine 4s infinite;
    }
    @keyframes shine {
      0% { transform: rotate(45deg) translateX(-100%); }
      100% { transform: rotate(45deg) translateX(100%); }
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
    .pass-header {
      background: linear-gradient(to right, rgb(0, 8, 20), rgb(240, 203, 70));
      color: white;
      padding: 12px;
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
            <div className="glass-effect rounded-3xl shadow-2xl w-[90%] md:w-[50%] p-10 mx-auto border border-[#F0CB46]/30">
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
                                Booking Successful!
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">{hotelName}</h2>

                            <div className="grid grid-cols-2 gap-6 mb-8 mt-4">
                                <div className="glass-effect p-4 rounded-2xl border border-[#F0CB46]/30">
                                    <div className="text-2xl font-bold text-black mb-1">{roomQuantity}</div>
                                    <div className="text-sm text-white">Apartment{roomQuantity > 1 ? 's' : ''}</div>
                                </div>
                                <div className="glass-effect p-4 rounded-2xl border border-[#000814]/30">
                                    <div className="text-2xl font-bold text-black mb-1">₦{totalAmount}</div>
                                    <div className="text-sm text-white">Total Amount</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h3 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#CCA000] to-[#F0CB46] mb-2">
                                Your Exclusive Room Passes
                            </h3>
                            <p className="text-white text-center mb-8">Download your room passes below for check-in.</p>

                            <div
                                className={`w-full ${roomQuantity === 1
                                    ? "flex justify-center"
                                    : "grid grid-cols-1 md:grid-cols-2 gap-8"
                                    }`}
                            >
                                {Array.from({ length: roomQuantity }).map((_, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div
                                            ref={(el) => (passRefs.current[index] = el)}
                                            className="pass-glass relative p-8 w-full h-full"
                                        >
                                            <div className="perforation"></div>
                                            <div className="perforation-left"></div>
                                            <div className="pass-header">Room Pass</div>
                                            <div className="relative z-10">
                                                <h4 className="text-2xl font-bold mb-4 text-center drop-shadow-lg text-white mt-4">{hotelName}</h4>
                                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-[#F0CB46]/30">
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <div className="text-sm text-white/80">Check-In</div>
                                                            <div className="font-bold text-white">{checkInDate}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-white/80">Check-Out</div>
                                                            <div className="font-bold text-white">{checkOutDate}</div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <div className="text-sm text-white/80">Type</div>
                                                            <div className="font-bold text-white">{roomType}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-white/80">Nights</div>
                                                            <div className="font-bold text-white">{numberOfNights}</div>
                                                        </div>
                                                    </div>
                                                    {qrCode && (
                                                        <div className="flex flex-col items-center">
                                                            <img
                                                                src={qrCode}
                                                                alt={`QR Code for room pass ${index + 1}`}
                                                                className="w-36 h-36 border-4 border-[#F0CB46] rounded-lg mt-2 shadow-lg bg-white"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="mt-4 text-center">
                                                        <div className="font-mono text-sm bg-black/20 px-3 py-2 rounded-lg break-all border border-[#CCA000]/30 text-white">
                                                            Ref: {transactionRef}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadIndividualPass(index)}
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
                                                `Download Room Pass ${index + 1}`
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center glass-effect p-6 rounded-2xl border border-[#F0CB46]/30">
                            <p className="text-pryClr mb-2">
                                <span className="font-semibold">Email Sent:</span> A confirmation with your booking details has been sent to your email.
                            </p>
                            <p className="text-sm text-pryClr">Please keep your room pass safe and present it at check-in.</p>
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
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Booking Processing</h1>
                            <p className="text-sm md:text-base text-white/80 mb-6 max-w-md mx-auto">
                                Your booking is being processed. This may take a few moments. You will receive an email with your booking details once confirmed.
                            </p>
                            <button
                                onClick={() => verifyBooking(transactionRef || bookingId)}
                                disabled={loading}
                                className="inline-block bg-[#F0CB46] text-[#000814] py-2 px-6 rounded-lg font-semibold hover:bg-[#CCA000] transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base mb-4"
                            >
                                Refresh Status
                            </button>
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
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Booking Failed</h1>
                            <p className="text-sm md:text-base text-white/80 mb-6 max-w-md mx-auto">
                                Your booking could not be processed. Please try again or contact support.
                            </p>
                        </div>
                        {(bookingId || localStorage.getItem('pendingBookingId')) && (
                            <Link
                                to="/booking"
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
                        className="inline-block bg-pryClr text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookingStatus;