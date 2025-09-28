import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  FaClipboardList, 
  FaCalendarAlt, 
  FaQrcode, 
  FaTachometerAlt, 
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBed,
  FaTicketAlt,
  FaUsers,
  FaEnvelope
} from 'react-icons/fa';
import assets from '../assets/assests';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Admin = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('role') || 'user'; // Default to 'user' if role is not set

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Redirect users from /admin/dashboard to /admin/scanner
  useEffect(() => {
    if (userRole === 'user' && location.pathname === '/admin/dashboard') {
      navigate('/admin/scanner');
    }
  }, [userRole, location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success('Logged out successfully');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Logout failed');
    }
  };

  // Navigation links with role-based access
  const navLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="text-base" />, roles: ['admin'] },
    { path: '/admin/room', label: 'Rooms', icon: <FaBed className="text-base" />, roles: ['admin'] },
    { path: '/admin/booking', label: 'Bookings', icon: <FaClipboardList className="text-base" />, roles: ['admin'] },
    { path: '/admin/event', label: 'Events', icon: <FaCalendarAlt className="text-base" />, roles: ['admin'] },
    { path: '/admin/purchase', label: 'Purchase', icon: <FaTicketAlt className="text-base" />, roles: ['admin', 'user'] },
    { path: '/admin/scanner', label: 'Scanner', icon: <FaQrcode className="text-base" />, roles: ['admin', 'user'] },
    { path: '/admin/user', label: 'Users', icon: <FaUsers className="text-base" />, roles: ['admin'] },
    { path: '/admin/subscriber', label: 'Subscribers', icon: <FaEnvelope className="text-base" />, roles: ['admin'] },
  ];

  // Filter links based on user role
  const filteredNavLinks = navLinks.filter(link => link.roles.includes(userRole));

  const linkClass =
    'group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white hover:text-tetClr hover:shadow-sm hover:scale-[1.02]';
  const activeClass = 'bg-white text-tetClr font-semibold shadow-md';

  return (
    <div className="min-h-screen bg-pryClr">
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-tetClr p-4 flex items-center justify-between lg:hidden shadow-sm">
        <h1 className="text-lg font-bold text-white">Admin Panel</h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md text-white hover:bg-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
        >
          {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed inset-y-0 left-0 z-50 w-full lg:w-72 h-screen bg-tetClr shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header (mobile only) */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-white hover:bg-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Logo (desktop only) */}
          <div className="p-4 border-b border-gray-200 hidden lg:block">
            <div className="flex gap-4 items-center">
              <img src={assets.logo} className="w-12" alt="logo" />
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.path}
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : 'text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            >
              <FaSignOutAlt className="text-base" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pt-16 lg:pl-72 lg:pt-0">
        <main className="min-h-screen bg-gray-50">
          <div className="w-full">{children}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Admin;