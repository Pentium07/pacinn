import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaTimes, FaEye, FaChartBar, FaSearch, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const Event = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [viewModal, setViewModal] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    links: [],
    next_page_url: null,
    prev_page_url: null,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    tickets: [{ type: '', price: '', quantity: '' }],
    image: null,
  });

  // Fetch events from API
  const fetchEvents = async () => {
    const toastId = toast.loading('Loading events...');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/events`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        let events = [];
        if (Array.isArray(response.data.data.data)) {
          events = response.data.data.data;
        } else if (Array.isArray(response.data.events)) {
          events = response.data.events;
        } else if (response.data.event) {
          events = [response.data.event];
        } else if (Array.isArray(response.data.data)) {
          events = response.data.data;
        }

        setEvents(events);
        toast.success('Events loaded successfully', { id: toastId });
      } else {
        setEvents([]);
        toast.error('Unexpected response structure', { id: toastId });
      }
    } catch (err) {
      console.error('Error fetching events:', err.response || err);
      setError(err.response?.data?.message || err.message || 'Error fetching events');
      setEvents([]);
      toast.error(err.response?.data?.message || 'Error fetching events', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transaction history from API
  const fetchTransactions = async (params = {}, pageUrl = `${API_URL}/api/transactions`) => {
    setTransactionLoading(true);
    setTransactionError(null);
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

        setTransactionHistory(fetchedTransactions);
        setPagination({
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          links: response.data.data.links,
          next_page_url: response.data.data.next_page_url,
          prev_page_url: response.data.data.prev_page_url,
          total: fetchedTransactions.length,
        });

        if (fetchedTransactions.length === 0) {
          setTransactionError('No transactions match the selected filters');
        }
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to fetch transactions';
      setTransactionError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Fetch transaction details
  const fetchTransactionDetails = async (id) => {
    setTransactionLoading(true);
    setTransactionError(null);
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
      setTransactionError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching transaction details:', err);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Fetch single event for View modal
  const fetchEventDetails = async (id) => {
    const toastId = toast.loading('Loading event details...');
    setViewLoading(true);
    setViewError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/events/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        let event = response.data.event || response.data.data || response.data;
        setViewEvent(event);
        toast.success('Event details loaded successfully', { id: toastId });
      } else {
        setViewEvent(null);
        toast.error('Unexpected response structure', { id: toastId });
      }
    } catch (err) {
      console.error('Error fetching event details:', err.response || err);
      setViewError(err.response?.data?.message || err.message || 'Error fetching event details');
      setViewEvent(null);
      toast.error(err.response?.data?.message || 'Error fetching event details', { id: toastId });
    } finally {
      setViewLoading(false);
    }
  };

  // Handle filter and search for transactions
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchEvents();
      fetchTransactions();
    }
  }, []);

  useEffect(() => {
    if (showModal || viewModal || isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, viewModal, isModalOpen]);

  // filter only successful transactions
  const successfulTransactions = transactionHistory.filter(
    (transaction) => transaction.status === "success"
  );

  const totalTickets = successfulTransactions.reduce((sum, transaction) => {
    const qty = Number(transaction?.purchase?.quantity) || 0;
    return sum + qty;
  }, 0);

  const totalAmount = successfulTransactions.reduce(
    (sum, transaction) => sum + parseFloat(transaction.purchase?.total_amount || 0),
    0
  );


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTicketChange = (index, field, value) => {
    const updatedTickets = [...formData.tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    setFormData({ ...formData, tickets: updatedTickets });
  };

  const addTicket = () => {
    setFormData({
      ...formData,
      tickets: [...formData.tickets, { type: '', price: '', quantity: '' }],
    });
  };

  const removeTicket = (index) => {
    setFormData({
      ...formData,
      tickets: formData.tickets.filter((_, i) => i !== index),
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData({ ...formData, image: file });
    } else {
      setFileName('No file chosen');
      setFormData({ ...formData, image: null });
    }
  };

  const handleAddEvent = async () => {
    const { name, description, start_date, end_date, tickets, image } = formData;

    if (!name || !description || !start_date || !end_date || tickets.some(t => !t.type || !t.price || !t.quantity)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      let response;

      if (!image) {
        const payload = {
          name,
          description,
          start_date: `${start_date}T09:00:00.000000Z`,
          end_date: `${end_date}T18:00:00.000000Z`,
          tickets,
          image: null,
        };

        if (editingEvent) {
          response = await axios.put(`${API_URL}/api/events/${editingEvent.id}`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } else {
          response = await axios.post(`${API_URL}/api/events`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        }
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append('name', name);
        formDataToSend.append('description', description);
        formDataToSend.append('start_date', `${start_date} 09:00:00`);
        formDataToSend.append('end_date', `${end_date} 18:00:00`);
        formDataToSend.append('image', image);
        formDataToSend.append('tickets', JSON.stringify(tickets));

        if (editingEvent) {
          response = await axios.post(`${API_URL}/api/events/${editingEvent.id}?_method=PUT`, formDataToSend, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          response = await axios.post(`${API_URL}/api/events`, formDataToSend, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      if ((response.status === 200 || response.status === 201) && response.data.event) {
        if (editingEvent) {
          setEvents(events.map(event => event.id === editingEvent.id ? response.data.event : event));
          toast.success(response.data.message || 'Event updated successfully');
        } else {
          setEvents([...events, response.data.event]);
          toast.success(response.data.message || 'Event created successfully');
        }

        await fetchEvents();
      } else {
        toast.error('Unexpected response structure');
      }

      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        tickets: [{ type: '', price: '', quantity: '' }],
        image: null,
      });
      setFileName('No file chosen');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error saving event:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name || '',
      description: event.description || '',
      start_date: event.start_date ? event.start_date.split('T')[0] : '',
      end_date: event.end_date ? event.end_date.split('T')[0] : '',
      tickets: event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0
        ? event.tickets.map(ticket => ({
          type: ticket.type || '',
          price: ticket.price || '',
          quantity: ticket.quantity || '',
        }))
        : [{ type: '', price: '', quantity: '' }],
      image: event.image || null,
    });
    setFileName(event.image ? 'Image selected' : 'No file chosen');
    setShowModal(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/events/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setEvents(events.filter(event => event.id !== id));
        toast.success(response.data.message || 'Event deleted successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
      console.error('Error deleting event:', err.response || err);
    }
  };

  const handleTogglePayment = async (id, canPay) => {
    const action = canPay === '1' ? 'Disabling' : 'Enabling';
    const endpoint = canPay === '1' ? 'cantpay' : 'canpay';
    const newCanPay = canPay === '1' ? '0' : '1';
    const toastId = toast.loading(`${action} payment...`);

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === id ? { ...event, canPay: newCanPay.toString() } : event
      )
    );

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/events/${id}/${endpoint}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.event) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === id ? response.data.event : event
          )
        );
        toast.success(response.data.message || `Payment ${action.toLowerCase()} successfully`, { id: toastId });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error(`Error ${action.toLowerCase()} payment:`, err.response || err);
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === id ? { ...event, canPay: canPay } : event
        )
      );
      toast.error(err.response?.data?.message || `Failed to ${action.toLowerCase()} payment`, { id: toastId });
    }
  };

  const handleViewEvent = async (id) => {
    await fetchEventDetails(id);
    setViewModal(true);
  };

  const handleViewStats = (id) => {
    navigate(`/event-stats/${id}`);
  };

  // Format tickets array for display in table
  const formatTickets = (tickets) => {
    if (!tickets || !Array.isArray(tickets)) return 'No tickets';
    return tickets.map(ticket => `${ticket.type}: ₦${ticket.price}, ${ticket.quantity} available`).join('; ');
  };

  return (
    <div className="min-h-screen bg-pryClr/5 p-8">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-tetClr">
            Event Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2 flex items-center gap-1 md:gap-2">
            <span className="w-2 h-2 bg-tetClr rounded-full animate-pulse"></span>
            Manage events and view ticket purchase history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 md:mb-10 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Total Tickets Sold</h3>
              <p className="text-xl md:text-2xl font-bold text-tetClr">{totalTickets.toLocaleString()}</p>
            </div>
            <FaCalendarAlt className="text-2xl md:text-3xl text-tetClr" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-xl md:text-2xl font-bold text-tetClr">₦{totalAmount.toLocaleString()}</p>
            </div>
            <FaMoneyBillWave className="text-2xl md:text-3xl text-tetClr" />
          </div>
        </div>

        {/* Events Management Section */}
        <div className="mb-8 md:mb-10">
          <div className="flex justify-between items-center mb-3 md:mb-4 gap-3 md:gap-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Available Events</h2>
            <button
              onClick={() => {
                setEditingEvent(null);
                setFormData({ name: '', description: '', start_date: '', end_date: '', tickets: [{ type: '', price: '', quantity: '' }], image: null });
                setFileName('No file chosen');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                setShowModal(true);
              }}
              className="bg-tetClr text-white px-2 md:px-3 py-1 md:py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-1 md:gap-2 shadow-md hover:shadow-lg md:w-auto cursor-pointer text-sm md:text-base"
            >
              <FaPlus /> Add Event
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">Loading events...</div>
              ) : error ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">{error}</div>
              ) : events.length === 0 ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">No events found</div>
              ) : (
                <table className="w-full text-sm md:text-base text-left text-gray-700 min-w-[600px]">
                  <thead className="bg-tetClr/20 text-gray-800">
                    <tr>
                      <th className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 font-semibold">Image</th>
                      <th className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 font-semibold">Name</th>
                      <th className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 font-semibold">Pay</th>
                      <th className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 font-semibold">Ticket</th>
                      <th className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                        <td className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4">
                          {event.image && typeof event.image === 'string' ? (
                            <img src={`${STORAGE_BASE_URL}/${event.image}`} alt={event.name} className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover shadow-sm" />
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs md:text-sm">No Image</div>
                          )}
                        </td>
                        <td className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 font-medium text-gray-900">{event.name}</td>
                        <td className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4">{event.canPay === '1' ? 'Yes' : 'No'}</td>
                        <td className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 text-gray-600 max-w-[250px]">{formatTickets(event.tickets)}</td>
                        <td className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4 flex gap-1 md:gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-tetClr p-1 rounded-full cursor-pointer transition-all duration-200"
                            disabled={isSubmitting}
                            title="Edit"
                          >
                            <FaEdit size={12} className="md:text-[14px]" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-tetClr p-1 rounded-full cursor-pointer transition-all duration-200"
                            disabled={isSubmitting}
                            title="Delete"
                          >
                            <FaTrash size={12} className="md:text-[14px]" />
                          </button>
                          <button
                            onClick={() => handleTogglePayment(event.id, event.canPay)}
                            className={`p-1 rounded-full cursor-pointer transition-all duration-200 ${event.canPay === '1' ? 'text-red-500' : 'text-green-500'}`}
                            disabled={isSubmitting}
                            title={event.canPay === '1' ? 'Disable Payment' : 'Enable Payment'}
                          >
                            {isSubmitting ? (
                              <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-current rounded-full inline-block"></span>
                            ) : (
                              <FaMoneyBillWave size={12} className="md:text-[14px]" />
                            )}
                          </button>
                          <button
                            onClick={() => handleViewEvent(event.id)}
                            className="text-blue-500 p-1 rounded-full cursor-pointer transition-all duration-200"
                            disabled={isSubmitting}
                            title="View Details"
                          >
                            <FaEye size={12} className="md:text-[14px]" />
                          </button>
                          <button
                            onClick={() => handleViewStats(event.id)}
                            className="text-purple-500 p-1 rounded-full cursor-pointer transition-all duration-200"
                            disabled={isSubmitting}
                            title="View Stats"
                          >
                            <FaChartBar size={12} className="md:text-[14px]" />
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

        {/* Add/Edit Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-1 md:p-2 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-3 md:p-4 overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-bold text-gray-900">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setFormData({
                      name: '',
                      description: '',
                      start_date: '',
                      end_date: '',
                      tickets: [{ type: '', price: '', quantity: '' }],
                      image: null,
                    });
                    setFileName('No file chosen');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes size={14} className="md:text-[16px]" />
                </button>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter event name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter event description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Tickets</label>
                  {formData.tickets.map((ticket, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-1 md:gap-2 mb-1 md:mb-2">
                      <input
                        type="text"
                        placeholder="Ticket Type (e.g., General Admission)"
                        value={ticket.type}
                        onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                        className="w-full p-1 md:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                        className="w-full p-1 md:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                        className="w-full p-1 md:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                      />
                      {formData.tickets.length > 1 && (
                        <button
                          onClick={() => removeTicket(index)}
                          className="text-red-500 hover:text-red-600 p-1 md:p-2 rounded-full cursor-pointer"
                        >
                          <FaTrash size={12} className="md:text-[14px]" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTicket}
                    className="mt-1 md:mt-2 text-tetClr hover:text-tetClr/80 flex items-center gap-1 md:gap-2 text-sm md:text-base cursor-pointer"
                  >
                    <FaPlus size={12} className="md:text-[14px]" /> Add Another Ticket
                  </button>
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Event Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="w-full p-1 md:p-2 border border-gray-300 rounded-lg text-sm md:text-base"
                  />
                  <span className="text-sm md:text-base text-gray-400 mt-1">{fileName}</span>
                  {formData.image && formData.image instanceof File && (
                    <img src={URL.createObjectURL(formData.image)} alt="Preview" className="mt-1 md:mt-2 w-12 h-12 md:w-16 md:h-16 rounded-md object-cover shadow-sm" />
                  )}
                  {formData.image && typeof formData.image === 'string' && (
                    <img src={`${STORAGE_BASE_URL}/${formData.image}`} alt="Preview" className="mt-1 md:mt-2 w-12 h-12 md:w-16 md:h-16 rounded-md object-cover shadow-sm" />
                  )}
                </div>
              </div>
              <button
                onClick={handleAddEvent}
                disabled={isSubmitting || !formData.name || !formData.description || !formData.start_date || !formData.end_date || formData.tickets.some(t => !t.type || !t.price || !t.quantity)}
                className="w-full mt-3 md:mt-4 bg-tetClr text-white py-1 md:py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg cursor-pointer text-sm md:text-base"
              >
                {isSubmitting ? (editingEvent ? 'Updating Event...' : 'Adding Event...') : (editingEvent ? 'Update Event' : 'Add Event')}
              </button>
            </div>
          </div>
        )}

        {/* View Event Modal */}
        {viewModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-1 md:p-2 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-3 md:p-4 overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-bold text-gray-900">Event Details</h3>
                <button
                  onClick={() => {
                    setViewModal(false);
                    setViewEvent(null);
                    setViewError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes size={14} className="md:text-[16px]" />
                </button>
              </div>
              {viewLoading ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">Loading event details...</div>
              ) : viewError ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">{viewError}</div>
              ) : viewEvent ? (
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">ID</label>
                    <p className="text-sm md:text-base text-gray-600">{viewEvent.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Name</label>
                    <p className="text-sm md:text-base text-gray-600">{viewEvent.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Description</label>
                    <p className="text-sm md:text-base text-gray-600">{viewEvent.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Start Date</label>
                    <p className="text-sm md:text-base text-gray-600">{new Date(viewEvent.start_date).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">End Date</label>
                    <p className="text-sm md:text-base text-gray-600">{new Date(viewEvent.end_date).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Tickets</label>
                    <p className="text-sm md:text-base text-gray-600">{formatTickets(viewEvent.tickets)}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Can Pay</label>
                    <p className="text-sm md:text-base text-gray-600">{viewEvent.canPay === '1' ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Created At</label>
                    <p className="text-sm md:text-base text-gray-600">{new Date(viewEvent.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Updated At</label>
                    <p className="text-sm md:text-base text-gray-600">{new Date(viewEvent.updated_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700">Image</label>
                    {viewEvent.image && typeof viewEvent.image === 'string' ? (
                      <img src={`${STORAGE_BASE_URL}/${viewEvent.image}`} alt={viewEvent.name} className="w-12 h-12 md:w-16 md:h-16 rounded-md object-cover shadow-sm" />
                    ) : (
                      <p className="text-sm md:text-base text-gray-600">No Image</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">No event data available</div>
              )}
            </div>
          </div>
        )}

        {/* Transaction History Section */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Transaction History</h2>
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
          {transactionLoading && (
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
          {transactionError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500 text-sm bg-white rounded-xl shadow-lg p-6"
            >
              {transactionError}
            </motion.div>
          )}

          {/* Transactions Table */}
          {!transactionLoading && !transactionError && transactionHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-600 text-sm bg-white rounded-xl shadow-lg p-6"
            >
              No transactions found
            </motion.div>
          )}
          {!transactionLoading && !transactionError && transactionHistory.length > 0 && (
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
                  {transactionHistory.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-tetClr/5'} hover:bg-tetClr/10 transition-all duration-200`}
                    >
                      <td className="p-6 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${transaction.status === 'success'
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
          {!transactionLoading && !transactionError && transactionHistory.length > 0 && (
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
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedTransaction.status === 'success'
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
    </div>
  );
};

export default Event;