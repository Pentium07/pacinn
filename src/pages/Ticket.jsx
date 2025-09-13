import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCheckCircle } from 'react-icons/fa';

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showToaster, setShowToaster] = useState(false);
  const [toasterMessage, setToasterMessage] = useState({ eventName: '', email: '' });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedEvent]);

  const events = [
    {
      id: 1,
      name: "Gala Night Extravaganza",
      subtitle: "An evening of music, dance, and fine dining",
      price: 7000,
      tag: "VIP",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Tech Summit 2025",
      subtitle: "Explore the future of technology with industry leaders",
      price: 4000,
      tag: "Regular",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Art & Wine Festival",
      subtitle: "Celebrate creativity with exclusive wine tastings",
      price: 7000,
      tag: "VIP",
      image: "https://images.unsplash.com/photo-1515161318566-8b875e7a9b23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    },
  ];


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const handleBuy = (event) => {
    setSelectedEvent(event);
    setQuantity(1);
    setName('');
    setEmail('');
    setPhone('');
  };

  const calculateTotal = () => {
    return selectedEvent ? selectedEvent.price * quantity : 0;
  };

  const handleProceed = () => {
    setToasterMessage({ eventName: selectedEvent.name, email });
    setShowToaster(true);
    setTimeout(() => setShowToaster(false), 4000); // Hide toaster after 4 seconds
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-trdClr/15 py-12 w-full pt-26">
      <div className="w-[90%] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Exclusive Events</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join us for unforgettable experiences with our curated selection of premium events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-70 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white text-tetClr py-1 px-3 rounded-full font-semibold text-sm">
                  ₹{event.price.toLocaleString('en-IN')}
                </div>
                <div className="absolute top-4 left-4 bg-tetClr text-white py-1 px-3 rounded-full font-semibold text-sm">
                  {event.tag}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                <p className="text-gray-600 mb-4">{event.subtitle}</p>
                <button
                  onClick={() => handleBuy(event)}
                  className="w-full bg-tetClr text-white py-3 rounded-lg font-semibold hover:bg-tetClr transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/90 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden flex flex-col md:flex-row">
            {/* Left side - Event image and details */}
            <div className="md:w-2/5 bg-tetClr/30 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <img
                src={selectedEvent.image}
                alt={selectedEvent.name}
                className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
              />
              <p className="text-gray-600">{selectedEvent.subtitle}</p>
              <p className="text-lg font-semibold text-pryClr mt-2">
                ₹{selectedEvent.price.toLocaleString('en-IN')} ({selectedEvent.tag})
              </p>
            </div>

            {/* Right side - Booking form */}
            <div className="md:w-3/5 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Your Purchase</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr"
                    />
                    <FaUser className="absolute right-3 top-3 text-gray-400" />
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr"
                    />
                    <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Please ensure your email is correct; tickets will be sent here.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pryClr focus:border-pryClr"
                    />
                    <FaPhone className="absolute right-3 top-3 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tickets</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-tetClr/30 p-4 rounded-lg border border-amber-100 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      ₹{selectedEvent.price.toLocaleString('en-IN')} x {quantity} ticket(s)
                    </span>
                    <span className="font-semibold">
                      ₹{(selectedEvent.price * quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-secClr">
                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-pryClr">
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={!name || !email || !phone || quantity < 1}
                className="w-full bg-pryClr text-white py-3 rounded-lg font-semibold hover:bg-pryClr transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                Pay Now
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Catchy Toaster Notification */}
      {showToaster && (
        <div className="fixed bottom-6 right-6 bg-tetClr text-white py-4 px-6 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce-in max-w-sm z-50">
          <FaCheckCircle size={24} className="text-white" />
          <div>
            <p className="font-bold text-lg">Success!</p>
            <p className="text-sm">Your tickets for {toasterMessage.eventName} will be sent to {toasterMessage.email}!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;