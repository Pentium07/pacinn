import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaTrash } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Subscriber = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscribers = async () => {
    const toastId = toast.loading('Loading subscribers...');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.get(`${API_URL}/api/newsletter`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data.data.data) {
        setSubscribers(response.data.data.data);
        toast.success('Subscribers loaded successfully', { id: toastId });
      } else {
        setSubscribers([]);
        toast.error('Unexpected response structure', { id: toastId });
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err.response || err);
      setError(err.response?.data?.message || err.message || 'Error fetching subscribers');
      setSubscribers([]);
      toast.error(err.response?.data?.message || 'Error fetching subscribers', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    const toastId = toast.loading('Deleting subscriber...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.delete(`${API_URL}/api/newsletter/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSubscribers(subscribers.filter(subscriber => subscriber.id !== id));
        toast.success(response.data.message || 'Subscriber deleted successfully', { id: toastId });
      } else {
        toast.error('Failed to delete subscriber', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subscriber', { id: toastId });
      console.error('Error deleting subscriber:', err.response || err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchSubscribers();
    } else {
      toast.error('Authentication required to view subscribers');
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <div className="w-full mx-auto">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
            Subscriber Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-800 rounded-full animate-pulse"></span>
            View and manage newsletter subscribers
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-600">Loading subscribers...</div>
            ) : error ? (
              <div className="p-6 text-center text-gray-600">{error}</div>
            ) : subscribers.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No subscribers found</div>
            ) : (
              <table className="w-full text-sm md:text-base text-left text-gray-700 min-w-[400px]">
                <thead className="bg-gray-200 text-gray-800">
                  <tr>
                    <th className="px-8 py-6 md:py-4 font-semibold">Email</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Created At</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Updated At</th>
                    <th className="px-8 py-6 md:py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-8 py-6 md:py-4 font-medium text-gray-900">{subscriber.email}</td>
                      <td className="px-8 py-6 md:py-4 text-gray-600">{new Date(subscriber.created_at).toLocaleString()}</td>
                      <td className="px-8 py-6 md:py-4 text-gray-600">{new Date(subscriber.updated_at).toLocaleString()}</td>
                      <td className="px-8 py-6 md:py-4">
                        <button
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                          className="text-red-500 p-1 rounded-full cursor-pointer transition-all duration-200 hover:text-red-600"
                          title="Delete"
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
    </div>
  );
};

export default Subscriber;