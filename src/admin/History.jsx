import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaEye, FaSearch, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    links: [],
    next_page_url: null,
    prev_page_url: null,
  });

  // Fetch transactions
  const fetchTransactions = async (params = {}, pageUrl = `${API_URL}/api/transactions`) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      console.log('Fetching transactions with params:', params, 'Page URL:', pageUrl);

      const response = await axios.get(pageUrl, {
        params,
        headers,
        withCredentials: true,
      });

      console.log('API response:', response.data);

      if (response.status === 200) {
        let fetchedTransactions = response.data.data.data || [];
        
        // Client-side filtering as a fallback for status and date
        fetchedTransactions = fetchedTransactions.filter((tx) => {
          const matchesStatus = statusFilter ? tx.status === statusFilter : true;
          const txDate = new Date(tx.created_at);
          const matchesFromDate = fromDate
            ? txDate >= new Date(fromDate)
            : true;
          const matchesToDate = toDate
            ? txDate <= new Date(new Date(toDate).setHours(23, 59, 59, 999))
            : true;
          return matchesStatus && matchesFromDate && matchesToDate;
        });

        setTransactions(fetchedTransactions);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          links: response.data.data.links,
          next_page_url: response.data.data.next_page_url,
          prev_page_url: response.data.data.prev_page_url,
        });

        if (fetchedTransactions.length === 0) {
          setError('No transactions match the selected filters');
          toast.info('No transactions match the selected filters');
        }
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch transactions';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction details
  const fetchTransactionDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      console.log('Fetching transaction details for ID:', id);

      const response = await axios.get(`${API_URL}/api/transactions/${id}`, {
        headers,
        withCredentials: true,
      });

      console.log('Transaction details response:', response.data);

      if (response.status === 200) {
        setSelectedTransaction(response.data.data);
        setIsModalOpen(true);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch transaction details';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching transaction details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter and search
  const handleFilterSearch = () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (searchQuery) params.search = searchQuery;
    fetchTransactions(params);
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    fetchTransactions();
  };

  // Handle pagination
  const handlePageChange = (url) => {
    if (url) {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (searchQuery) params.search = searchQuery;
      fetchTransactions(params, url);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';
  };

  return (
    <div className="min-h-screen bg-pryClr/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center"
        >
          Transaction History
        </motion.h1>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-secClr"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-secClr rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm bg-white/70 transition-all duration-300"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-secClr rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm bg-white/70 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-secClr rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm bg-white/70 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Search by Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-secClr rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr text-sm bg-white/70 transition-all duration-300"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFilterSearch}
              className="w-full sm:w-auto px-6 py-2.5 bg-pryClr text-white rounded-lg font-semibold hover:bg-pryClr/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
            >
              Apply Filters
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
            >
              Clear Filters
            </motion.button>
          </div>
        </motion.div>

        {/* Error and Loading States */}
        {loading && (
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
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-500 text-sm bg-white rounded-xl shadow-lg p-6"
          >
            {error}
          </motion.div>
        )}

        {/* Transactions Table */}
        {!loading && !error && transactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 text-sm bg-white rounded-xl shadow-lg p-6"
          >
            No transactions found
          </motion.div>
        )}
        {!loading && !error && transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-x-auto border border-secClr"
          >
            <table className="min-w-full divide-y divide-secClr">
              <thead className="bg-tetClr/20">
                <tr>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ticket Type
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="p-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secClr">
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-tetClr/5'
                    } hover:bg-tetClr/10 transition-all duration-200`}
                  >
                    <td className="p-6 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">
                      {transaction.purchase.full_name}
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">
                      {transaction.purchase.email}
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">
                      {transaction.purchase.ticket_type.toUpperCase()}
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">
                      {transaction.purchase.quantity}
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(parseFloat(transaction.purchase.total_amount))}
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm text-gray-600">
                      {transaction.purchase.event.name}
                    </td>
                    <td className="p-6 whitespace-nowrap text-sm">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fetchTransactionDetails(transaction.id)}
                        className="text-pryClr hover:text-pryClr/80 transition-colors duration-200"
                        title="View Details"
                      >
                        <FaEye className="text-lg text-tetClr" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && transactions.length > 0 && (
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
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  pagination.prev_page_url
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
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                      link.active
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
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  pagination.next_page_url
                    ? 'bg-pryClr text-white hover:bg-pryClr/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } transition-all duration-300`}
              >
                <FaArrowRight />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Transaction Details Modal */}
        <AnimatePresence>
          {isModalOpen && selectedTransaction && (
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
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    Transaction Details
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <FaTimes className="text-lg" />
                  </motion.button>
                </div>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    <strong className="font-semibold text-gray-800">Transaction ID:</strong> {selectedTransaction.id}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Status:</strong>{' '}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTransaction.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </span>
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Reference Number:</strong> {selectedTransaction.ref_no}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Date:</strong> {formatDate(selectedTransaction.created_at)}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Full Name:</strong> {selectedTransaction.purchase.full_name}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Email:</strong> {selectedTransaction.purchase.email}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Phone:</strong> {selectedTransaction.purchase.phone || 'N/A'}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Ticket Type:</strong> {selectedTransaction.purchase.ticket_type.toUpperCase()}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Quantity:</strong> {selectedTransaction.purchase.quantity}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Total Amount:</strong>{' '}
                    {formatCurrency(parseFloat(selectedTransaction.purchase.total_amount))}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Event Name:</strong> {selectedTransaction.purchase.event.name}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Checked In:</strong>{' '}
                    {selectedTransaction.purchase.checked_in_quantity} of {selectedTransaction.purchase.quantity}
                  </p>
                  <p>
                    <strong className="font-semibold text-gray-800">Used:</strong>{' '}
                    {selectedTransaction.purchase.used === '1' ? 'Yes' : 'No'}
                  </p>
                  {selectedTransaction.purchase.checked_in_at && (
                    <p>
                      <strong className="font-semibold text-gray-800">Checked In At:</strong>{' '}
                      {formatDate(selectedTransaction.purchase.checked_in_at)}
                    </p>
                  )}
                  {selectedTransaction.paystack_response && (
                    <p>
                      <strong className="font-semibold text-gray-800">Payment Method:</strong>{' '}
                      {selectedTransaction.paystack_response.data.channel.charAt(0).toUpperCase() +
                        selectedTransaction.paystack_response.data.channel.slice(1)}
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(false)}
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

export default History;