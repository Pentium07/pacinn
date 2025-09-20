import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaCheckCircle, FaClock, FaArrowLeft, FaEye, FaTimes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const EventStats = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, checked_in: 0, pending: 0 });
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch ticket statistics
  const fetchTicketStats = async () => {
    const toastId = toast.loading('Loading ticket statistics...');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/events/${eventId}/ticket-stats`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.data) {
        setStats(response.data.data);
        toast.success('Ticket statistics loaded successfully', { id: toastId });
      } else {
        setStats({ total: 0, checked_in: 0, pending: 0 });
        toast.error('Unexpected response structure', { id: toastId });
      }
    } catch (err) {
      console.error('Error fetching ticket stats:', err.response || err);
      setError(err.response?.data?.message || 'Error fetching ticket statistics');
      toast.error(err.response?.data?.message || 'Error fetching ticket statistics', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tickets based on filter
  const fetchTickets = async (filterType) => {
    const toastId = toast.loading(`Loading ${filterType} tickets...`);
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const endpoint = filterType === 'checked-in' ? 'checked-in' : 'pending';
      const response = await axios.get(`${API_URL}/events/${eventId}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const ticketsData = response.data.data || response.data.tickets || [];
        setTickets(ticketsData);
        toast.success(`${filterType} tickets loaded successfully`, { id: toastId });
      } else {
        setTickets([]);
        toast.error('Unexpected response structure', { id: toastId });
      }
    } catch (err) {
      console.error(`Error fetching ${filterType} tickets:`, err.response || err);
      setError(err.response?.data?.message || `Error fetching ${filterType} tickets`);
      setTickets([]);
      toast.error(err.response?.data?.message || `Error fetching ${filterType} tickets`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view ticket
  const handleViewTicket = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    setSelectedTicket(ticket);
    setViewModal(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchTicketStats();
      fetchTickets(filter === 'all' ? 'checked-in' : filter);
    }
  }, [filter]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (viewModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [viewModal]);

  return (
    <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
      <div className="w-full mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 md:mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-tetClr">
              Event Statistics
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-tetClr rounded-full animate-pulse"></span>
              Ticket statistics for Event ID: {eventId}
            </p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="bg-tetClr text-white px-4 py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <FaArrowLeft /> Back to Events
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 md:mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Total Tickets</h3>
              <p className="text-2xl md:text-3xl font-bold text-tetClr">{stats.total.toLocaleString()}</p>
            </div>
            <FaTicketAlt className="text-3xl md:text-4xl text-tetClr" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Checked In</h3>
              <p className="text-2xl md:text-3xl font-bold text-tetClr">{stats.checked_in.toLocaleString()}</p>
            </div>
            <FaCheckCircle className="text-3xl md:text-4xl text-tetClr" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Pending</h3>
              <p className="text-2xl md:text-3xl font-bold text-tetClr">{stats.pending.toLocaleString()}</p>
            </div>
            <FaClock className="text-3xl md:text-4xl text-tetClr" />
          </div>
        </div>

        {/* Tickets Table */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Ticket Details</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  filter === 'all' ? 'bg-tetClr text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Tickets
              </button>
              <button
                onClick={() => setFilter('checked-in')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  filter === 'checked-in' ? 'bg-tetClr text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Checked In
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  filter === 'pending' ? 'bg-tetClr text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-600">Loading tickets...</div>
              ) : error ? (
                <div className="p-6 text-center text-gray-600">{error}</div>
              ) : tickets.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No tickets found</div>
              ) : (
                <table className="w-full text-sm md:text-base text-left text-gray-700 min-w-[600px]">
                  <thead className="bg-tetClr/20 text-gray-800">
                    <tr>
                      <th className="px-8 py-6 md:py-4 font-semibold">Ticket ID</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Full Name</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Ticket Type</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Quantity</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Used</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Checked In By</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                        <td className="px-8 py-6 md:py-4 font-medium text-gray-900">{ticket.id}</td>
                        <td className="px-8 py-6 md:py-4 text-gray-600">{ticket.full_name || 'N/A'}</td>
                        <td className="px-8 py-6 md:py-4 text-gray-600">{ticket.ticket_type || 'N/A'}</td>
                        <td className="px-8 py-6 md:py-4 text-gray-600">{ticket.quantity || 'N/A'}</td>
                        <td className="px-8 py-6 md:py-4 text-gray-600">{ticket.used === '1' ? 'Yes' : 'No'}</td>
                        <td className="px-8 py-6 md:py-4 text-gray-600">{ticket.checked_in_by || 'N/A'}</td>
                        <td className="px-8 py-6 md:py-4">
                          <button
                            onClick={() => handleViewTicket(ticket.id)}
                            className="text-blue-500 p-1 rounded-full cursor-pointer transition-all duration-200"
                            title="View Details"
                          >
                            <FaEye size={14} md:size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* View Ticket Modal */}
        {viewModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-4 md:p-6 overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900">Ticket Details</h3>
                <button
                  onClick={() => {
                    setViewModal(false);
                    setSelectedTicket(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes size={16} md:size={18} />
                </button>
              </div>
              {selectedTicket ? (
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Ticket ID</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Event ID</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.event_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Full Name</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Email</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Phone</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Ticket Type</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.ticket_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Quantity</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.quantity || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Unit Price</label>
                    <p className="text-sm md:text-base text-gray-600">₦{selectedTicket.unit_price || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Total Amount</label>
                    <p className="text-sm md:text-base text-gray-600">₦{selectedTicket.total_amount || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.transaction_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Created At</label>
                    <p className="text-sm md:text-base text-gray-600">
                      {selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Updated At</label>
                    <p className="text-sm md:text-base text-gray-600">
                      {selectedTicket.updated_at ? new Date(selectedTicket.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Used</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.used === '1' ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Checked In By</label>
                    <p className="text-sm md:text-base text-gray-600">{selectedTicket.checked_in_by || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Checked In At</label>
                    <p className="text-sm md:text-base text-gray-600">
                      {selectedTicket.checked_in_at ? new Date(selectedTicket.checked_in_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-600">No ticket data available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventStats;