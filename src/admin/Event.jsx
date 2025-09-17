import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaTimes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Event = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('No file chosen');

  const [transactionHistory, setTransactionHistory] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+234 98765 43210',
      eventName: 'Gala Night Extravaganza',
      tickets: 2,
      totalPrice: 14000,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+234 87654 32109',
      eventName: 'Tech Summit 2025',
      tickets: 1,
      totalPrice: 4000,
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+234 76543 21098',
      eventName: 'Art & Wine Festival',
      tickets: 3,
      totalPrice: 21000,
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+234 65432 10987',
      eventName: 'Gala Night Extravaganza',
      tickets: 2,
      totalPrice: 14000,
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '+234 54321 09876',
      eventName: 'Tech Summit 2025',
      tickets: 4,
      totalPrice: 16000,
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    tickets: [{ type: 'Regular', price: '', quantity: '' }],
    image: null,
  });

  // Fetch events from API
const fetchEvents = async () => {
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

      // Case 1: API returns an array of events
      if (Array.isArray(response.data.events)) {
        events = response.data.events;

      // Case 2: API returns a single event object
      } else if (response.data.event) {
        events = [response.data.event];

      // Case 3: Fallback (in case backend uses "data")
      } else if (Array.isArray(response.data.data)) {
        events = response.data.data;
      }

      setEvents(events);
    } else {
      setEvents([]);
      toast.error('Unexpected response structure');
    }
  } catch (err) {
    console.error('Error fetching events:', err.response || err);
    setError(err.response?.data?.message || err.message || 'Error fetching events');
    setEvents([]);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchEvents();
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

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
      tickets: [...formData.tickets, { type: 'Regular', price: '', quantity: '' }],
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

    const formDataToSend = new FormData();
    formDataToSend.append('name', name);
    formDataToSend.append('description', description);
    formDataToSend.append('start_date', `${start_date}T00:00:00.000000Z`);
    formDataToSend.append('end_date', `${end_date}T23:59:59.000000Z`);
    formDataToSend.append('tickets', JSON.stringify(tickets));

    // Only send if it's a new file, not an existing string URL
    if (image instanceof File) {
      formDataToSend.append('image', image);
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      let response;
      if (editingEvent) {
        // Update event
        response = await axios.put(`${API_URL}/events/${editingEvent.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        if ((response.status === 200 || response.status === 201) && response.data.event) {
          setEvents(events.map(event => event.id === editingEvent.id ? response.data.event : event));
          toast.success(response.data.message || 'Event updated successfully');
        }
      } else {
        // Create event
        response = await axios.post(`${API_URL}/events`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });

        if ((response.status === 200 || response.status === 201) && response.data.event) {
          setEvents([...events, response.data.event]);
          toast.success(response.data.message);
        }
      }

      setShowModal(false);
      setEditingEvent(null);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        tickets: [{ type: 'Regular', price: '', quantity: '' }],
        image: null
      });
      setFileName('No file chosen');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
      console.error('Error saving event:', err.response || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      start_date: event.start_date.split('T')[0],
      end_date: event.end_date.split('T')[0],
      tickets: event.tickets || [{ type: 'Regular', price: '', quantity: '' }],
      image: event.image,
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

  return (
    <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-tetClr">
            Event Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-tetClr rounded-full animate-pulse"></span>
            Manage events and view ticket purchase history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 md:mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Total Tickets Sold</h3>
              <p className="text-2xl md:text-3xl font-bold text-tetClr">{totalTickets.toLocaleString()}</p>
            </div>
            <FaCalendarAlt className="text-3xl md:text-4xl text-tetClr" />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Total Revenue</h3>
              <p className="text-2xl md:text-3xl font-bold text-tetClr">₦{totalAmount.toLocaleString()}</p>
            </div>
            <FaMoneyBillWave className="text-3xl md:text-4xl text-tetClr" />
          </div>
        </div>

        {/* Events Management Section */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Available Events</h2>
            <button
              onClick={() => {
                setEditingEvent(null);
                setFormData({ name: '', description: '', start_date: '', end_date: '', tickets: [{ type: 'Regular', price: '', quantity: '' }], image: null });
                setFileName('No file chosen');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                setShowModal(true);
              }}
              className="bg-tetClr text-white px-4 py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg w-full md:w-auto"
            >
              <FaPlus /> Add Event
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-600">Loading events...</div>
              ) : error ? (
                <div className="p-6 text-center text-gray-600">{error}</div>
              ) : events.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No events found</div>
              ) : (
                <table className="w-full text-sm md:text-base text-left text-gray-700 min-w-[600px]">
                  <thead className="bg-tetClr/20 text-gray-800">
                    <tr>
                      <th className="px-8 py-6 md:py-4 font-semibold">Image</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Name</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Description</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Start Date</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">End Date</th>
                      <th className="px-8 py-6 md:py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                        <td className="px-8 py-6 md:py-4">
                          {event.image ? (
                            <img src={event.image} alt={event.name} className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                          )}
                        </td>
                        <td className="px-8 py-6 md:py-4 font-medium text-gray-900">{event.name}</td>
                        <td className="px-8 py-6 md:py-4 text-gray-600 max-w-[120px] md:max-w-[200px] truncate">{event.description}</td>
                        <td className="px-8 py-6 md:py-4">{event.start_date.split('T')[0]}</td>
                        <td className="px-8 py-6 md:py-4">{event.end_date.split('T')[0]}</td>
                        <td className="px-8 py-6 md:py-4 flex gap-1 md:gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-tetClr p-1 rounded-full transition-all duration-200"
                            disabled={isSubmitting}
                          >
                            <FaEdit size={14} md:size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-tetClr p-1 rounded-full transition-all duration-200"
                            disabled={isSubmitting}
                          >
                            <FaTrash size={14} md:size={16} />
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
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Transaction History</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base text-left text-gray-700 min-w-[800px]">
                <thead className="bg-tetClr/20 text-gray-800">
                  <tr>
                    <th className="px-8 py-6 md:py-4 font-semibold">Name</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Email</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Phone</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Event</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Tickets</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Total (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                      <td className="px-8 py-6 md:py-4 font-medium text-gray-900">{transaction.name}</td>
                      <td className="px-8 py-6 md:py-4 text-gray-600">{transaction.email}</td>
                      <td className="px-8 py-6 md:py-4 text-gray-600">{transaction.phone}</td>
                      <td className="px-8 py-6 md:py-4 font-medium text-tetClr">{transaction.eventName}</td>
                      <td className="px-8 py-6 md:py-4">{transaction.tickets}</td>
                      <td className="px-8 py-6 md:py-4 font-semibold text-tetClr">₦{transaction.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingEvent(null);
                    setFileName('No file chosen');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes size={16} md:size={18} />
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter event name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
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
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Tickets</label>
                  {formData.tickets.map((ticket, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-2 mb-2">
                      <select
                        value={ticket.type}
                        onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                        className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                      >
                        <option value="Regular">Regular</option>
                        <option value="VIP">VIP</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Price"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                        className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                        className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                      />
                      {formData.tickets.length > 1 && (
                        <button
                          onClick={() => removeTicket(index)}
                          className="text-red-500 hover:text-red-600 p-2 rounded-full"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTicket}
                    className="mt-2 text-tetClr hover:text-tetClr/80 flex items-center gap-2 text-sm md:text-base"
                  >
                    <FaPlus size={14} /> Add Another Ticket
                  </button>
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Event Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base"
                  />
                  <span className="text-sm text-gray-400 mt-1">{fileName}</span>
                  {formData.image && formData.image instanceof File && (
                    <img src={URL.createObjectURL(formData.image)} alt="Preview" className="mt-2 w-16 h-16 md:w-20 md:h-20 rounded-md object-cover shadow-sm" />
                  )}
                  {formData.image && typeof formData.image === 'string' && (
                    <img src={formData.image} alt="Preview" className="mt-2 w-16 h-16 md:w-20 md:h-20 rounded-md object-cover shadow-sm" />
                  )}
                </div>
              </div>
              <button
                onClick={handleAddEvent}
                disabled={isSubmitting || !formData.name || !formData.description || !formData.start_date || !formData.end_date || formData.tickets.some(t => !t.type || !t.price || !t.quantity)}
                className="w-full mt-4 md:mt-6 bg-tetClr text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (editingEvent ? 'Updating Event...' : 'Adding Event...') : (editingEvent ? 'Update Event' : 'Add Event')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;