import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaUserCheck, FaUserTimes, FaTrash, FaEye, FaTimes, FaUserTag, FaLock } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const User = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);
  const [roleModal, setRoleModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    const toastId = toast.loading('Loading users...');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.get(`${API_URL}/api/users?t=${Date.now()}`, {
        headers,
        withCredentials: true,
      });

      console.log('Fetch users response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        let fetchedUsers = [];
        if (response.data.success && Array.isArray(response.data.data?.data)) {
          fetchedUsers = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          fetchedUsers = response.data.data;
        } else if (Array.isArray(response.data)) {
          fetchedUsers = response.data;
        } else {
          console.warn('Unexpected response structure, defaulting to empty array');
          fetchedUsers = [];
        }

        const mappedUsers = fetchedUsers.map(user => ({
          ...user,
          status: user.enabled === 1 || user.enabled === true || user.enabled === '1' ? 'active' : 'inactive',
        }));

        setUsers(mappedUsers);
        toast.success('Users loaded successfully', { id: toastId });
      } else {
        setUsers([]);
        toast.error('Unexpected response status', { id: toastId });
      }
    } catch (err) {
      console.error('Error fetching users:', err.response || err);
      const errorMessage =
        err.response?.data?.message === 'Unauthenticated'
          ? 'You are not authenticated. Please log in again.'
          : err.code === 'ERR_NETWORK'
            ? 'Failed to fetch users due to CORS or network issues. Please contact the administrator.'
            : err.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      setUsers([]);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (id) => {
    const toastId = toast.loading('Loading user details...');
    setViewLoading(true);
    setViewError(null);
    setViewUser(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.get(`${API_URL}/api/users/${id}`, {
        headers,
        withCredentials: true,
      });

      console.log('Fetch user details response:', response.data);

      if (response.status === 200) {
        const user = response.data.user || response.data.data || response.data;
        if (user) {
          setViewUser({
            ...user,
            status: user.enabled === 1 || user.enabled === true ? 'active' : 'inactive',
          });
          toast.success('User details loaded successfully', { id: toastId });
        } else {
          throw new Error('Unexpected response structure');
        }
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      console.error('Error fetching user details:', err.response || err);
      const errorMessage =
        err.response?.data?.message === 'Unauthenticated'
          ? 'You are not authenticated. Please log in again.'
          : err.code === 'ERR_NETWORK'
            ? 'Failed to fetch user details due to CORS or network issues. Please contact the administrator.'
            : err.response?.data?.message || 'Failed to fetch user details';
      setViewError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setViewLoading(false);
      setViewModal(true);
    }
  };

  // Enable user
  const enableUser = async (id) => {
    const toastId = toast.loading('Enabling user...');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.put(
        `${API_URL}/api/users/${id}/enable`,
        { enabled: 1 },
        { headers, withCredentials: true }
      );

      console.log('Enable user response:', response.data);

      toast.success(response.data.message || 'User enabled successfully', { id: toastId });

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id ? { ...user, status: 'active', enabled: true } : user
        )
      );
    } catch (err) {
      console.error('Enable user error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to enable user';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // Disable user
  const disableUser = async (id) => {
    const toastId = toast.loading('Disabling user...');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.put(
        `${API_URL}/api/users/${id}/disable`,
        { enabled: 0 },
        { headers, withCredentials: true }
      );

      console.log('Disable user response:', response.data);

      toast.success(response.data.message || 'User disabled successfully', { id: toastId });

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id ? { ...user, status: 'inactive', enabled: false } : user
        )
      );
    } catch (err) {
      console.error('Disable user error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to disable user';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const toastId = toast.loading('Deleting user...');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      await axios.delete(`${API_URL}/api/users/${id}`, {
        headers,
        withCredentials: true,
      });

      toast.success('User deleted successfully', { id: toastId });
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err.response || err);
      const errorMessage =
        err.response?.data?.message === 'Unauthenticated'
          ? 'You are not authenticated. Please log in again.'
          : err.code === 'ERR_NETWORK'
            ? 'Failed to delete user due to CORS or network issues. Please contact the administrator.'
            : err.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // Change user role
  const changeUserRole = async (id) => {
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    if (!window.confirm(`Are you sure you want to change the role to ${newRole}?`)) return;
    const toastId = toast.loading('Changing user role...');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.put(
        `${API_URL}/api/users/${id}/role`,
        { role: newRole },
        { headers, withCredentials: true }
      );

      console.log('Change role response:', response.data);

      toast.success(response.data.message || 'User role changed successfully', { id: toastId });

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === id ? { ...user, role: newRole } : user
        )
      );
      setRoleModal(false);
      setNewRole('');
    } catch (err) {
      console.error('Change role error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change user role';
      toast.error(errorMessage, { id: toastId });
    }
  };

  // Change user password
  const changeUserPassword = async (id) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (!window.confirm('Are you sure you want to change the user password?')) return;
    const toastId = toast.loading('Changing user password...');
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await axios.put(
        `${API_URL}/api/users/${id}/password`,
        { password: newPassword },
        { headers, withCredentials: true }
      );

      console.log('Change password response:', response.data);

      toast.success(response.data.message || 'User password changed successfully', { id: toastId });
      setPasswordModal(false);
      setNewPassword('');
    } catch (err) {
      console.error('Change password error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change user password';
      toast.error(errorMessage, { id: toastId });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (viewModal || roleModal || passwordModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewModal, roleModal, passwordModal]);

// Define all roles your system should support
const availableRoles = ["admin", "user", "receptionist"];




  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 py-12 ">
      <div className="w-[90%] mx-auto ">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-tetClr tracking-tight">
            User Management
          </h1>
          <p className="mt-2 text-base md:text-lg text-gray-600">
            Manage user accounts, roles, and statuses with ease.
          </p>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50">
          <div className="p-6 border-b border-gray-200 bg-tetClr/10">
            <h2 className="text-xl md:text-2xl font-semibold text-trdClr">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-600 animate-pulse">Loading...</div>
            ) : error ? (
              <div className="p-6 text-center text-gray-600">{error}</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No users found</div>
            ) : (
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-tetClr/10 text-trdClr">
                  <tr>
                    <th className="px-4 py-3 font-semibold md:px-6">Username</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Email</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Role</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Status</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-tetClr/5 transition-all duration-200"
                    >
                      <td className="px-4 py-4 md:px-6 font-medium text-gray-900">{user.username}</td>
                      <td className="px-4 py-4 md:px-6">{user.email}</td>
                      <td className="px-4 py-4 md:px-6">{user.role}</td>
                      <td className="px-4 py-4 md:px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 md:px-6 flex space-x-4">
                        {user.status === 'active' ? (
                          <button
                            onClick={() => disableUser(user.id)}
                            className="text-orange-500 hover:text-secClr transform hover:scale-105 transition-all duration-200"
                            title="Disable User"
                          >
                            <FaUserTimes className="text-lg" />
                          </button>
                        ) : (
                          <button
                            onClick={() => enableUser(user.id)}
                            className="text-green-500 hover:text-secClr transform hover:scale-105 transition-all duration-200"
                            title="Enable User"
                          >
                            <FaUserCheck className="text-lg" />
                          </button>
                        )}
                        <button
                          onClick={() => fetchUserDetails(user.id)}
                          className="text-blue-500 hover:text-secClr transform hover:scale-105 transition-all duration-200"
                          title="View User"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setNewRole(user.role);
                            setRoleModal(true);
                          }}
                          className="text-purple-500 hover:text-secClr transform hover:scale-105 transition-all duration-200"
                          title="Change Role"
                        >
                          <FaUserTag className="text-lg" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setPasswordModal(true);
                          }}
                          className="text-teal-500 hover:text-secClr transform hover:scale-105 transition-all duration-200"
                          title="Change Password"
                        >
                          <FaLock className="text-lg" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-500 hover:text-secClr transform hover:scale-105 transition-all duration-200"
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

        {/* View User Modal */}
        {viewModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-6 md:p-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-trdClr">User Details</h3>
                <button
                  onClick={() => {
                    setViewModal(false);
                    setViewUser(null);
                    setViewError(null);
                  }}
                  className="text-gray-500 hover:text-secClr p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              {viewLoading ? (
                <div className="p-6 text-center text-gray-600 animate-pulse">Loading user details...</div>
              ) : viewError ? (
                <div className="p-6 text-center text-gray-600">{viewError}</div>
              ) : viewUser ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm md:text-base font-medium text-trdClr">ID</label>
                    <p className="text-sm md:text-base text-gray-600">{viewUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-trdClr">Username</label>
                    <p className="text-sm md:text-base text-gray-600">{viewUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-trdClr">Email</label>
                    <p className="text-sm md:text-base text-gray-600">{viewUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-trdClr">Role</label>
                    <p className="text-sm md:text-base text-gray-600">{viewUser.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-trdClr">Status</label>
                    <p className="text-sm md:text-base text-gray-600">{viewUser.status === 'active' ? 'Active' : 'Inactive'}</p>
                  </div>
                  {viewUser.created_at && (
                    <div>
                      <label className="block text-sm md:text-base font-medium text-trdClr">Created At</label>
                      <p className="text-sm md:text-base text-gray-600">{new Date(viewUser.created_at).toLocaleString()}</p>
                    </div>
                  )}
                  {viewUser.updated_at && (
                    <div>
                      <label className="block text-sm md:text-base font-medium text-trdClr">Updated At</label>
                      <p className="text-sm md:text-base text-gray-600">{new Date(viewUser.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-600">No user data available</div>
              )}
            </div>
          </div>
        )}

        {/* Change Role Modal */}
        {roleModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[90vw] md:max-w-md p-6 md:p-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-trdClr">Change User Role</h3>
                <button
                  onClick={() => {
                    setRoleModal(false);
                    setNewRole('');
                  }}
                  className="text-gray-500 hover:text-secClr p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm md:text-base font-medium text-trdClr">Select Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tetClr"
                  >
                    <option value="">Select a role</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>

                </div>
                <button
                  onClick={() => changeUserRole(selectedUserId)}
                  className="w-full bg-tetClr text-white py-2 rounded-lg font-semibold hover:bg-secClr transition-all duration-300"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {passwordModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full  p-6 md:p-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-trdClr">Change User Password</h3>
                <button
                  onClick={() => {
                    setPasswordModal(false);
                    setNewPassword('');
                  }}
                  className="text-gray-500 hover:text-secClr p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm md:text-base font-medium text-trdClr">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-2 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tetClr"
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  onClick={() => changeUserPassword(selectedUserId)}
                  className="w-full bg-tetClr text-white py-2 rounded-lg font-semibold hover:bg-secClr transition-all duration-300"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;