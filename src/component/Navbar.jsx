import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaHome, FaCalendar, FaEnvelope, FaTicketAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import assets from '../assets/assests';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Navbar is fixed on top of everything */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg">
        <div className="container mx-auto w-[90%] py-4 md:py-2 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={assets.logo}
              alt="Logo"
              className="h-10 md:h-12 transform hover:scale-105 transition-transform duration-300"
            />
            <p className="text-lg md:text-xl font-bold text-pryClr">Pac Inn</p>
          </div>

          {/* Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-800 focus:outline-none transition-transform duration-300 hover:rotate-90"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:flex-row items-center md:justify-end md:flex-1">
            <div className="flex flex-row items-center space-x-8">
              <NavLink to="/">
                {({ isActive }) => (
                  <span
                    className={`font-medium text-sm transition-all duration-300 relative group ${
                      isActive
                        ? 'text-trdClr font-bold'
                        : 'text-gray-800 hover:text-pryClr'
                    }`}
                  >
                    Home
                    <span
                      className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-secClr transition-all duration-300 ${
                        isActive ? 'w-full' : 'group-hover:w-full'
                      }`}
                    ></span>
                  </span>
                )}
              </NavLink>

              <NavLink to="/booking">
                {({ isActive }) => (
                  <span
                    className={`font-medium text-sm transition-all duration-300 relative group ${
                      isActive
                        ? 'text-trdClr font-bold'
                        : 'text-gray-800 hover:text-pryClr'
                    }`}
                  >
                    Booking
                    <span
                      className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-secClr transition-all duration-300 ${
                        isActive ? 'w-full' : 'group-hover:w-full'
                      }`}
                    ></span>
                  </span>
                )}
              </NavLink>

              <NavLink to="/ticket">
                {({ isActive }) => (
                  <span
                    className={`font-medium text-sm transition-all duration-300 relative group ${
                      isActive
                        ? 'text-trdClr font-bold'
                        : 'text-gray-800 hover:text-pryClr'
                    }`}
                  >
                    Ticket
                    <span
                      className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-secClr transition-all duration-300 ${
                        isActive ? 'w-full' : 'group-hover:w-full'
                      }`}
                    ></span>
                  </span>
                )}
              </NavLink>

              <NavLink to="/contact">
                {({ isActive }) => (
                  <span
                    className={`font-medium text-sm transition-all duration-300 relative group ${
                      isActive
                        ? 'text-trdClr font-bold'
                        : 'text-gray-800 hover:text-pryClr'
                    }`}
                  >
                    Contact
                    <span
                      className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-secClr transition-all duration-300 ${
                        isActive ? 'w-full' : 'group-hover:w-full'
                      }`}
                    ></span>
                  </span>
                )}
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-full bg-white transform transition-all duration-500 ease-out z-50 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
      >
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center px-6 py-6 bg-gradient-to-r from-pryClr/5 to-secClr/5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={assets.logo}
                alt="Logo"
                className="h-12 w-12 rounded-lg"
              />
              <div>
                <p className="text-lg font-bold text-pryClr">Pac Inn</p>
                <p className="text-xs text-gray-500 mt-1">Experience Luxury</p>
              </div>
            </div>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:rotate-90"
            >
              <FaTimes size={18} className="text-gray-700" />
            </button>
          </div>

          {/* Enhanced Navigation Links */}
          <nav className="flex flex-col space-y-2 p-6 flex-grow">
            <NavLink to="/" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-base py-4 px-4 rounded-xl transition-all duration-300 group border ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold border-secClr/30 shadow-md'
                      : 'text-pryClr border-transparent hover:bg-secClr/30 hover:border-secClr/20 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-lg mr-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-trdClr/20 text-trdClr' 
                      : 'bg-pryClr/10 text-pryClr group-hover:bg-secClr/20'
                  }`}>
                    <FaHome size={18} />
                  </div>
                  <span className="font-medium">Home</span>
                  <div className={`ml-auto w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-trdClr' : 'bg-transparent'
                  }`}></div>
                </div>
              )}
            </NavLink>

            <NavLink to="/booking" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-base py-4 px-4 rounded-xl transition-all duration-300 group border ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold border-secClr/30 shadow-md'
                      : 'text-pryClr border-transparent hover:bg-secClr/30 hover:border-secClr/20 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-lg mr-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-trdClr/20 text-trdClr' 
                      : 'bg-pryClr/10 text-pryClr group-hover:bg-secClr/20'
                  }`}>
                    <FaCalendar size={18} />
                  </div>
                  <span className="font-medium">Booking</span>
                  <div className={`ml-auto w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-trdClr' : 'bg-transparent'
                  }`}></div>
                </div>
              )}
            </NavLink>

            <NavLink to="/ticket" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-base py-4 px-4 rounded-xl transition-all duration-300 group border ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold border-secClr/30 shadow-md'
                      : 'text-pryClr border-transparent hover:bg-secClr/30 hover:border-secClr/20 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-lg mr-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-trdClr/20 text-trdClr' 
                      : 'bg-pryClr/10 text-pryClr group-hover:bg-secClr/20'
                  }`}>
                    <FaTicketAlt size={18} />
                  </div>
                  <span className="font-medium">Ticket</span>
                  <div className={`ml-auto w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-trdClr' : 'bg-transparent'
                  }`}></div>
                </div>
              )}
            </NavLink>

            <NavLink to="/contact" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-base py-4 px-4 rounded-xl transition-all duration-300 group border ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold border-secClr/30 shadow-md'
                      : 'text-pryClr border-transparent hover:bg-secClr/30 hover:border-secClr/20 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-lg mr-4 transition-all duration-300 ${
                    isActive 
                      ? 'bg-trdClr/20 text-trdClr' 
                      : 'bg-pryClr/10 text-pryClr group-hover:bg-secClr/20'
                  }`}>
                    <FaEnvelope size={18} />
                  </div>
                  <span className="font-medium">Contact</span>
                  <div className={`ml-auto w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-trdClr' : 'bg-transparent'
                  }`}></div>
                </div>
              )}
            </NavLink>
          </nav>

          {/* Enhanced Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-center">
              <p className="text-sm font-semibold text-pryClr mb-1">Pac Inn Events</p>
              <p className="text-xs text-gray-500 mb-3">Creating Unforgettable Experiences</p>
              <div className="flex justify-center space-x-3 mb-4">
                <div className="w-1 h-1 bg-secClr rounded-full"></div>
                <div className="w-1 h-1 bg-secClr rounded-full"></div>
                <div className="w-1 h-1 bg-secClr rounded-full"></div>
              </div>
              <p className="text-xs text-gray-400">© 2025 Pac Inn. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-500"
          onClick={toggleMenu}
        ></div>
      )}
    </>
  );
};

export default Navbar;