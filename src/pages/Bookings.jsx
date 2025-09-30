import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { MdHotelClass } from "react-icons/md";
import { FaBed, FaShower, FaRulerCombined, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaTimes, FaStar, FaWifi, FaCoffee, FaTv, FaSnowflake, FaParking, FaSearch, FaFilter, FaComment, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import assets from '../assets/assests';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const Bookings = () => {
  const [apartments, setApartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingType, setBookingType] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [totalGuests, setTotalGuests] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    console.log('Bookings component mounted');
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (showBookingModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [showBookingModal]);

  const fetchApartments = async (filters = {}) => {
    console.log('Fetching apartments with filters:', filters);
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        available: true,
        ...filters
      });
      const response = await axios.get(`${API_URL}/api/public/apartments?${params}`);
      const fetchedApartments = response.data.data?.data || response.data.data || response.data || [];
      console.log('Fetched apartments:', fetchedApartments);
      setApartments(fetchedApartments);
      setImageIndices(prev => ({
        ...prev,
        ...fetchedApartments.reduce((acc, apt) => ({ ...acc, [`apt-${apt.id}`]: 0 }), {})
      }));
    } catch (err) {
      console.error('Error fetching apartments:', err);
      setError(err.response?.data?.message || 'Error fetching apartments');
      toast.error('Failed to load apartments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async (filters = {}) => {
    console.log('Fetching rooms with filters:', filters);
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        available: true,
        ...filters
      });
      const response = await axios.get(`${API_URL}/api/public/rooms?${params}`);
      const fetchedRooms = response.data.data?.data || response.data.data || response.data || [];
      console.log('Fetched rooms:', fetchedRooms);
      setRooms(fetchedRooms);
      setImageIndices(prev => ({
        ...prev,
        ...fetchedRooms.reduce((acc, room) => ({ ...acc, [`room-${room.id}`]: 0 }), {})
      }));
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.response?.data?.message || 'Error fetching rooms');
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const searchApartments = () => {
    const filters = {};
    if (minPrice) filters.min_price = minPrice;
    if (maxPrice) filters.max_price = maxPrice;
    fetchApartments(filters);
  };

  const filterRooms = () => {
    const filters = {};
    if (minPrice) filters.min_price = minPrice;
    if (maxPrice) filters.max_price = maxPrice;
    fetchRooms(filters);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    fetchApartments();
    fetchRooms();
  };

  const handleBook = (item, type) => {
    setSelectedItem(item);
    setBookingType(type);
    setTotalGuests(item.max_guests || 1);
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (isBooking) {
      return null;
    }
    if (!name || !phone || !email || !checkInDate || !checkOutDate || !totalGuests) {
      toast.error('Please fill in all required fields');
      return null;
    }
    setIsBooking(true);

    try {
      const payload = bookingType === 'apartment' ? {
        apartment_id: selectedItem.id,
        guest_name: name,
        guest_email: email,
        guest_phone: phone,
        total_guests: totalGuests,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        booking_type: 'apartment',
        special_requests: specialRequests
      } : {
        booking_type: 'room',
        apartment_id: selectedItem.apartment_id,
        room_ids: [selectedItem.id],
        guest_name: name,
        guest_email: email,
        guest_phone: phone,
        total_guests: totalGuests,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        special_requests: specialRequests,
        room_guests: [totalGuests]
      };

      const response = await axios.post(`${API_URL}/api/public/bookings`, payload);
      return response.data.data.id;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
      return null;
    } finally {
      setIsBooking(false);
    }
  };

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) {
      return 0;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const price = parseFloat(selectedItem?.price_per_night || 0);
    return nights * price;
  };

  const totalNights = () => {
    if (!checkInDate || !checkOutDate) {
      return 0;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  };

  const handleProceed = async () => {
    if (!name || !phone || !email || !checkInDate || !checkOutDate || !totalGuests) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsPaymentLoading(true);

    const bookingId = await submitBooking();
    if (!bookingId) {
      setIsPaymentLoading(false);
      return;
    }

    try {
      const paymentPayload = {
        amount: calculateTotal(),
        payment_method: 'paystack'
      };
      const response = await axios.post(`${API_URL}/api/public/bookings/${bookingId}/payment`, paymentPayload);

      const { authorization_url } = response.data;
      if (authorization_url) {
        window.location.href = authorization_url;
      } else {
        toast.error('Failed to initialize payment');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setIsPaymentLoading(false);
    }
  };

const changeImage = (id, type, direction) => {
  const key = type === "room" ? `room-${id}` : `apt-${id}`;
  setImageIndices(prev => {
    const currentIndex = prev[key] || 0;
    const images = type === "room"
      ? rooms.find(r => r.id === id)?.images || []
      : apartments.find(a => a.id === id)?.images || [];

    if (images.length <= 1) return prev;

    const maxIndex = images.length - 1;
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex > maxIndex) newIndex = 0;
    if (newIndex < 0) newIndex = maxIndex;

    console.log(`Changing image for ${key}: ${currentIndex} -> ${newIndex}, Image: ${images[newIndex]}`);
    return { ...prev, [key]: newIndex };
  });
};

  useEffect(() => {
    const init = {};
    rooms.forEach(r => { init[`room-${r.id}`] = 0; });
    apartments.forEach(a => { init[`apartment-${a.id}`] = 0; });
    console.log('Initializing image indices:', init);
    setImageIndices(init);
  }, [rooms, apartments]);

  const amenityIcons = {
    WiFi: <FaWifi className="w-3 h-3" />,
    'Air Conditioning': <FaSnowflake className="w-3 h-3" />,
    Kitchen: <FaCoffee className="w-3 h-3" />,
    Balcony: <FaRulerCombined className="w-3 h-3" />,
    'City View': <FaStar className="w-3 h-3" />,
    Parking: <FaParking className="w-3 h-3" />,
    TV: <FaTv className="w-3 h-3" />,
    Shower: <FaShower className="w-3 h-3" />,
    'Queen Bed': <FaBed className="w-3 h-3" />,
    'King Bed': <FaBed className="w-3 h-3" />
  };

  const handleCalendarClick = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.focus();
      input.click();
    }
  };

  useEffect(() => {
    fetchApartments();
    fetchRooms();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-tetClr mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading accommodations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-tetClr text-white px-6 py-2 rounded-lg hover:bg-tetClr/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col">
        <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <img
            src={assets.bg}
            alt="Bookings Background"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-pryClr/70 bg-gradient-to-r from-pryClr via-pryClr/70 to-pryClr/20"></div>
          <div className="relative z-10 w-[90%] mx-auto text-center animate-fadeIn flex flex-col gap-4 md:gap-8 mt-8">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
              Book Your <span className="text-secClr">Stay</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Reserve your luxury apartment or room at Pac Inn Hotel for a comfortable and memorable experience.
            </p>
          </div>
        </div>

        <div className="w-full py-12 md:py-20 bg-gradient-to-b from-white to-teal-50">
          <div className="w-[90%] mx-auto max-w-7xl">
            <div className="text-center mb-10 md:mb-12">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-trdClr tracking-tight">Luxury Accommodations</h1>
              <p className="mt-4 text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover our exquisite collection of apartments and rooms, each designed to provide an unforgettable experience of comfort and luxury.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaSearch className="w-5 h-5" />
                Search Rooms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Min Price (₦)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Max Price (₦)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={filterRooms}
                    className="flex-1 bg-tetClr text-white py-3 px-4 rounded-lg font-semibold hover:bg-tetClr/80 transition-colors flex items-center gap-2 justify-center"
                  >
                    <FaFilter className="w-4 h-4" />
                    Search
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {rooms.length === 0 ? (
                <div className="col-span-full text-center text-gray-600 py-8">
                  No rooms found.
                </div>
              ) : (
                rooms.map((room) => {
                  const currentImageIndex = imageIndices[`room-${room.id}`] || 0;
                  const currentImage = Array.isArray(room.images) && room.images.length > 0 ? room.images[currentImageIndex] : '';
                  console.log(`Rendering room ${room.id}, image index: ${currentImageIndex}, image: ${currentImage}`);
                  return (
                    <div
                      key={room.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="relative">
                        {currentImage ? (
                          <div className="relative">
                            <img
                              src={`${STORAGE_BASE_URL}/${currentImage.replace(/^\/storage\//, "")}`}
                              alt={room.room_type || 'Room'}
                              className="w-full h-48 md:h-72 object-cover"
                              key={`room-${room.id}-${currentImageIndex}`}
                              onError={() => console.error(`Failed to load image for room ${room.id}: ${currentImage}`)}
                              loading="lazy"
                            />
                            {Array.isArray(room.images) && room.images.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeImage(room.id, 'room', 'prev');
                                  }}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                  <FaChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeImage(room.id, 'room', 'next');
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                  <FaChevronRight className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-48 md:h-56 bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-tetClr text-white py-1 px-3 rounded-full font-semibold text-base">
                          ₦{parseFloat(room.price_per_night || 0).toLocaleString('en-NG')}
                        </div>
                        {room.is_available && (
                          <div className="absolute top-4 left-4 bg-green-500 text-white py-1 px-3 rounded-full font-semibold text-base">
                            Available
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{room.room_type || 'Room'}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{room.description || 'No description available'}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {Array.isArray(room.amenities) && room.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="flex items-center gap-1 text-base bg-gray-100 px-2 py-1 rounded-full">
                              {amenityIcons[amenity] || <FaBed className="w-3 h-3" />}
                              {amenity}
                            </span>
                          ))}
                          {Array.isArray(room.amenities) && room.amenities.length > 4 && (
                            <span className="text-base text-gray-500">+{room.amenities.length - 4} more</span>
                          )}
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                          <FaUser className="w-4 h-4 mr-2" />
                          Up to {room.max_guests || 1} guests
                        </div>

                        <button
                          onClick={() => handleBook(room, 'room')}
                          disabled={isBooking}
                          className="w-full bg-tetClr text-white py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBooking ? 'Booking...' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaSearch className="w-5 h-5" />
                Search Apartments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Min Price (₦)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-1">Max Price (₦)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={searchApartments}
                    className="flex-1 bg-tetClr text-white py-3 px-4 rounded-lg font-semibold hover:bg-tetClr/80 transition-colors flex items-center gap-2 justify-center"
                  >
                    <FaFilter className="w-4 h-4" />
                    Search
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {apartments.length === 0 ? (
                <div className="col-span-full text-center text-gray-600 py-8">
                  No apartments found.
                </div>
              ) : (
                apartments.map((apartment) => {
                  const currentImageIndex = imageIndices[`apt-${apartment.id}`] || 0;
                  const currentImage = Array.isArray(apartment.images) && apartment.images.length > 0 ? apartment.images[currentImageIndex] : '';
                  console.log(`Rendering apartment ${apartment.id}, image index: ${currentImageIndex}, image: ${currentImage}`);
                  return (
                    <div
                      key={apartment.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="relative">
                        {currentImage ? (
                          <div className="relative">
                            <img
                              src={`${STORAGE_BASE_URL}/${currentImage.replace(/^\/storage\//, "")}`}
                              alt={apartment.name || 'Apartment'}
                              className="w-full h-48 md:h-72 object-cover"
                              key={`apt-${apartment.id}-${currentImageIndex}`}
                              onError={() => console.error(`Failed to load image for apartment ${apartment.id}: ${currentImage}`)}
                              loading="lazy"
                            />
                            {Array.isArray(apartment.images) && apartment.images.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeImage(apartment.id, 'apartment', 'prev');
                                  }}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                  <FaChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeImage(apartment.id, 'apartment', 'next');
                                  }}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                >
                                  <FaChevronRight className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-48 md:h-56 bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-tetClr text-white py-1 px-3 rounded-full font-semibold text-base">
                          ₦{parseFloat(apartment.price_per_night || 0).toLocaleString('en-NG')}
                        </div>
                        {apartment.is_available && (
                          <div className="absolute top-4 left-4 bg-green-500 text-white py-1 px-3 rounded-full font-semibold text-base">
                            Available
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{apartment.name || 'Apartment'}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{apartment.description || 'No description available'}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {Array.isArray(apartment.amenities) && apartment.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="flex items-center gap-1 text-base bg-gray-100 px-2 py-1 rounded-full">
                              {amenityIcons[amenity] || <MdHotelClass className="w-3 h-3" />}
                              {amenity}
                            </span>
                          ))}
                          {Array.isArray(apartment.amenities) && apartment.amenities.length > 4 && (
                            <span className="text-base text-gray-500">+{apartment.amenities.length - 4} more</span>
                          )}
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                          <FaUser className="w-4 h-4 mr-2" />
                          Up to {apartment.max_guests || 1} guests
                        </div>

                        <button
                          onClick={() => handleBook(apartment, 'apartment')}
                          disabled={isBooking}
                          className="w-full bg-tetClr text-white py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBooking ? 'Booking...' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      {showBookingModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto flex flex-col my-4 sm:my-8">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {bookingType === 'room' ? selectedItem.room_type : selectedItem.name}
              </h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedItem(null);
                  setBookingType(null);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setCheckInDate('');
                  setCheckOutDate('');
                  setSpecialRequests('');
                  setTotalGuests(1);
                }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="flex flex-col p-4 sm:p-6 space-y-6">
              <div className="space-y-4">
                {Array.isArray(selectedItem.images) && selectedItem.images.length > 0 ? (
                  <img
                    src={`${STORAGE_BASE_URL}/${selectedItem.images[0].replace(/^\/storage\//, "")}`}
                    alt={bookingType === 'room' ? selectedItem.room_type : selectedItem.name}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md"
                    onError={() => console.error(`Failed to load image for ${bookingType} ${selectedItem.id}: ${selectedItem.images[0]}`)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg shadow-md">
                    No Image
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-700">Price per night</span>
                    <span className="font-semibold text-tetClr">₦{parseFloat(selectedItem.price_per_night || 0).toLocaleString('en-NG')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-700">Max guests</span>
                    <span className="font-semibold text-tetClr">Up to {selectedItem.max_guests || 1}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedItem.amenities) && selectedItem.amenities.map((amenity, index) => (
                      <span key={index} className="flex items-center gap-1 text-base bg-gray-100 px-2 py-1 rounded-full">
                        {amenityIcons[amenity] || <FaBed className="w-3 h-3" />}
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Complete Your Booking</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700 mb-1">Check-in Date</label>
                    <input
                      id="checkInDate"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                    />
                    <button
                      type="button"
                      onClick={() => handleCalendarClick('checkInDate')}
                      className="absolute right-3 top-10 text-gray-400 hover:text-tetClr"
                    >
                      <FaCalendarAlt />
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700 mb-1">Check-out Date</label>
                    <input
                      id="checkOutDate"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                    />
                    <button
                      type="button"
                      onClick={() => handleCalendarClick('checkOutDate')}
                      className="absolute right-3 top-10 text-gray-400 hover:text-tetClr"
                    >
                      <FaCalendarAlt />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                    />
                    <FaUser className="absolute right-3 top-10 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                      />
                      <FaPhone className="absolute right-3 top-10 text-gray-400" />
                    </div>

                    <div className="relative">
                      <label className="block text-base font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                      />
                      <FaEnvelope className="absolute right-3 top-10 text-gray-400" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-base font-medium text-gray-700 mb-1">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Enter any special requests"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr"
                      rows="3"
                    />
                    <FaComment className="absolute right-3 top-10 text-gray-400" />
                  </div>
                </div>

                {checkInDate && checkOutDate && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">₦{parseFloat(selectedItem.price_per_night || 0).toLocaleString('en-NG')} x {totalNights()} night(s)</span>
                        <span className="font-semibold">₦{calculateTotal().toLocaleString('en-NG')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span className="text-lg font-bold text-tetClr">₦{calculateTotal().toLocaleString('en-NG')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={handleProceed}
                    disabled={isBooking || !checkInDate || !checkOutDate || !name || !phone || !email || !totalGuests || isPaymentLoading}
                    className="w-full bg-tetClr text-white py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isPaymentLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                </div>

                <p className="text-base text-gray-500 text-center mt-4">
                  By proceeding, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Bookings;