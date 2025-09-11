import React, { useState } from 'react';
import { FaBars, FaTimes, FaHome, FaCalendar, FaEnvelope, FaTicketAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import assets from '../assets/assests';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Navbar is fixed on top of everything */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg">
        <div className="container mx-auto w-[90%] py-2 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={assets.logo}
              alt="Logo"
              className="h-12 transform hover:scale-105 transition-transform duration-300"
            />
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

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-full bg-white transform transition-transform duration-500 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <img
              src={assets.logo}
              alt="Logo"
              className="h-14"
            />
            <button
              onClick={toggleMenu}
              className="text-gray-800 focus:outline-none transition-transform duration-300 hover:rotate-90"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col space-y-1 p-6 flex-grow">
            <NavLink to="/" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-lg py-4 px-6 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold'
                      : 'text-pryClr hover:bg-secClr/50'
                  }`}
                >
                  <FaHome className="mr-4 text-xl" />
                  <span>Home</span>
                </div>
              )}
            </NavLink>

            <NavLink to="/booking" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-lg py-4 px-6 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold'
                      : 'text-pryClr hover:bg-secClr/50'
                  }`}
                >
                  <FaCalendar className="mr-4 text-xl" />
                  <span>Booking</span>
                </div>
              )}
            </NavLink>

            <NavLink to="/contact" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-lg py-4 px-6 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold'
                      : 'text-pryClr hover:bg-secClr/50'
                  }`}
                >
                  <FaEnvelope className="mr-4 text-xl" />
                  <span>Contact</span>
                </div>
              )}
            </NavLink>

            <NavLink to="/ticket" onClick={toggleMenu}>
              {({ isActive }) => (
                <div
                  className={`flex items-center text-lg py-4 px-6 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-secClr/80 text-trdClr font-bold'
                      : 'text-pryClr hover:bg-secClr/50'
                  }`}
                >
                  <FaTicketAlt className="mr-4 text-xl" />
                  <span>Ticket</span>
                </div>
              )}
            </NavLink>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>© Pac Inn</p>
            <p className="mt-1">All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
        ></div>
      )}
    </>
  );
};

export default Navbar;
