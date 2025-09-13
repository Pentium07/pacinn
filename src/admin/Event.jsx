import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaTimes } from 'react-icons/fa';

const Event = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      name: 'Gala Night Extravaganza',
      subtitle: 'An evening of music, dance, and fine dining',
      price: 7000,
      tag: 'VIP',
      image: '/images/gala-night.jpg',
    },
    {
      id: 2,
      name: 'Tech Summit 2025',
      subtitle: 'Explore the future of technology with industry leaders',
      price: 4000,
      tag: 'Regular',
      image: '/images/tech-summit.jpg',
    },
    {
      id: 3,
      name: 'Art & Wine Festival',
      subtitle: 'Celebrate creativity with exclusive wine tastings',
      price: 7000,
      tag: 'VIP',
      image: '/images/art-wine.jpg',
    },
  ]);

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

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({ name: '', subtitle: '', price: '', tag: 'Regular', image: '' });

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = () => {
    if (!formData.name || !formData.subtitle || !formData.price || !formData.tag || !formData.image) {
      alert('Please fill in all fields');
      return;
    }
    if (editingEvent) {
      setEvents(events.map((event) => (event.id === editingEvent.id ? { ...formData, id: editingEvent.id, price: parseInt(formData.price) } : event)));
    } else {
      const newEvent = { id: Date.now(), ...formData, price: parseInt(formData.price) };
      setEvents([...events, newEvent]);
    }
    setShowModal(false);
    setEditingEvent(null);
    setFormData({ name: '', subtitle: '', price: '', tag: 'Regular', image: '' });
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({ name: event.name, subtitle: event.subtitle, price: event.price, tag: event.tag, image: event.image });
    setShowModal(true);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((event) => event.id !== id));
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
          {/* Total Tickets Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Total Tickets Sold</h3>
              <p className="text-2xl md:text-3xl font-bold text-tetClr">{totalTickets.toLocaleString()}</p>
            </div>
            <FaCalendarAlt className="text-3xl md:text-4xl text-tetClr" />
          </div>
          {/* Total Amount Card */}
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
                setFormData({ name: '', subtitle: '', price: '', tag: 'Regular', image: '' });
                setShowModal(true);
              }}
              className="bg-tetClr text-white px-4 py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg w-full md:w-auto"
            >
              <FaPlus /> Add Event
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base text-left text-gray-700 min-w-[600px]">
                <thead className="bg-tetClr/20 text-gray-800">
                  <tr>
                    <th className="px-8 py-6 md:py-4 font-semibold">Image</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Name</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Subtitle</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Price (₦)</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Tag</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                      <td className="px-8 py-6 md:py-4">
                        <img src={event.image} alt={event.name} className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover shadow-sm" />
                      </td>
                      <td className="px-8 py-6 md:py-4 font-medium text-gray-900">{event.name}</td>
                      <td className="px-8 py-6 md:py-4 text-gray-600 max-w-[120px] md:max-w-[200px] truncate">{event.subtitle}</td>
                      <td className="px-8 py-6 md:py-4 font-semibold text-tetClr">₦{event.price.toLocaleString()}</td>
                      <td className="px-8 py-6 md:py-4">
                        <span className={`text-sm font-medium ${event.tag === 'VIP' ? 'text-tetClr bg-tetClr/20' : 'text-gray-600 bg-gray-100'} px-2 py-1 rounded-full`}>
                          {event.tag}
                        </span>
                      </td>
                      <td className="px-8 py-6 md:py-4 flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-tetClr p-1 rounded-full  transition-all duration-200"
                        >
                          <FaEdit size={14} md:size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-tetClr p-1 rounded-full transition-all duration-200"
                        >
                          <FaTrash size={14} md:size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Subtitle</label>
                  <textarea
                    name="subtitle"
                    placeholder="Enter event subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Tag</label>
                  <select
                    name="tag"
                    value={formData.tag}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-sm md:text-base"
                  >
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-gray-700 mb-1">Event Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-base"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-2 w-16 h-16 md:w-20 md:h-20 rounded-md object-cover shadow-sm" />
                  )}
                </div>
              </div>
              <button
                onClick={handleAddEvent}
                disabled={!formData.name || !formData.subtitle || !formData.price || !formData.tag || !formData.image}
                className="w-full mt-4 md:mt-6 bg-tetClr text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {editingEvent ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;