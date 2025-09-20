import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaTimes, FaEye, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
    next_page_url: null,
    prev_page_url: null,
    links: [],
    total: 0,
  });
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
      const response = await axios.get(`${API_URL}/events`, {
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
  const fetchTransactions = async (pageUrl = `${API_URL}/transactions?search=doeer`) => {
    const toastId = toast.loading('Loading transaction history...');
    setTransactionLoading(true);
    setTransactionError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(pageUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.data) {
        const { data, current_page, next_page_url, prev_page_url, links, total } = response.data.data;
        setTransactionHistory(data.map(transaction => ({
          id: transaction.id,
          name: transaction.name || 'N/A',
          email: transaction.email || 'N/A',
          phone: transaction.phone || 'N/A',
          eventName: transaction.event_name || 'N/A',
          tickets: parseInt(transaction.tickets) || 0,
          totalPrice: parseInt(transaction.total_price) || 0,
        })));
        setPagination({
          current_page,
          next_page_url,
          prev_page_url,
          links,
          total,
        });
        toast.success('Transaction history loaded successfully', { id: toastId });
      } else {
        setTransactionHistory([]);
        setPagination({
          current_page: 1,
          next_page_url: null,
          prev_page_url: null,
          links: [],
          total: 0,
        });
        toast.error('Unexpected response structure', { id: toastId });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err.response || err);
      setTransactionError(err.response?.data?.message || err.message || 'Error fetching transactions');
      setTransactionHistory([]);
      toast.error(err.response?.data?.message || 'Error fetching transactions', { id: toastId });
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
      const response = await axios.get(`${API_URL}/events/${id}`, {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchEvents();
      fetchTransactions();
    }
  }, []);

  useEffect(() => {
    if (showModal || viewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, viewModal]);

  const totalTickets = transactionHistory.reduce((sum, transaction) => sum + transaction.tickets, 0);
  const totalAmount = transactionHistory.reduce((sum, transaction) => sum + transaction.totalPrice, 0);

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
          response = await axios.put(`${API_URL}/events/${editingEvent.id}`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } else {
          response = await axios.post(`${API_URL}/events`, payload, {
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
          response = await axios.post(`${API_URL}/events/${editingEvent.id}?_method=PUT`, formDataToSend, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          response = await axios.post(`${API_URL}/events`, formDataToSend, {
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
      const response = await axios.delete(`${API_URL}/events/${id}`, {
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
      const response = await axios.put(`${API_URL}/events/${id}/${endpoint}`, {}, {
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

  // Handle pagination click
  const handlePaginationClick = (url) => {
    if (url) {
      fetchTransactions(url);
    }
  };

  // Format tickets array for display in table
  const formatTickets = (tickets) => {
    if (!tickets || !Array.isArray(tickets)) return 'No tickets';
    return tickets.map(ticket => `${ticket.type}: ₦${ticket.price}, ${ticket.quantity} available`).join('; ');
  };

  return (
    <div className="min-h-screen bg-pryClr/5 p-8">
      <div className="w-full max-w-7xl mx-auto">
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
              className="bg-tetClr text-white px-2 md:px-3 py-1 md:py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-1 md:gap-2 shadow-md hover:shadow-lg  md:w-auto cursor-pointer text-sm md:text-base"
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

        {/* Transaction History Section */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Transaction History</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {transactionLoading ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">Loading transactions...</div>
              ) : transactionError ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">{transactionError}</div>
              ) : transactionHistory.length === 0 ? (
                <div className="p-3 md:p-4 text-center text-gray-600 text-sm md:text-base">No transactions found</div>
              ) : (
                <>
                  <table className="w-full text-sm md:text-base text-left text-gray-700 min-w-[600px]">
                    <thead className="bg-tetClr/20 text-gray-800">
                      <tr>
                        <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Name</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Email</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Phone</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Event</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Tickets</th>
                        <th className="px-4 md:px-6 py-3 md:py-4 font-semibold">Total (₦)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionHistory.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                          <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-900">{transaction.name}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600">{transaction.email}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600">{transaction.phone}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-tetClr">{transaction.eventName}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4">{transaction.tickets}</td>
                          <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-tetClr">₦{transaction.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination Controls */}
                  <div className="p-3 md:p-4 flex justify-center items-center gap-2">
                    {pagination.links.map((link, index) => (
                      <button
                        key={index}
                        onClick={() => handlePaginationClick(link.url)}
                        disabled={!link.url || link.active}
                        className={`px-2 md:px-3 py-1 md:py-2 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${
                          link.active
                            ? 'bg-tetClr text-white'
                            : link.url
                            ? 'bg-gray-200 text-gray-700 hover:bg-tetClr hover:text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                      </button>
                    ))}
                  </div>
                </>
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
      </div>
    </div>
  );
};

export default Event;