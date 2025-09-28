import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaBed, FaEdit, FaTrash, FaPlus, FaTimes, FaToggleOn } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const Room = () => {
  const [apartments, setApartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApartmentModal, setShowApartmentModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apartmentFileInputRef = useRef(null);
  const roomFileInputRef = useRef(null);
  const [apartmentFileName, setApartmentFileName] = useState('No file chosen');
  const [roomFileName, setRoomFileName] = useState('No file chosen');

  const [apartmentFormData, setApartmentFormData] = useState({
    name: '',
    description: '',
    amenities: [],
    address: '',
    price_per_night: '',
    max_guests: '',
    images: [],
    is_available: true,
  });

  const [roomFormData, setRoomFormData] = useState({
    apartment_id: '',
    room_number: '',
    room_type: '',
    description: '',
    price_per_night: '',
    max_guests: '',
    amenities: [],
    images: [],
    is_available: true,
  });

  // Fetch apartments from API
  const fetchApartments = async () => {
    const toastId = toast.loading('Loading apartments...');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/apartments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      let fetchedApartments = [];
      if (Array.isArray(response.data.data?.data)) {
        fetchedApartments = response.data.data.data;
      } else if (Array.isArray(response.data.apartments)) {
        fetchedApartments = response.data.apartments;
      } else if (Array.isArray(response.data.data)) {
        fetchedApartments = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedApartments = response.data;
      }

      setApartments(fetchedApartments);
      toast.success('Apartments loaded successfully', { id: toastId });
    } catch (err) {
      console.error('Error fetching apartments:', err.response || err);
      setError(err.response?.data?.message || err.message || 'Error fetching apartments');
      setApartments([]);
      toast.error(err.response?.data?.message || 'Error fetching apartments', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rooms from API
  const fetchRooms = async () => {
    const toastId = toast.loading('Loading rooms...');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/rooms`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      let fetchedRooms = [];
      if (Array.isArray(response.data.data?.data)) {
        fetchedRooms = response.data.data.data;
      } else if (Array.isArray(response.data.rooms)) {
        fetchedRooms = response.data.rooms;
      } else if (Array.isArray(response.data.data)) {
        fetchedRooms = response.data.data;
      } else if (Array.isArray(response.data)) {
        fetchedRooms = response.data;
      }

      setRooms(fetchedRooms);
      toast.success('Rooms loaded successfully', { id: toastId });
    } catch (err) {
      console.error('Error fetching rooms:', err.response || err);
      setError(err.response?.data?.message || err.message || 'Error fetching rooms');
      setRooms([]);
      toast.error(err.response?.data?.message || 'Error fetching rooms', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchApartments();
      fetchRooms();
    }
  }, []);

  useEffect(() => {
    if (showApartmentModal || showRoomModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showApartmentModal, showRoomModal]);

  const handleApartmentInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'amenities') {
      setApartmentFormData({ ...apartmentFormData, [name]: value ? value.split(',').map(s => s.trim()).filter(s => s) : [] });
    } else if (type === 'checkbox') {
      setApartmentFormData({ ...apartmentFormData, [name]: checked });
    } else {
      setApartmentFormData({ ...apartmentFormData, [name]: value });
    }
  };

  const handleRoomInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'amenities') {
      setRoomFormData({ ...roomFormData, [name]: value ? value.split(',').map(s => s.trim()).filter(s => s) : [] });
    } else if (type === 'checkbox') {
      setRoomFormData({ ...roomFormData, [name]: checked });
    } else {
      setRoomFormData({ ...roomFormData, [name]: value });
    }
  };

  const handleApartmentFileChange = (e) => {
    const files = Array.from(e.target.files);
    setApartmentFormData({ ...apartmentFormData, images: files });
    setApartmentFileName(files.length > 0 ? `${files.length} file(s) selected` : 'No file chosen');
  };

  const handleRoomFileChange = (e) => {
    const files = Array.from(e.target.files);
    setRoomFormData({ ...roomFormData, images: files });
    setRoomFileName(files.length > 0 ? `${files.length} file(s) selected` : 'No file chosen');
  };

  const handleAddApartment = async () => {
    const { name, description, amenities, address, price_per_night, max_guests, images, is_available } = apartmentFormData;

    if (!name || !description || !address || !price_per_night || !max_guests) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseInt(max_guests) < 1) {
      toast.error('Max guests must be at least 1');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      let response;

      // Check if there are NEW files to upload
      const hasNewImages = images.length > 0 && images[0] instanceof File;

      if (hasNewImages) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', name);
        formDataToSend.append('description', description);
        amenities.forEach((amenity, index) => {
          formDataToSend.append(`amenities[${index}]`, amenity);
        });
        formDataToSend.append('address', address);
        formDataToSend.append('price_per_night', parseFloat(price_per_night));
        formDataToSend.append('max_guests', parseInt(max_guests));

        // Append images as 'images[]'
        images.forEach((file) => {
          formDataToSend.append('images[]', file);
        });

        formDataToSend.append('is_available', is_available ? '1' : '0');

        if (editingApartment) {
          formDataToSend.append('_method', 'PUT');
          response = await axios.post(`${API_URL}/api/apartments/${editingApartment.id}`, formDataToSend, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          response = await axios.post(`${API_URL}/api/apartments`, formDataToSend, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else {
        const payload = {
          name,
          description,
          amenities: amenities.length ? amenities : [],
          address,
          price_per_night: parseFloat(price_per_night),
          max_guests: parseInt(max_guests),
          // Don't include images array when editing without new images
          images: editingApartment ? undefined : [],
          is_available,
        };

        if (editingApartment) {
          response = await axios.put(`${API_URL}/api/apartments/${editingApartment.id}`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } else {
          response = await axios.post(`${API_URL}/api/apartments`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        }
      }

      if ((response.status === 200 || response.status === 201) && response.data.data) {
        if (editingApartment) {
          setApartments(apartments.map((apt) => (apt.id === editingApartment.id ? response.data.data : apt)));
          toast.success(response.data.message || 'Apartment updated successfully');
        } else {
          setApartments([...apartments, response.data.data]);
          toast.success(response.data.message || 'Apartment created successfully');
        }

        await fetchApartments();
      } else {
        toast.error('Unexpected response structure');
      }

      setShowApartmentModal(false);
      setEditingApartment(null);
      setApartmentFormData({
        name: '',
        description: '',
        amenities: [],
        address: '',
        price_per_night: '',
        max_guests: '',
        images: [],
        is_available: true,
      });
      setApartmentFileName('No file chosen');
      if (apartmentFileInputRef.current) {
        apartmentFileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error saving apartment:', err.response?.data || err);
      const errorMessage = err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Failed to save apartment');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRoom = async () => {
    const { apartment_id, room_number, room_type, description, price_per_night, max_guests, amenities, images, is_available } = roomFormData;

    if (!apartment_id || !room_number || !room_type || !description || !price_per_night || !max_guests) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseInt(max_guests) < 1) {
      toast.error('Max guests must be at least 1');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      let response;

      // Check if there are NEW files to upload
      const hasNewImages = images.length > 0 && images[0] instanceof File;

      if (hasNewImages) {
        const formDataToSend = new FormData();
        formDataToSend.append('apartment_id', parseInt(apartment_id));
        formDataToSend.append('room_number', room_number);
        formDataToSend.append('room_type', room_type);
        formDataToSend.append('description', description);
        formDataToSend.append('price_per_night', parseFloat(price_per_night));
        formDataToSend.append('max_guests', parseInt(max_guests));
        amenities.forEach((amenity, index) => {
          formDataToSend.append(`amenities[${index}]`, amenity);
        });

        // Append images as 'images[]'
        images.forEach((file) => {
          formDataToSend.append('images[]', file);
        });

        formDataToSend.append('is_available', is_available ? '1' : '0');

        if (editingRoom) {
          formDataToSend.append('_method', 'PUT');
          response = await axios.post(`${API_URL}/api/rooms/${editingRoom.id}`, formDataToSend, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          response = await axios.post(`${API_URL}/api/rooms`, formDataToSend, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else {
        const payload = {
          apartment_id: parseInt(apartment_id),
          room_number,
          room_type,
          description,
          price_per_night: parseFloat(price_per_night),
          max_guests: parseInt(max_guests),
          amenities: amenities.length ? amenities : [],
          // Don't include images array when editing without new images
          images: editingRoom ? undefined : [],
          is_available,
        };

        if (editingRoom) {
          response = await axios.put(`${API_URL}/api/rooms/${editingRoom.id}`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } else {
          response = await axios.post(`${API_URL}/api/rooms`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        }
      }

      if ((response.status === 200 || response.status === 201) && response.data.data) {
        if (editingRoom) {
          setRooms(rooms.map((rm) => (rm.id === editingRoom.id ? response.data.data : rm)));
          toast.success(response.data.message || 'Room updated successfully');
        } else {
          setRooms([...rooms, response.data.data]);
          toast.success(response.data.message || 'Room created successfully');
        }

        await fetchRooms();
      } else {
        toast.error('Unexpected response structure');
      }

      setShowRoomModal(false);
      setEditingRoom(null);
      setRoomFormData({
        apartment_id: '',
        room_number: '',
        room_type: '',
        description: '',
        price_per_night: '',
        max_guests: '',
        amenities: [],
        images: [],
        is_available: true,
      });
      setRoomFileName('No file chosen');
      if (roomFileInputRef.current) {
        roomFileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error saving room:', err.response?.data || err);
      const errorMessage = err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Failed to save room');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditApartment = (apartment) => {
    setEditingApartment(apartment);
    setApartmentFormData({
      name: apartment.name || '',
      description: apartment.description || '',
      amenities: apartment.amenities || [],
      address: apartment.address || '',
      price_per_night: apartment.price_per_night || '',
      max_guests: apartment.max_guests || '',
      images: apartment.images || [],
      is_available: apartment.is_available !== undefined ? apartment.is_available : true,
    });
    setApartmentFileName(apartment.images && apartment.images.length > 0 ? `${apartment.images.length} image(s)` : 'No file chosen');
    setShowApartmentModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      apartment_id: room.apartment_id || '',
      room_number: room.room_number || '',
      room_type: room.room_type || '',
      description: room.description || '',
      price_per_night: room.price_per_night || '',
      max_guests: room.max_guests || '',
      amenities: room.amenities || [],
      images: room.images || [],
      is_available: room.is_available !== undefined ? room.is_available : true,
    });
    setRoomFileName(room.images && room.images.length > 0 ? `${room.images.length} image(s)` : 'No file chosen');
    setShowRoomModal(true);
  };

  const handleDeleteApartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this apartment?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/apartments/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setApartments(apartments.filter((apt) => apt.id !== id));
        toast.success(response.data.message || 'Apartment deleted successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete apartment');
      console.error('Error deleting apartment:', err.response || err);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/rooms/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setRooms(rooms.filter((rm) => rm.id !== id));
        toast.success(response.data.message || 'Room deleted successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete room');
      console.error('Error deleting room:', err.response || err);
    }
  };

  const handleToggleApartmentAvailable = async (id, currentAvailable) => {
    const newAvailable = !currentAvailable;
    const action = newAvailable ? 'Enabling' : 'Disabling';
    const toastId = toast.loading(`${action} availability...`);

    setApartments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, is_available: newAvailable } : apt
      )
    );

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/apartments/${id}`,
        { is_available: newAvailable },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.data) {
        setApartments((prev) =>
          prev.map((apt) =>
            apt.id === id ? response.data.data : apt
          )
        );
        toast.success(response.data.message || `Availability ${action.toLowerCase()}d successfully`, { id: toastId });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error(`Error ${action.toLowerCase()} availability:`, err.response || err);
      setApartments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, is_available: currentAvailable } : apt
        )
      );
      toast.error(err.response?.data?.message || `Failed to ${action.toLowerCase()} availability`, { id: toastId });
    }
  };

  const handleToggleRoomAvailable = async (id, currentAvailable) => {
    const newAvailable = !currentAvailable;
    const action = newAvailable ? 'Enabling' : 'Disabling';
    const toastId = toast.loading(`${action} availability...`);

    setRooms((prev) =>
      prev.map((rm) =>
        rm.id === id ? { ...rm, is_available: newAvailable } : rm
      )
    );

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/rooms/${id}`,
        { is_available: newAvailable },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data.data) {
        setRooms((prev) =>
          prev.map((rm) =>
            rm.id === id ? response.data.data : rm
          )
        );
        toast.success(response.data.message || `Availability ${action.toLowerCase()}d successfully`, { id: toastId });
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error(`Error ${action.toLowerCase()} availability:`, err.response || err);
      setRooms((prev) =>
        prev.map((rm) =>
          rm.id === id ? { ...rm, is_available: currentAvailable } : rm
        )
      );
      toast.error(err.response?.data?.message || `Failed to ${action.toLowerCase()} availability`, { id: toastId });
    }
  };

  const formatAmenities = (amenities) => {
    if (!amenities || !Array.isArray(amenities)) return 'No amenities';
    return amenities.join(', ');
  };

  return (
    <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-tetClr">
            Room Management
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-tetClr rounded-full animate-pulse"></span>
            Manage apartments and rooms
          </p>
        </div>

        {/* Apartments Management Section */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Available Apartments</h2>
            <button
              onClick={() => {
                setEditingApartment(null);
                setApartmentFormData({
                  name: '',
                  description: '',
                  amenities: [],
                  address: '',
                  price_per_night: '',
                  max_guests: '',
                  images: [],
                  is_available: true,
                });
                setApartmentFileName('No file chosen');
                if (apartmentFileInputRef.current) {
                  apartmentFileInputRef.current.value = '';
                }
                setShowApartmentModal(true);
              }}
              className="bg-tetClr text-white px-4 py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg w-full md:w-auto"
            >
              <FaPlus /> Add Apartment
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-600">Loading apartments...</div>
              ) : error ? (
                <div className="p-6 text-center text-gray-600">{error}</div>
              ) : apartments.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No apartments found</div>
              ) : (
                <table className="w-full text-xs md:text-sm text-left text-gray-700 min-w-[600px]">
                  <thead className="bg-tetClr/20 text-gray-800">
                    <tr>
                      <th className="p-6 font-semibold">Image</th>
                      <th className="p-6 font-semibold">Name</th>
                      <th className="p-6 font-semibold">Description</th>
                      <th className="p-6 font-semibold">Price (₦/night)</th>
                      <th className="p-6 font-semibold">Available</th>
                      <th className="p-6 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apartments.map((apartment) => (
                      <tr key={apartment.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                        {console.log("Apartment images:", apartment.images)}

                        <td className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4">
                          {Array.isArray(apartment.images) && apartment.images.length > 0 ? (
                            <img
                              src={`${STORAGE_BASE_URL}/${apartment.images[0].replace(/^\/storage\//, "")}`}
                              alt={apartment.name}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                              No Image
                            </div>
                          )}
                        </td>


                        <td className="p-6 font-medium text-gray-900">{apartment.name}</td>
                        <td className="p-6 text-gray-600 max-w-[120px] md:max-w-[200px] truncate">{apartment.description}</td>
                        <td className="p-6 font-semibold text-tetClr">₦{apartment.price_per_night?.toLocaleString()}</td>
                        <td className="p-6">{apartment.is_available ? 'Yes' : 'No'}</td>
                        <td className="p-6 flex justify-center items-center gap-1 md:gap-2">
                          <button
                            onClick={() => handleEditApartment(apartment)}
                            className="text-tetClr p-1 rounded-full transition-all duration-200 hover:bg-tetClr/10"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteApartment(apartment.id)}
                            className="text-tetClr p-1 rounded-full transition-all duration-200 hover:bg-tetClr/10"
                          >
                            <FaTrash size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleApartmentAvailable(apartment.id, apartment.is_available)}
                            className={`p-1 rounded-full transition-all duration-200 ${apartment.is_available ? 'text-red-500' : 'text-green-500'} hover:bg-tetClr/10`}
                          >
                            <FaToggleOn size={14} />
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

        {/* Rooms Management Section */}
        <div className="mb-10 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Available Rooms</h2>
            <button
              onClick={() => {
                setEditingRoom(null);
                setRoomFormData({
                  apartment_id: '',
                  room_number: '',
                  room_type: '',
                  description: '',
                  price_per_night: '',
                  max_guests: '',
                  amenities: [],
                  images: [],
                  is_available: true,
                });
                setRoomFileName('No file chosen');
                if (roomFileInputRef.current) {
                  roomFileInputRef.current.value = '';
                }
                setShowRoomModal(true);
              }}
              className="bg-tetClr text-white px-4 py-2 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg w-full md:w-auto"
            >
              <FaPlus /> Add Room
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-gray-600">Loading rooms...</div>
              ) : error ? (
                <div className="p-6 text-center text-gray-600">{error}</div>
              ) : rooms.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No rooms found</div>
              ) : (
                <table className="w-full text-xs md:text-sm text-left text-gray-700 min-w-[600px]">
                  <thead className="bg-tetClr/20 text-gray-800">
                    <tr>
                      <th className="p-6 font-semibold">Image</th>
                      <th className="p-6 font-semibold">Room Number</th>
                      <th className="p-6 font-semibold">Type</th>
                      <th className="p-6 font-semibold">Description</th>
                      <th className="p-6 font-semibold">Price (₦/night)</th>
                      <th className="p-6 font-semibold">Apartment</th>
                      <th className="p-6 font-semibold">Available</th>
                      <th className="p-6 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200">
                        <td className="px-8 md:px-6 py-4 whitespace-nowrap md:py-4">
                          {Array.isArray(room.images) && room.images.length > 0 && typeof room.images[0] === "string" ? (
                            <img
                              src={`${STORAGE_BASE_URL}/${room.images[0].replace(/^\/storage\//, "")}`}
                              alt={room.room_type}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                              No Image
                            </div>
                          )}
                        </td>

                        <td className="p-6 font-medium text-gray-900">{room.room_number}</td>
                        <td className="p-6 font-medium text-gray-900">{room.room_type}</td>
                        <td className="p-6 text-gray-600 max-w-[120px] md:max-w-[200px] truncate">{room.description}</td>
                        <td className="p-6 font-semibold text-tetClr">₦{room.price_per_night?.toLocaleString()}</td>
                        <td className="p-6">{apartments.find((apt) => apt.id === room.apartment_id)?.name || 'Unknown'}</td>
                        <td className="p-6">{room.is_available ? 'Yes' : 'No'}</td>
                        <td className="p-6 flex justify-center items-center gap-1 md:gap-2">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="text-tetClr p-1 rounded-full transition-all duration-200 hover:bg-tetClr/10"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-tetClr p-1 rounded-full transition-all duration-200 hover:bg-tetClr/10"
                          >
                            <FaTrash size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleRoomAvailable(room.id, room.is_available)}
                            className={`p-1 rounded-full transition-all duration-200 ${room.is_available ? 'text-red-500' : 'text-green-500'} hover:bg-tetClr/10`}
                          >
                            <FaToggleOn size={14} />
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

        {/* Add/Edit Apartment Modal */}
        {showApartmentModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-4 md:p-6 overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900">{editingApartment ? 'Edit Apartment' : 'Add New Apartment'}</h3>
                <button
                  onClick={() => {
                    setShowApartmentModal(false);
                    setEditingApartment(null);
                    setApartmentFormData({
                      name: '',
                      description: '',
                      amenities: [],
                      address: '',
                      price_per_night: '',
                      max_guests: '',
                      images: [],
                      is_available: true,
                    });
                    setApartmentFileName('No file chosen');
                    if (apartmentFileInputRef.current) {
                      apartmentFileInputRef.current.value = '';
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Apartment Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter apartment name"
                    value={apartmentFormData.name}
                    onChange={handleApartmentInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter apartment description"
                    value={apartmentFormData.description}
                    onChange={handleApartmentInputChange}
                    rows={3}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                  <input
                    type="text"
                    name="amenities"
                    placeholder="WiFi, Air Conditioning, etc."
                    value={apartmentFormData.amenities.join(', ')}
                    onChange={handleApartmentInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter address"
                    value={apartmentFormData.address}
                    onChange={handleApartmentInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Price per Night (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_night"
                    placeholder="Enter price"
                    value={apartmentFormData.price_per_night}
                    onChange={handleApartmentInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    name="max_guests"
                    placeholder="Enter max guests"
                    value={apartmentFormData.max_guests}
                    onChange={handleApartmentInputChange}
                    min="1"
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs md:text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={apartmentFormData.is_available}
                      onChange={handleApartmentInputChange}
                      className="mr-2"
                    />
                    Available
                  </label>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Apartment Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={apartmentFileInputRef}
                    onChange={handleApartmentFileChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-xs md:text-sm"
                  />
                  <span className="text-xs md:text-sm text-gray-400 mt-1">{apartmentFileName}</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {apartmentFormData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={
                            image instanceof File
                              ? URL.createObjectURL(image)
                              : `${STORAGE_BASE_URL}/${image.replace(/^\/storage\//, "")}`
                          }
                          alt={`Preview ${index}`}
                          className="w-16 h-16 rounded-md object-cover shadow-sm"
                        />

                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddApartment}
                disabled={isSubmitting || !apartmentFormData.name || !apartmentFormData.description || !apartmentFormData.address || !apartmentFormData.price_per_night || !apartmentFormData.max_guests || parseInt(apartmentFormData.max_guests) < 1}
                className="w-full mt-4 md:mt-6 bg-tetClr text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (editingApartment ? 'Updating...' : 'Adding...') : (editingApartment ? 'Update Apartment' : 'Add Apartment')}
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Room Modal */}
        {showRoomModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-4 md:p-6 overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900">{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
                <button
                  onClick={() => {
                    setShowRoomModal(false);
                    setEditingRoom(null);
                    setRoomFormData({
                      apartment_id: '',
                      room_number: '',
                      room_type: '',
                      description: '',
                      price_per_night: '',
                      max_guests: '',
                      amenities: [],
                      images: [],
                      is_available: true,
                    });
                    setRoomFileName('No file chosen');
                    if (roomFileInputRef.current) {
                      roomFileInputRef.current.value = '';
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Apartment</label>
                  <select
                    name="apartment_id"
                    value={roomFormData.apartment_id}
                    onChange={handleRoomInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  >
                    <option value="">Select Apartment</option>
                    {apartments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {apt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    name="room_number"
                    placeholder="Enter room number"
                    value={roomFormData.room_number}
                    onChange={handleRoomInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <input
                    type="text"
                    name="room_type"
                    placeholder="Enter room type"
                    value={roomFormData.room_type}
                    onChange={handleRoomInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter room description"
                    value={roomFormData.description}
                    onChange={handleRoomInputChange}
                    rows={3}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                  <input
                    type="text"
                    name="amenities"
                    placeholder="Queen Bed, En-suite Bathroom, etc."
                    value={roomFormData.amenities.join(', ')}
                    onChange={handleRoomInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Price per Night (₦)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_night"
                    placeholder="Enter price"
                    value={roomFormData.price_per_night}
                    onChange={handleRoomInputChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    name="max_guests"
                    placeholder="Enter max guests"
                    value={roomFormData.max_guests}
                    onChange={handleRoomInputChange}
                    min="1"
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tetClr focus:border-tetClr text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs md:text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={roomFormData.is_available}
                      onChange={handleRoomInputChange}
                      className="mr-2"
                    />
                    Available
                  </label>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Room Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={roomFileInputRef}
                    onChange={handleRoomFileChange}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-xs md:text-sm"
                  />
                  <span className="text-xs md:text-sm text-gray-400 mt-1">{roomFileName}</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {roomFormData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image instanceof File ? URL.createObjectURL(image) : `${STORAGE_BASE_URL}/${image}`}
                          alt={`Preview ${index}`}
                          className="w-16 h-16 rounded-md object-cover shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddRoom}
                disabled={isSubmitting || !roomFormData.apartment_id || !roomFormData.room_number || !roomFormData.room_type || !roomFormData.description || !roomFormData.price_per_night || !roomFormData.max_guests || parseInt(roomFormData.max_guests) < 1}
                className="w-full mt-4 md:mt-6 bg-tetClr text-white py-2 md:py-3 rounded-lg font-semibold hover:bg-tetClr/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (editingRoom ? 'Updating...' : 'Adding...') : (editingRoom ? 'Update Room' : 'Add Room')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;