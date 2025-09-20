import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const Ticket = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

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
        const token = localStorage.getItem('token');
        console.log(`Fetching page ${page} with token:`, token ? 'Present' : 'Missing');

        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await axios.get(`${API_URL}/events/latest?page=${page}&t=${Date.now()}`, {
          headers,
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

        console.log(`Events extracted (page ${page}):`, fetchedEvents);

        const allEvents = [...accumulatedEvents, ...fetchedEvents];

        const nextPage = response.data.data?.current_page
          ? response.data.data.current_page + 1
          : response.data.meta?.current_page
            ? response.data.meta.current_page + 1
            : null;
        const hasMorePages = response.data.data?.next_page_url || response.data.meta?.next_page_url;
        const totalEvents = response.data.meta?.total || response.data.data?.total || allEvents.length;

        console.log(`Pagination (page ${page}):`, {
          nextPage,
          hasMorePages: !!hasMorePages,
          totalEvents,
          currentEvents: allEvents.length,
        });

        if (hasMorePages && nextPage && allEvents.length < totalEvents) {
          console.log(`Proceeding to fetch page ${nextPage}`);
          return fetchPage(nextPage, allEvents);
        } else {
          console.log(`Pagination complete. Total events fetched: ${allEvents.length}`);
        }

        const mappedEvents = allEvents.map(event => {
          if (!event.id || !event.name || !event.description || !event.tickets) {
            console.warn('Event missing required fields:', event);
          }
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
              ? (event.image.startsWith('http')
                ? event.image
                : `${STORAGE_URL}/${event.image}`)
              : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?...',
            canPay: event.canPay === '1',
          };
        });

        console.log('Final mapped events:', JSON.stringify(mappedEvents, null, 2));
        setEvents(mappedEvents);
        setIsLoading(false);
      } catch (err) {
        console.error(`Error fetching events (page ${page}):`, { error: err.response || err, stack: err.stack });
        const errorMessage =
          err.response?.data?.message === 'Unauthenticated'
            ? 'You are not authenticated. Please log in again.'
            : err.code === 'ERR_NETWORK'
              ? 'Failed to fetch events due to CORS or network issues. Please contact the administrator.'
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

  const handleBuy = (event) => {
    if (event.canPay) {
      setSelectedEvent(event);
    }
  };

  const formik = useFormik({
    initialValues: {
      full_name: '',
      email: '',
      phone: '',
      ticket_type: selectedEvent?.tickets[0]?.type || 'Regular',
      quantity: 1,
    },
    validationSchema: Yup.object({
      full_name: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string()
        .matches(/^\d{10,15}$/, 'Phone number must be 10-15 digits')
        .required('Phone number is required'),
      ticket_type: Yup.string().required('Ticket type is required'),
      quantity: Yup.number()
        .min(1, 'Quantity must be at least 1')
        .required('Quantity is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!selectedEvent) return;
      try {
        const token = localStorage.getItem('token');
        console.log('Initiating purchase with token:', token ? 'Present' : 'Missing');

        if (!token) {
          throw new Error('Authentication token is missing. Please log in again.');
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        localStorage.setItem('eventName', selectedEvent.name);
        localStorage.setItem('ticketQuantity', values.quantity.toString());
        localStorage.setItem('ticketPrice', calculateTotal().toLocaleString('en-NG'));
        localStorage.setItem('userEmail', values.email);

        const purchaseResponse = await axios.post(
          `${API_URL}/events/${selectedEvent.id}/purchase`,
          {
            full_name: values.full_name,
            email: values.email,
            phone: values.phone,
            ticket_type: values.ticket_type,
            quantity: values.quantity,
          },
          { headers, withCredentials: true }
        );

        console.log('Purchase response:', JSON.stringify(purchaseResponse.data, null, 2));

        if (purchaseResponse.data.purchase?.id) {
          const purchaseId = purchaseResponse.data.purchase.id;
          console.log(`Purchase ID: ${purchaseId}`);
          localStorage.setItem('pendingPurchaseId', purchaseId);

          const paystackResponse = await axios.post(
            `${API_URL}/purchases/${purchaseId}/paystack`,
            {
              amount: calculateTotal() * 100,
              email: values.email,
              ticket_type: values.ticket_type,
              quantity: values.quantity,
            },
            { headers, withCredentials: true }
          );

          console.log('Paystack initialization response:', JSON.stringify(paystackResponse.data, null, 2));

          const paystackData = paystackResponse.data.transaction?.paystack_response;
          if (paystackData?.status && paystackData.data?.authorization_url) {
            if (paystackData.data.reference) {
              localStorage.setItem('transactionRef', paystackData.data.reference);
            }
            // Navigate to payment status page with state instead of redirect
            navigate('/payment-status', {
              state: {
                trxref: paystackData.data.reference,
                purchaseId,
              },
            });
            setSelectedEvent(null);
            resetForm();
          } else {
            throw new Error('Failed to initialize Paystack payment: Invalid response structure');
          }
        } else {
          throw new Error('Failed to create purchase record');
        }
      } catch (err) {
        console.error('Error processing payment:', { error: err.response || err, stack: err.stack });
        const errorMessage =
          err.response?.data?.message === 'Unauthenticated'
            ? 'You are not authenticated. Please log in again.'
            : err.code === 'ERR_NETWORK'
              ? 'Failed to process payment due to CORS or network issues. Please contact the administrator.'
              : err.response?.data?.message || err.message || 'Failed to process payment.';
        setError(errorMessage);
        navigate('/payment-status', {
          state: {
            status: 'failed',
            purchaseId: null,
            qrCode: null,
            eventName: selectedEvent?.name || 'Unnamed Event',
            ticketQuantity: values.quantity || '1',
            transactionRef: null,
            ticketPrice: null,
          },
          replace: true,
        });
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
    <div className="min-h-screen w-full bg-trdClr/15 py-12 pt-28">
      <div className="w-[90%] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Exclusive Events</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Join us for unforgettable experiences with our curated selection of premium events.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-600">Loading events...</div>
        ) : error ? (
          <div className="text-center text-gray-600">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-600">No events found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-white text-tetClr py-1 px-3 rounded-full font-semibold text-xs sm:text-sm">
                    {typeof event.minPrice === 'number' ? `₦${event.minPrice.toLocaleString('en-NG')}` : 'N/A'}
                  </div>
                  <div className="absolute top-4 left-4 bg-tetClr text-white py-1 px-3 rounded-full font-semibold text-xs sm:text-sm">
                    {event.tickets[0]?.type || 'Regular'}
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">{event.subtitle}</p>
                  <button
                    onClick={() => handleBuy(event)}
                    disabled={!event.canPay}
                    className={`w-full bg-tetClr text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-tetClr/90 transition-all duration-300 shadow-md hover:shadow-lg ${!event.canPay ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Buy Now
                  </button>
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
              <form onSubmit={formik.handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="full_name"
                      value={formik.values.full_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter your full name"
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr ${formik.touched.full_name && formik.errors.full_name ? 'border-red-500' : ''}`}
                    />
                    <FaUser className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {formik.touched.full_name && formik.errors.full_name && (
                    <p className="text-xs text-red-500 mt-1">{formik.errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter your email address"
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''}`}
                    />
                    <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Please ensure your email is correct; tickets will be sent here.
                  </p>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter your phone number"
                      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr ${formik.touched.phone && formik.errors.phone ? 'border-red-500' : ''}`}
                    />
                    <FaPhone className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{formik.errors.phone}</p>
                  )}
                </div>

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
                        {ticket.type} (₦{ticket.price.toLocaleString('en-NG')}, {ticket.quantity} available)
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
                  type="submit"
                  disabled={!formik.isValid || !selectedEvent || !selectedEvent.canPay}
                  className={`w-full bg-pryClr text-white py-3 rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg ${!formik.isValid || !selectedEvent || !selectedEvent.canPay ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Pay Now
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticket;