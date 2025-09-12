import React, { useState, useEffect } from 'react';
import { FaBed, FaShower, FaRulerCombined, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaMoneyBillWave, FaTimes, FaStar, FaWifi, FaCoffee, FaTv, FaSnowflake, FaParking } from 'react-icons/fa';

const Bookings = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');


    useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedRoom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedRoom]);

  const rooms = [
    {
      id: 1,
      name: "Luxury King Suite",
      description: "Spacious suite with king bed, panoramic city views, and premium amenities.",
      price: 5000,
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",

    },
    {
      id: 2,
      name: "Executive Ocean View",
      description: "Elegant room with breathtaking ocean views and a private balcony.",
      price: 7500,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",

    },
    {
      id: 3,
      name: "Presidential Penthouse",
      description: "The ultimate luxury experience with private terrace and personalized butler service.",
      price: 15000,
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",

    },
    {
      id: 4,
      name: "Deluxe Garden Room",
      description: "Tranquil room opening to our curated gardens with a relaxing atmosphere.",
      price: 4000,
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
   
    },
    {
      id: 5,
      name: "Family Connector Suite",
      description: "Perfect for families with connecting rooms and child-friendly amenities.",
      price: 9000,
      image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",

    },
    {
      id: 6,
      name: "Business Class Room",
      description: "Designed for the modern traveler with ergonomic workspace and high-speed internet.",
      price: 4500,
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",

    }
  ];

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !selectedRoom) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights * selectedRoom.price;
  };

  const handleBook = (room) => {
    setSelectedRoom(room);
    setCheckInDate('');
    setCheckOutDate('');
    setName('');
    setPhone('');
    setEmail('');
  };

  const handleProceed = () => {
    alert(`Booking confirmed for ${selectedRoom.name}! Total: ₹${calculateTotal()}`);
    setSelectedRoom(null);
  };

  const totalNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };



  return (
    <div className="min-h-screen bg-trdClr/15 py-12 w-full pt-26">
      <div className="w-[90%] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Luxury Accommodations</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our exquisite collection of rooms and suites, each designed to provide an unforgettable experience of comfort and luxury.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute top-4 right-4 bg-tetClr text-white py-1 px-3 rounded-full font-semibold text-sm">
                  ₹{room.price.toLocaleString('en-IN')}/night
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>
                
             
                
                <button 
                  onClick={() => handleBook(room)}
                  className="w-full bg-tetClr text-white py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col md:flex-row">
            {/* Left side - Room image and details */}
            <div className="md:w-2/5 bg-gradient-to-b from-amber-50 to-gray-100 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.name}</h2>
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <img 
                src={selectedRoom.image} 
                alt={selectedRoom.name}
                className="w-full h-full object-cover rounded-lg mb-4 shadow-md"
              />
              
           
             
            </div>
            
            {/* Right side - Booking form */}
            <div className="md:w-3/5 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Your Booking</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    {/* <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" /> */}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    {/* <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" /> */}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <FaUser className="absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4  ">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <FaPhone className="absolute right-3 top-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <FaEnvelope className="absolute right-3 top-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              {checkInDate && checkOutDate && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">₹{selectedRoom.price.toLocaleString('en-IN')} x {totalNights()} night(s)</span>
                      <span className="font-semibold">₹{(selectedRoom.price * totalNights()).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                      <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                      <span className="text-lg font-bold text-amber-700">₹{calculateTotal().toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleProceed}
                disabled={!checkInDate || !checkOutDate || !name || !phone || !email}
                className="w-full bg-tetClr text-white py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                Proceed to Payment
              </button>
              
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

export default Bookings;