import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaUserCheck, FaUserTimes, FaTrash } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      setUsers(response.data.data || response.data); // Adjust based on API response structure
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  // Enable user
  const enableUser = async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${id}/enable`,
        {},
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      toast.success('User enabled successfully');
      setUsers(users.map(user => user.id === id ? { ...user, status: 'active' } : user));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enable user');
    }
  };

  // Disable user
  const disableUser = async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/users/${id}/disable`,
        {},
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      toast.success('User disabled successfully');
      setUsers(users.map(user => user.id === id ? { ...user, status: 'inactive' } : user));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable user');
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      toast.success('User deleted successfully');
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-tetClr">
            User Management
          </h1>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-tetClr/50">
            <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-600">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No users found</div>
            ) : (
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-tetClr/20 text-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold md:px-6">Username</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Email</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Status</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 md:px-6 font-medium text-gray-900">{user.username}</td>
                      <td className="px-4 py-4 md:px-6">{user.email}</td>
                      <td className="px-4 py-4 md:px-6">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 md:px-6 flex space-x-3">
                        {user.status !== 'active' ? (
                          <button
                            onClick={() => enableUser(user.id)}
                            className="text-tetClr hover:text-tetClr/80"
                            title="Enable User"
                          >
                            <FaUserCheck className="text-lg" />
                          </button>
                        ) : (
                          <button
                            onClick={() => disableUser(user.id)}
                            className="text-orange-500 hover:text-orange-600"
                            title="Disable User"
                          >
                            <FaUserTimes className="text-lg" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete User"
                        >
                          <FaTrash className="text-lg" />
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

export default User;