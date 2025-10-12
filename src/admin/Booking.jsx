import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaCalendarCheck, FaCalendarTimes, FaSearch, FaFilter, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Booking = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', payment_status: '', search: '' });
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    links: [],
    next_page_url: null,
    prev_page_url: null,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      if (response.status === 200) {
        const allBookings = response.data.data.data || [];

        // Filter successful (paid) bookings only
        const successfulBookings = allBookings.filter(
          (b) => b.payment_status === 'paid'
        );

        // Compute stats based on successful ones
        const totalRevenue = successfulBookings.reduce(
          (sum, b) => sum + (Number(b.total_amount) || 0),
          0
        );

        setStats({
          total_bookings: successfulBookings.length,
          confirmed_bookings: successfulBookings.filter(
            (b) => b.status === 'confirmed'
          ).length,
          checked_in: successfulBookings.filter(
            (b) => b.status === 'checked_in'
          ).length,
          checked_out: successfulBookings.filter(
            (b) => b.status === 'checked_out'
          ).length,
          total_revenue: totalRevenue,
          pending_payment: allBookings.filter(
            (b) => b.payment_status === 'unpaid'
          ).length,
        });
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error.response || error);
    } finally {
      setIsStatsLoading(false);
    }
  };


  const fetchBookings = async (params = {}, pageUrl = `${API_URL}/api/bookings`) => {
    setIsTableLoading(true);
    try {
      const response = await axios.get(pageUrl, {
        params,
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      if (response.status === 200) {
        const fetchedBookings = response.data.data.data || [];
        setBookings(fetchedBookings);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          links: response.data.data.links,
          next_page_url: response.data.data.next_page_url,
          prev_page_url: response.data.data.prev_page_url,
        });
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error.response || error);
    } finally {
      setIsTableLoading(false);
    }
  };

  const fetchBookingDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/bookings/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      setSelectedBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking details:', error.response || error);
    } finally {
      setShowModal(true);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await axios.post(`${API_URL}/api/bookings/${id}/checkin`, {}, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      fetchBookings(filters);
    } catch (error) {
      console.error('Error during check-in:', error.response || error);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await axios.post(`${API_URL}/api/bookings/${id}/checkout`, {}, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      fetchBookings(filters);
    } catch (error) {
      console.error('Error during check-out:', error.response || error);
    }
  };

  const handleFilterSearch = () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.payment_status) params.payment_status = filters.payment_status;
    if (filters.search) params.search = filters.search;
    fetchBookings(params);
  };

  const clearFilters = () => {
    setFilters({ status: '', payment_status: '', search: '' });
    fetchBookings();
  };

  const handlePageChange = (url) => {
    if (url) {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.payment_status) params.payment_status = filters.payment_status;
      if (filters.search) params.search = filters.search;
      fetchBookings(params, url);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchStats(), fetchBookings()]);
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const preventBackgroundScroll = (e) => {
      if (showModal) {
        e.preventDefault();
      }
    };

    const preventTouchScroll = (e) => {
      if (showModal) {
        e.preventDefault();
      }
    };

    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('wheel', preventBackgroundScroll, { passive: false });
      document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    } else {
      document.body.style.overflow = 'unset';
      document.removeEventListener('wheel', preventBackgroundScroll);
      document.removeEventListener('touchmove', preventTouchScroll);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('wheel', preventBackgroundScroll);
      document.removeEventListener('touchmove', preventTouchScroll);
    };
  }, [showModal]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center space-x-2"
        >
          <svg
            className="animate-spin h-5 w-5 text-pryClr"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pryClr/5 py-8 ">
      <div className="w-[90%] mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center"
        >
          Booking Management
        </motion.h1>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {isStatsLoading ? (
            <div className="col-span-full text-center text-gray-600 text-sm">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center space-x-2"
              >
                <svg
                  className="animate-spin h-5 w-5 text-pryClr"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading stats...</span>
              </motion.div>
            </div>
          ) : (
            <>
              {[
                { label: 'Total Bookings', value: stats?.total_bookings || 0 },
                { label: 'Confirmed Bookings', value: stats?.confirmed_bookings || 0 },
                { label: 'Checked In', value: stats?.checked_in || 0 },
                { label: 'Checked Out', value: stats?.checked_out || 0 },
                { label: 'Total Revenue', value: formatCurrency(stats?.total_revenue || 0) },
                { label: 'Pending Payments', value: stats?.pending_payment || 0 },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-xl border border-secClr"
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">{stat.label}</h3>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-secClr"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search bookings..."
                  className="w-full pl-10 pr-4 py-2.5 border border-secClr rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm bg-white transition-all duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-secClr rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm bg-white transition-all duration-300"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Status</label>
              <select
                value={filters.payment_status}
                onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
                className="w-full px-4 py-2.5 border border-secClr rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm bg-white transition-all duration-300"
              >
                <option value="">All Payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFilterSearch}
              className="w-full sm:w-auto px-6 py-2.5 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
            >
              <FaFilter className="inline mr-2" /> Apply Filters
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
            >
              <FaTimes className="inline mr-2" /> Clear Filters
            </motion.button>
          </div>
        </motion.div>

        {/* Error and Loading States */}
        {isTableLoading && (
          <div className="text-center text-gray-600 text-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-flex items-center space-x-2"
            >
              <svg
                className="animate-spin h-5 w-5 text-pryClr"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading...</span>
            </motion.div>
          </div>
        )}

        {/* Bookings Table */}
        {!isTableLoading && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 text-sm bg-white rounded-xl shadow-lg p-6"
          >
            No bookings found
          </motion.div>
        )}
        {!isTableLoading && bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-x-auto border border-secClr"
          >
            <table className="min-w-full divide-y divide-secClr">
              <thead className="bg-tetClr/20">
                <tr>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Guest Name</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check In</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check Out</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nights</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secClr">
                {bookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-tetClr/5'} hover:bg-tetClr/10 transition-all duration-200`}
                  >
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{booking.booking_reference}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{booking.guest_name}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{booking.guest_email}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{booking.guest_phone}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{formatDate(booking.check_in_date)}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{formatDate(booking.check_out_date)}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{booking.nights}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{formatCurrency(booking.total_amount)}</td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">{booking.booking_type}</td>
                    <td className="p-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${booking.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => fetchBookingDetails(booking.id)}
                          className="text-pryClr hover:text-pryClr/80 transition-colors duration-200"
                          title="View Details"
                        >
                          <FaEye className="text-lg text-tetClr" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCheckIn(booking.id)}
                          disabled={booking.status === 'checked_in'}
                          className="text-green-600 hover:text-green-600/80 transition-colors duration-200 disabled:opacity-50"
                          title="Check In"
                        >
                          <FaCalendarCheck className="text-lg text-tetClr" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCheckOut(booking.id)}
                          disabled={booking.status !== 'checked_in'}
                          className="text-red-600 hover:text-red-600/80 transition-colors duration-200 disabled:opacity-50"
                          title="Check Out"
                        >
                          <FaCalendarTimes className="text-lg text-tetClr" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Pagination */}
        {!isTableLoading && bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex justify-between items-center"
          >
            <div className="text-sm text-gray-600">
              Page {pagination.current_page} of {pagination.last_page}
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.prev_page_url)}
                disabled={!pagination.prev_page_url}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${pagination.prev_page_url
                    ? 'bg-pryClr text-white hover:bg-pryClr/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-all duration-300`}
              >
                <FaArrowLeft />
              </motion.button>
              {pagination.links
                .filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                .map((link) => (
                  <motion.button
                    key={link.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(link.url)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${link.active
                        ? 'bg-pryClr text-white'
                        : 'bg-white text-gray-600 border border-secClr hover:bg-tetClr/10'
                      } transition-all duration-300`}
                  >
                    {link.label}
                  </motion.button>
                ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(pagination.next_page_url)}
                disabled={!pagination.next_page_url}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${pagination.next_page_url
                    ? 'bg-pryClr text-white hover:bg-pryClr/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-all duration-300`}
              >
                <FaArrowRight />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Booking Details Modal */}
        <AnimatePresence>
          {showModal && selectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Booking Details</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <FaTimes className="text-lg" />
                  </motion.button>
                </div>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    <strong className="font-semibold text-gray-800">Reference:</strong> {selectedBooking.booking_reference}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Guest Name:</strong> {selectedBooking.guest_name}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Email:</strong> {selectedBooking.guest_email}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Phone:</strong> {selectedBooking.guest_phone}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Total Guests:</strong> {selectedBooking.total_guests}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Check In Date:</strong> {formatDate(selectedBooking.check_in_date)}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Check Out Date:</strong> {formatDate(selectedBooking.check_out_date)}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Nights:</strong> {selectedBooking.nights}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Total Amount:</strong> {formatCurrency(selectedBooking.total_amount)}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Booking Type:</strong> {selectedBooking.booking_type}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Status:</strong>{' '}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedBooking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Payment Status:</strong>{' '}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedBooking.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {selectedBooking.payment_status.charAt(0).toUpperCase() + selectedBooking.payment_status.slice(1)}
                    </span>
                  </p>
                  {selectedBooking.apartment && (
                    <div>
                      <strong className="font-semibold text-gray-800">Apartment:</strong>
                      <p>{selectedBooking.apartment.name}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.apartment.description}</p>
                    </div>
                  )}
                  {selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0 && (
                    <div>
                      <strong className="font-semibold text-gray-800">Rooms:</strong>
                      <ul className="list-disc list-inside">
                        {selectedBooking.booking_rooms.map((br) => (
                          <li key={br.id} className="text-gray-600">{br.room?.room_type || 'Room'}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedBooking.transactions && selectedBooking.transactions.length > 0 && (
                    <div>
                      <strong className="font-semibold text-gray-800">Transactions:</strong>
                      {selectedBooking.transactions.map((tx) => (
                        <div key={tx.id} className="border border-secClr p-2 rounded mt-2">
                          <p>
                            <strong className="font-semibold text-gray-800">Ref:</strong> {tx.transaction_ref}
                          </p>
                          <p>
                            <strong className="font-semibold text-gray-800">Amount:</strong> {formatCurrency(tx.amount)}
                          </p>
                          <p>
                            <strong className="font-semibold text-gray-800">Status:</strong>{' '}
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tx.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedBooking.special_requests && (
                    <p>
                      <strong className="font-semibold text-gray-800">Special Requests:</strong> {selectedBooking.special_requests}
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                  className="mt-6 w-full px-6 py-2.5 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Booking;