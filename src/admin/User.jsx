    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import { toast } from 'sonner';
    import { FaUserCheck, FaUserTimes, FaTrash, FaEye, FaTimes } from 'react-icons/fa';

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const User = () => {
      const [users, setUsers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [viewModal, setViewModal] = useState(false);
      const [viewUser, setViewUser] = useState(null);
      const [viewLoading, setViewLoading] = useState(false);
      const [viewError, setViewError] = useState(null);

      // Fetch all users
      const fetchUsers = async () => {
        const toastId = toast.loading('Loading users...');
        setLoading(true);
        setError(null);

        try {
          const token = localStorage.getItem('token');
          console.log('Token found in localStorage:', token);

          const headers = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await axios.get(`${API_URL}/api/users?t=${Date.now()}`, {
            headers,
            withCredentials: true,
          });

          console.log('Fetch users response:', JSON.stringify(response.data, null, 2));
          console.log('Response data type:', typeof response.data, Array.isArray(response.data));
          console.log('Response data.data type:', typeof response.data.data, Array.isArray(response.data.data));

          // Log enabled status only if response.data.data is an array
          if (Array.isArray(response.data.data)) {
            console.log('Users enabled status:', response.data.data.map(user => ({
              id: user.id,
              username: user.username,
              enabled: user.enabled
            })));
          } else {
            console.log('Users enabled status: Not an array, data:', response.data.data);
          }

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
              status: user.enabled === 1 || user.enabled === true || user.enabled === "1"
                ? "active"
                : "inactive",
            }));



            console.log('Mapped users:', mappedUsers);
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

      const enableUser = async (id) => {
        const toastId = toast.loading("Enabling user...");
        try {
          const token = localStorage.getItem("token");
          console.log("Token for enableUser:", token);

          // ✅ Define headers first
          const headers = {
            "Content-Type": "application/json",
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          // ✅ Now use headers inside axios
          const response = await axios.put(
            `${API_URL}/api/users/${id}/enable`,
            { enabled: 1 }, // some backends ignore this but keep it for safety
            { headers, withCredentials: true }
          );

          console.log("Enable user response:", response.data);

          toast.success(response.data.message || "User enabled successfully", {
            id: toastId,
          });

          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === id ? { ...user, status: "active", enabled: true } : user
            )
          );
        } catch (err) {
          console.error("Enable user error:", err.response?.data || err.message);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to enable user";
          toast.error(errorMessage, { id: toastId });
        }
      };

      const disableUser = async (id) => {
        const toastId = toast.loading("Disabling user...");
        try {
          const token = localStorage.getItem("token");
          console.log("Token for disableUser:", token);

          // ✅ Define headers first
          const headers = {
            "Content-Type": "application/json",
          };
          if (token) headers["Authorization"] = `Bearer ${token}`;

          // ✅ Now use headers inside axios
          const response = await axios.put(
            `${API_URL}/api/users/${id}/disable`,
            { enabled: 0 },
            { headers, withCredentials: true }
          );

          console.log("Disable user response:", response.data);

          toast.success(response.data.message || "User disabled successfully", {
            id: toastId,
          });

          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === id ? { ...user, status: "inactive", enabled: false } : user
            )
          );
        } catch (err) {
          console.error("Disable user error:", err.response?.data || err.message);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to disable user";
          toast.error(errorMessage, { id: toastId });
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
          console.log('Token for fetchUserDetails:', token);

          const headers = {
            'Content-Type': 'application/json',
          };
          if (token) headers['Authorization'] = `Bearer ${token}`;

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

      // Delete user
      const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const toastId = toast.loading('Deleting user...');
        try {
          const token = localStorage.getItem('token');
          console.log('Token for deleteUser:', token);

          const headers = {
            'Content-Type': 'application/json',
          };
          if (token) headers['Authorization'] = `Bearer ${token}`;

          await axios.delete(`${API_URL}/api/users/${id}`, {
            headers,
            withCredentials: true,
          });
          toast.success('User deleted successfully', { id: toastId });
          await fetchUsers(); // Refetch users to ensure consistency
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

      useEffect(() => {
        fetchUsers();
      }, []);

      useEffect(() => {
        if (viewModal) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'unset';
        }
        return () => {
          document.body.style.overflow = 'unset';
        };
      }, [viewModal]);

      return (
        <div className="min-h-screen bg-pryClr/5 p-4 md:p-6 lg:p-8">
          <div className=" mx-auto">
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
                ) : error ? (
                  <div className="p-6 text-center text-gray-600">{error}</div>
                ) : users.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">No users found</div>
                ) : (
                  <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-tetClr/20 text-gray-800">
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
                          className="border-b border-gray-200 hover:bg-tetClr/20 transition-colors duration-200"
                        >
                          <td className="px-4 py-4 md:px-6 font-medium text-gray-900">{user.username}</td>
                          <td className="px-4 py-4 md:px-6">{user.email}</td>
                          <td className="px-4 py-4 md:px-6">{user.role}</td>
                          <td className="px-4 py-4 md:px-6">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-4 md:px-6 flex space-x-3">
                            {user.status === "active" ? (
                              <button
                                onClick={() => disableUser(user.id)}
                                className="text-orange-500 hover:text-orange-600 cursor-pointer"
                                title="Disable User"
                              >
                                <FaUserTimes className="text-lg" />
                              </button>
                            ) : (
                              <button
                                onClick={() => enableUser(user.id)}
                                className="text-green-500 hover:text-green-600 cursor-pointer"
                                title="Enable User"
                              >
                                <FaUserCheck className="text-lg" />
                              </button>
                            )}

                            {/* View */}
                            <button
                              onClick={() => fetchUserDetails(user.id)}
                              className="text-blue-500 hover:text-blue-600 cursor-pointer"
                              title="View User"
                            >
                              <FaEye className="text-lg" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-500 hover:text-red-600 cursor-pointer"
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
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] md:max-w-lg p-4 md:p-6 overflow-y-auto max-h-[80vh]">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-900">User Details</h3>
                    <button
                      onClick={() => {
                        setViewModal(false);
                        setViewUser(null);
                        setViewError(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 p-1 md:p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-200"
                    >
                      <FaTimes className="text-lg" />
                    </button>
                  </div>
                  {viewLoading ? (
                    <div className="p-6 text-center text-gray-600">Loading user details...</div>
                  ) : viewError ? (
                    <div className="p-6 text-center text-gray-600">{viewError}</div>
                  ) : viewUser ? (
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700">ID</label>
                        <p className="text-sm md:text-base text-gray-600">{viewUser.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700">Username</label>
                        <p className="text-sm md:text-base text-gray-600">{viewUser.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700">Email</label>
                        <p className="text-sm md:text-base text-gray-600">{viewUser.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm md:text-base font-medium text-gray-700">Status</label>
                        <p className="text-sm md:text-base text-gray-600">{viewUser.status === 'active' ? 'Active' : 'Inactive'}</p>
                      </div>
                      {viewUser.created_at && (
                        <div>
                          <label className="block text-sm md:text-base font-medium text-gray-700">Created At</label>
                          <p className="text-sm md:text-base text-gray-600">{new Date(viewUser.created_at).toLocaleString()}</p>
                        </div>
                      )}
                      {viewUser.updated_at && (
                        <div>
                          <label className="block text-sm md:text-base font-medium text-gray-700">Updated At</label>
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
          </div>
        </div>
      );
    };

    export default User;