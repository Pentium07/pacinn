import React, { useState, useEffect } from 'react';
import { FaBed, FaEdit, FaTrash, FaPlus, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaMoneyBillWave, FaTimes } from 'react-icons/fa';

const Room = () => {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'Luxury King Suite',
      description: 'Spacious suite with king bed, panoramic city views, and premium amenities.',
      price: 50000,
      image: '/images/luxury-king-suite.jpg',
    },
    {
      id: 2,
      name: 'Executive Ocean View',
      description: 'Elegant room with breathtaking ocean views and a private balcony.',
      price: 75000,
      image: '/images/executive-ocean-view.jpg',
    },
    {
      id: 3,
      name: 'Presidential Penthouse',
      description: 'The ultimate luxury experience with private terrace and personalized butler service.',
      price: 150000,
      image: '/images/presidential-penthouse.jpg',
    },
    {
      id: 4,
      name: 'Deluxe Garden Room',
      description: 'Tranquil room opening to our curated gardens with a relaxing atmosphere.',
      price: 40000,
      image: '/images/deluxe-garden-room.jpg',
    },
    {
      id: 5,
      name: 'Family Connector Suite',
      description: 'Perfect for families with connecting rooms and child-friendly amenities.',
      price: 90000,
      image: '/images/family-connector-suite.jpg',
    },
    {
      id: 6,
      name: 'Business Class Room',
      description: 'Designed for the modern traveler with ergonomic workspace and high-speed internet.',
      price: 45000,
      image: '/images/business-class-room.jpg',
    },
  ]);

  const [bookingsHistory, setBookingsHistory] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+234 98765 43210',
      roomName: 'Luxury King Suite',
      checkInDate: '2025-09-10',
      checkOutDate: '2025-09-15',
      duration: '5 nights',
      totalPrice: 250000,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+234 87654 32109',
      roomName: 'Executive Ocean View',
      checkInDate: '2025-09-12',
      checkOutDate: '2025-09-18',
      duration: '6 nights',
      totalPrice: 450000,
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+234 76543 21098',
      roomName: 'Presidential Penthouse',
      checkInDate: '2025-09-11',
      checkOutDate: '2025-09-14',
      duration: '3 nights',
      totalPrice: 450000,
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+234 65432 10987',
      roomName: 'Deluxe Garden Room',
      checkInDate: '2025-09-13',
      checkOutDate: '2025-09-20',
      duration: '7 nights',
      totalPrice: 280000,
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '+234 54321 09876',
      roomName: 'Family Connector Suite',
      checkInDate: '2025-09-14',
      checkOutDate: '2025-09-16',
      duration: '2 nights',
      totalPrice: 180000,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '' });

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

  const totalBookings = bookingsHistory.length;
  const totalAmount = bookingsHistory.reduce((sum, booking) => sum + booking.totalPrice, 0);

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

  const handleAddRoom = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.image) {
      alert('Please fill in all fields');
      return;
    }
    if (editingRoom) {
      setRooms(rooms.map((room) => (room.id === editingRoom.id ? { ...formData, id: editingRoom.id, price: parseInt(formData.price) } : room)));
    } else {
      const newRoom = { id: Date.now(), ...formData, price: parseInt(formData.price) };
      setRooms([...rooms, newRoom]);
    }
    setShowModal(false);
    setEditingRoom(null);
    setFormData({ name: '', description: '', price: '', image: '' });
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setFormData({ name: room.name, description: room.description, price: room.price, image: room.image });
    setShowModal(true);
  };

  const handleDeleteRoom = (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter((room) => room.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-tetClr">
            Room Management
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-tetClr rounded-full animate-pulse"></span>
            Manage rooms and view booking transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 md:mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Total Bookings Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Total Bookings</h3>
              <p className="text-2xl md:text-3xl font-bold text-tetClr">{totalBookings.toLocaleString()}</p>
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

        {/* Rooms Management Section */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Available Rooms</h2>
            <button
              onClick={() => {
                setEditingRoom(null);
                setFormData({ name: '', description: '', price: '', image: '' });
                setShowModal(true);
              }}
              className="bg-tetClr text-white px-4 py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg w-full md:w-auto"
            >
              <FaPlus /> Add Room
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm text-left text-gray-700 min-w-[600px]">
                <thead className="bg-tetClr/20 text-gray-800">
                  <tr>
                    <th className="p-6 font-semibold">Image</th>
                    <th className="p-6 font-semibold">Name</th>
                    <th className="p-6 font-semibold">Description</th>
                    <th className="p-6 font-semibold">Price (₦/night)</th>
                    <th className="p-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                      <td className="p-6">
                        <img src={room.image} alt={room.name} className="w-10 h-10 md:w-12 md:h-12 rounded-md object-cover shadow-sm" />
                      </td>
                      <td className="p-6 font-medium text-gray-900">{room.name}</td>
                      <td className="p-6 text-gray-600 max-w-[120px] md:max-w-[200px] truncate">{room.description}</td>
                      <td className="p-6 font-semibold text-tetClr">₦{room.price.toLocaleString()}</td>
                      <td className="p-6 flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="text-tetClr p-1 rounded-full transition-all duration-200"
                        >
                          <FaEdit size={14} md:size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
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
              <table className="w-full text-xs md:text-sm text-left text-gray-700">
                <thead className="bg-tetClr/20 text-gray-800">
                  <tr>
                    <th className="p-6 font-semibold">Name</th>
                    <th className="p-6 font-semibold">Email</th>
                    <th className="p-6 font-semibold">Phone</th>
                    <th className="p-6 font-semibold">Room</th>
                    <th className="p-6 font-semibold">Check-in</th>
                    <th className="p-6 font-semibold">Check-out</th>
                    <th className="p-6 font-semibold">Duration</th>
                    <th className="p-6 font-semibold">Total (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsHistory.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                      <td className="p-6 font-medium text-gray-900">{booking.name}</td>
                      <td className="p-6 text-gray-600">{booking.email}</td>
                      <td className="p-6 text-gray-600">{booking.phone}</td>
                      <td className="p-6 font-medium text-tetClr">{booking.roomName}</td>
                      <td className="p-6">{booking.checkInDate}</td>
                      <td className="p-6">{booking.checkOutDate}</td>
                      <td className="p-6">{booking.duration}</td>
                      <td className="p-6 font-semibold text-tetClr">₦{booking.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Room Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900">{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingRoom(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes size={16} md:size={18} />
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter room name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter room description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Price (₦/night)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Room Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-xs md:text-sm"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="mt-2 w-16 h-16 md:w-20 md:h-20 rounded-md object-cover shadow-sm" />
                  )}
                </div>
              </div>
              <button
                onClick={handleAddRoom}
                disabled={!formData.name || !formData.description || !formData.price || !formData.image}
                className="w-full mt-4 md:mt-6 bg-tetClr text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;