import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCopy } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const Ticket = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [resultModal, setResultModal] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (selectedEvent) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedEvent]);

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);

        const fetchPage = async (page = 1, accumulatedEvents = []) => {
            try {
                const response = await axios.get(`${API_URL}/api/events/latest?page=${page}&t=${Date.now()}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });

                console.log(`API response (page ${page}):`, JSON.stringify(response.data, null, 2));

                let fetchedEvents = [];
                if (Array.isArray(response.data.data)) {
                    fetchedEvents = response.data.data;
                } else if (Array.isArray(response.data.events)) {
                    fetchedEvents = response.data.events;
                } else if (response.data.event) {
                    fetchedEvents = [response.data.event];
                } else if (response.data.data?.data) {
                    fetchedEvents = response.data.data.data;
                } else {
                    console.warn(`Unexpected response structure on page ${page}:`, response.data);
                    fetchedEvents = [];
                }

                const allEvents = [...accumulatedEvents, ...fetchedEvents];

                const nextPage = response.data.data?.current_page
                    ? response.data.data.current_page + 1
                    : response.data.meta?.current_page
                        ? response.data.meta.current_page + 1
                        : null;
                const hasMorePages = response.data.data?.next_page_url || response.data.meta?.next_page_url;
                const totalEvents = response.data.meta?.total || response.data.data?.total || allEvents.length;

                if (hasMorePages && nextPage && allEvents.length < totalEvents) {
                    return fetchPage(nextPage, allEvents);
                }

                const mappedEvents = allEvents.map(event => {
                    const tickets = Array.isArray(event.tickets)
                        ? event.tickets.map(ticket => ({
                            type: ticket.type || 'Regular',
                            price: typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price || 0,
                            quantity: typeof ticket.quantity === 'string' ? parseInt(ticket.quantity) : ticket.quantity || 0,
                        }))
                        : [{ type: 'Regular', price: 0, quantity: 0 }];

                    return {
                        id: event.id || Date.now() + Math.random(),
                        name: event.name || 'Unnamed Event',
                        subtitle: event.description || 'No description available',
                        tickets,
                        minPrice: tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0,
                        image: event.image
                            ? event.image.startsWith('http')
                                ? event.image
                                : `${STORAGE_URL}/${event.image}`
                            : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?...',
                        canPay: event.canPay === '1',
                    };
                });

                setEvents(mappedEvents);
                setIsLoading(false);
            } catch (err) {
                console.error(`Error fetching events (page ${page}):`, err);
                const errorMessage =
                    err.code === 'ERR_NETWORK'
                        ? 'Failed to fetch events due to network issues.'
                        : err.response?.data?.message || 'Failed to fetch events.';
                setError(errorMessage);
                setEvents([]);
                setIsLoading(false);
            }
        };

        fetchPage();
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const reference = params.get('reference');
        if (reference) {
            verifyPayment(reference);
        }
    }, [location]);

    const verifyPayment = async (reference) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found. Please log in.');

            const response = await axios.get(`${API_URL}/api/purchases/ref/${reference}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true,
            });

            const transaction = response.data.transaction;
            if (transaction && transaction.status === 'success') {
                setResultModal({ status: 'success', ref_no: reference });
            } else {
                setResultModal({ status: 'failed', error: 'Payment not successful' });
            }
        } catch (err) {
            console.error('Error verifying payment:', err);
            const errorMessage =
                err.code === 'ERR_NETWORK'
                    ? 'Failed to verify payment due to network issues.'
                    : err.response?.data?.message || 'Failed to verify payment.';
            setResultModal({ status: 'failed', error: errorMessage });
        }
    };

    const handleBuy = (event) => {
        if (event.canPay) {
            setSelectedEvent(event);
        }
    };

    const formik = useFormik({
        initialValues: {
            ticket_type: selectedEvent?.tickets[0]?.type || 'Regular',
            quantity: 1,
        },
        validationSchema: Yup.object({
            ticket_type: Yup.string().required('Ticket type is required'),
            quantity: Yup.number()
                .min(1, 'Quantity must be at least 1')
                .required('Quantity is required'),
        }),
        onSubmit: async (values, { resetForm }) => {
            if (!selectedEvent) return;
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found. Please log in.');

                const purchaseResponse = await axios.post(
                    `${API_URL}/api/events/${selectedEvent.id}/purchaseAtDoor`,
                    {
                        ticket_type: values.ticket_type,
                        quantity: values.quantity,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true
                    }
                );

                const purchaseId = purchaseResponse.data.purchase.id;

                const total = calculateTotal();

                const paystackResponse = await axios.post(
                    `${API_URL}/api/purchases/${purchaseId}/paystack`,
                    {
                        amount: total * 100,
                        ticket_type: values.ticket_type,
                        quantity: values.quantity,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true
                    }
                );

                const paystackData = paystackResponse.data.transaction.paystack_response;
                if (paystackData.status && paystackData.data.authorization_url) {
                    // open Paystack checkout
                    window.location.href = paystackData.data.authorization_url;
                } else {
                    throw new Error('Failed to initialize Paystack payment: Missing authorization URL');
                }

            } catch (err) {
                console.error('Error processing payment:', err);
                const errorMessage =
                    err.code === 'ERR_NETWORK'
                        ? 'Failed to process payment due to network issues.'
                        : err.response?.data?.message || 'Failed to process payment.';
                setResultModal({ status: 'failed', error: errorMessage });
            } finally {
                setSelectedEvent(null);
                resetForm();
            }
        },
        enableReinitialize: true,
    });

    const calculateTotal = () => {
        if (!selectedEvent || !formik.values.ticket_type) return 0;
        const selectedTicket = selectedEvent.tickets.find(
            ticket => ticket.type === formik.values.ticket_type
        );
        return selectedTicket && typeof selectedTicket.price === 'number'
            ? selectedTicket.price * formik.values.quantity
            : 0;
    };

    return (
        <div className="min-h-screen w-full bg-trdClr/15 py-12">
            <div className="w-[90%] mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Exclusive Events</h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                        Join us for unforgettable experiences with our curated selection of premium events.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse flex space-x-4">
                            <div className="rounded-full bg-tetClr h-12 w-12"></div>
                            <div className="flex-1 space-y-6 py-1">
                                <div className="h-2 bg-tetClr rounded"></div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-2 bg-tetClr rounded col-span-2"></div>
                                        <div className="h-2 bg-tetClr rounded col-span-1"></div>
                                    </div>
                                    <div className="h-2 bg-tetClr rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center text-gray-600">{error}</div>
                ) : events.length === 0 ? (
                    <div className="text-center text-gray-600">No events found</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl"
                            >
                                <div className="relative">
                                    <img
                                        src={event.image}
                                        alt={event.name}
                                        className="w-full h-72 md:h-64 object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute top-0 left-0 w-full h-16 flex items-center justify-between px-4">
                                        <span className="text-white font-semibold text-sm bg-tetClr rounded-full px-3 py-1">{event.tickets[0]?.type || 'Regular'}</span>
                                        <span className="text-white font-semibold text-sm bg-tetClr rounded-full px-3 py-1">
                                            {typeof event.minPrice === 'number' ? `₦${event.minPrice.toLocaleString('en-NG')}` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">{event.name}</h3>
                                    <p className="text-gray-600 text-sm flex-grow line-clamp-3">{event.subtitle}</p>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleBuy(event)}
                                            disabled={!event.canPay}
                                            className={`w-full bg-tetClr text-white py-3 rounded-lg font-semibold hover:bg-tetClr/90 transition-all duration-300 shadow-md ${!event.canPay ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-4 pt-8 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-2/5 bg-tetClr/30 p-4 sm:p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
                                <button
                                    onClick={() => {
                                        setSelectedEvent(null);
                                        formik.resetForm();
                                    }}
                                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                            <img
                                src={selectedEvent.image}
                                alt={selectedEvent.name}
                                className="w-full h-48 sm:h-64 object-cover rounded-lg mb-4 shadow-md"
                            />
                            <p className="text-gray-600 text-sm sm:text-base">{selectedEvent.subtitle}</p>
                            <p className="text-base sm:text-lg font-semibold text-pryClr mt-2">
                                {formik.values.ticket_type &&
                                    selectedEvent.tickets.find(t => t.type === formik.values.ticket_type)?.price
                                    ? `₦${selectedEvent.tickets
                                        .find(t => t.type === formik.values.ticket_type)
                                        .price.toLocaleString('en-NG')}`
                                    : 'N/A'}{' '}
                                ({formik.values.ticket_type || 'Select Ticket Type'})
                            </p>
                        </div>

                        <div className="md:w-3/5 p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Complete Your Purchase</h3>
                            <div className="space-y-4 mb-6">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                                    <select
                                        name="ticket_type"
                                        value={formik.values.ticket_type}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr ${formik.touched.ticket_type && formik.errors.ticket_type ? 'border-red-500' : ''}`}
                                    >
                                        {selectedEvent.tickets.map((ticket) => (
                                            <option key={ticket.type} value={ticket.type}>
                                                {ticket.type} (₦{ticket.price.toLocaleString('en-NG')})
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.ticket_type && formik.errors.ticket_type && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.ticket_type}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tickets</label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => formik.setFieldValue('quantity', formik.values.quantity > 1 ? formik.values.quantity - 1 : 1)}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                                        >
                                            -
                                        </button>
                                        <span className="text-base sm:text-lg font-semibold">{formik.values.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const selectedTicket = selectedEvent.tickets.find(t => t.type === formik.values.ticket_type);
                                                const maxQuantity = selectedTicket ? selectedTicket.quantity : 1;
                                                formik.setFieldValue('quantity', formik.values.quantity < maxQuantity ? formik.values.quantity + 1 : maxQuantity);
                                            }}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                    {formik.touched.quantity && formik.errors.quantity && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.quantity}</p>
                                    )}
                                </div>

                                <div className="bg-tetClr/30 p-4 rounded-lg border border-amber-100 mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 text-sm sm:text-base">
                                                {formik.values.ticket_type &&
                                                    selectedEvent.tickets.find(t => t.type === formik.values.ticket_type)?.price
                                                    ? `₦${selectedEvent.tickets
                                                        .find(t => t.type === formik.values.ticket_type)
                                                        .price.toLocaleString('en-NG')}`
                                                    : 'N/A'}{' '}
                                                x {formik.values.quantity} ticket(s)
                                            </span>
                                            <span className="font-semibold text-sm sm:text-base">
                                                {calculateTotal() ? `₦${calculateTotal().toLocaleString('en-NG')}` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-secClr">
                                            <span className="text-base sm:text-lg font-bold text-gray-900">Total Amount:</span>
                                            <span className="text-base sm:text-lg font-bold text-pryClr">
                                                {calculateTotal() ? `₦${calculateTotal().toLocaleString('en-NG')}` : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={formik.handleSubmit}
                                    disabled={!formik.isValid || !selectedEvent || !selectedEvent.canPay}
                                    className={`w-full bg-pryClr text-white py-3 rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg ${!formik.isValid || !selectedEvent || !selectedEvent.canPay ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Pay Now
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By proceeding, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {resultModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        {resultModal.status === 'success' ? (
                            <>
                                <h3 className="text-xl font-bold mb-4">Payment Initiated</h3>
                                <p className="mb-4">Your payment request has been successfully initiated.</p>
                                <div className="flex items-center">
                                    <span>Transaction Ref: {resultModal.ref_no}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(resultModal.ref_no)}
                                        className="ml-2 text-blue-500"
                                    >
                                        <FaCopy />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold mb-4">Payment Failed</h3>
                                <p>{resultModal.error}</p>
                            </>
                        )}
                        <button
                            onClick={() => setResultModal(null)}
                            className="mt-4 bg-tetClr text-white py-2 px-4 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ticket;