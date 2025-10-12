import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaCalendarCheck, FaTicketAlt } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [stats, setStats] = useState({ total_revenue: 0, total_bookings: 0 });
  const [eventRevenue, setEventRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isEventDataLoading, setIsEventDataLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'Invalid dates';
  };

  // ✅ Fetch only successful bookings for stats
  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      const allBookings = response.data.data?.data || [];

      // ✅ Filter successful bookings
      const successfulBookings = allBookings.filter((b) => b.status === 'success');

      const totalRevenue = successfulBookings.reduce(
        (sum, b) => sum + parseFloat(b.amount_paid || 0),
        0
      );

      setStats({
        total_revenue: totalRevenue,
        total_bookings: successfulBookings.length,
      });
    } catch (error) {
      console.error('Error fetching booking stats:', error.response || error);
      setError('Failed to fetch booking stats');
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchEventData = async () => {
    setIsEventDataLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/transactions`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      const transactions = response.data.data?.data || [];

      const successfulTransactions = transactions.filter((tx) => tx.status === 'success');

      const totalAmount = successfulTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.purchase?.total_amount || 0),
        0
      );

      const totalTickets = successfulTransactions.reduce(
        (sum, tx) => sum + Number(tx.purchase?.quantity || 0),
        0
      );

      setEventRevenue(totalAmount);
      setTotalTickets(totalTickets);
    } catch (error) {
      console.error('Error fetching event data:', error.response || error);
      setError('Failed to fetch event data');
    } finally {
      setIsEventDataLoading(false);
    }
  };

  // ✅ Fetch only successful bookings for table
  const fetchBookings = async () => {
    setIsBookingsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/bookings`, {
        params: { limit: 10, sort: 'created_at-desc' },
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      const fetchedBookings = response.data.data?.data || [];

      // ✅ Only include successful bookings
      const successfulBookings = fetchedBookings.filter((b) => b.status === 'success');

      setBookings(successfulBookings.slice(0, 3));
    } catch (error) {
      console.error('Error fetching bookings:', error.response || error);
      setError('Failed to fetch bookings');
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setIsTransactionsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/transactions`, {
        params: { limit: 3, sort: 'created_at-desc' },
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      const fetchedTransactions = response.data.data?.data || [];
      const successfulTransactions = fetchedTransactions.filter((tx) => tx.status === 'success');

      setTransactions(successfulTransactions.slice(0, 3));
    } catch (error) {
      console.error('Error fetching transactions:', error.response || error);
      setError('Failed to fetch transactions');
    } finally {
      setIsTransactionsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStats(),
        fetchEventData(),
        fetchBookings(),
        fetchTransactions(),
      ]);
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  const statCards = [
    {
      title: 'Total Booking',
      value: isStatsLoading ? 'Loading...' : formatCurrency(stats.total_revenue),
      icon: <FaMoneyBillWave className="text-3xl text-white" />,
      bgColor: 'bg-tetClr',
    },
    {
      title: 'Total Ticket',
      value: isEventDataLoading ? 'Loading...' : formatCurrency(eventRevenue),
      icon: <FaMoneyBillWave className="text-3xl text-white" />,
      bgColor: 'bg-tetClr',
    },
    {
      title: 'Bookings',
      value: isStatsLoading ? 'Loading...' : stats.total_bookings || 0,
      icon: <FaCalendarCheck className="text-3xl text-white" />,
      bgColor: 'bg-tetClr',
    },
    {
      title: 'Tickets',
      value: isEventDataLoading ? 'Loading...' : totalTickets.toLocaleString(),
      icon: <FaTicketAlt className="text-3xl text-white" />,
      bgColor: 'bg-tetClr',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-pryClr"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
    <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
      <div className="mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-tetClr">Dashboard Overview</h1>
        </motion.div>

        {/* Stat Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative bg-tetClr/50 rounded-xl shadow-lg p-6 flex flex-col gap-4 transform hover:scale-[1.03] hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`w-14 h-14 ${stat.bgColor} rounded-lg flex items-center justify-center shadow-md`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Latest Bookings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
          <div className="p-6 border-b border-gray-200 bg-tetClr/50 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Latest Successful Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            {isBookingsLoading ? (
              <div className="p-6 text-center text-gray-600 text-sm">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-pryClr" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading bookings...</span>
                </motion.div>
              </div>
            ) : error && !bookings.length ? (
              <div className="p-6 text-center text-red-500 text-sm">{error}</div>
            ) : bookings.length === 0 ? (
              <div className="p-6 text-center text-gray-600 text-sm">No successful bookings found</div>
            ) : (
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-tetClr/20 text-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold md:px-6">Guest Name</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Email</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Phone</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Check In</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Check Out</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 md:px-6 font-medium text-gray-900">{booking.guest_name}</td>
                      <td className="px-4 py-4 md:px-6">{booking.guest_email}</td>
                      <td className="px-4 py-4 md:px-6">{booking.guest_phone}</td>
                      <td className="px-4 py-4 md:px-6">{formatDate(booking.check_in_date)}</td>
                      <td className="px-4 py-4 md:px-6">{formatDate(booking.check_out_date)}</td>
                      <td className="px-4 py-4 md:px-6">{calculateDuration(booking.check_in_date, booking.check_out_date)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Latest Transactions Table (unchanged) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-tetClr/50 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Latest Event Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            {isTransactionsLoading ? (
              <div className="p-6 text-center text-gray-600 text-sm">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-pryClr" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading transactions...</span>
                </motion.div>
              </div>
            ) : error && !transactions.length ? (
              <div className="p-6 text-center text-red-500 text-sm">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-600 text-sm">No transactions found</div>
            ) : (
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-tetClr/20 text-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold md:px-6">Full Name</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Email</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Ticket Type</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Quantity</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Total Amount</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Event Name</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 md:px-6 font-medium text-gray-900">{transaction.purchase.full_name}</td>
                      <td className="px-4 py-4 md:px-6">{transaction.purchase.email}</td>
                      <td className="px-4 py-4 md:px-6">{transaction.purchase.ticket_type.toUpperCase()}</td>
                      <td className="px-4 py-4 md:px-6">{transaction.purchase.quantity}</td>
                      <td className="px-4 py-4 md:px-6">{formatCurrency(parseFloat(transaction.purchase.total_amount))}</td>
                      <td className="px-4 py-4 md:px-6">{transaction.purchase.event.name}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
