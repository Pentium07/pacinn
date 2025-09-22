import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { toast } from 'sonner';
import axios from 'axios';
import assets from '../assets/assests';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Subscribing to newsletter...');

    try {
      const response = await axios.post(`${API_URL}/newsletter/subscribe`, { email }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Successfully subscribed to the newsletter!', { id: toastId });
        setEmail('');
      } else {
        toast.error('Failed to subscribe. Please try again.', { id: toastId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.', { id: toastId });
    }
  };

  return (
    <footer className="w-full bg-[#000814] text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CCA000] via-[#F0CB46] to-[#CCA000]"></div>
      <div className="absolute -top-24 -right-24 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 rounded-full bg-[#001D3D] opacity-20"></div>
      <div className="absolute -bottom-32 -left-32 w-64 md:w-72 lg:w-80 h-64 md:h-72 lg:h-80 rounded-full bg-[#003566] opacity-20"></div>
      
      <div className="relative z-10 py-8 md:py-12">
        <div className="w-[90%]  mx-auto flex flex-col gap-6 md:gap-8 lg:gap-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">
            {/* Brand and Description */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
              <img src={assets.logo} className="w-16 md:w-18" alt="Pac Inn Hotel Logo" />
              <p className="text-sm md:text-sm  text-gray-300 leading-relaxed max-w-[280px] md:max-w-xs">
                Experience luxury redefined at Pac Inn Hotel, where exceptional hospitality meets unforgettable memories.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-4 md:gap-6 lg:gap-5 ">
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-white relative pb-1 md:pb-2 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-[#F0CB46] after:to-[#CCA000]">
                Explore
              </h3>
              <div className="flex flex-col gap-2 md:gap-3">
                {['Home', 'Booking', 'Ticket', 'Contact'].map((item, index) => (
                  <NavLink
                    key={index}
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-300 text-sm md:text-sm  hover:text-[#F0CB46] transition-all duration-300 flex items-center group"
                  >
                    {item}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-white relative pb-1 md:pb-2 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-[#F0CB46] after:to-[#CCA000]">
                Contact Us
              </h3>
              <div className="flex flex-col gap-3 md:gap-4 text-gray-300 text-sm md:text-sm ">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="mt-0.5 p-1 md:p-2 lg:p-3 bg-[#001D3D] rounded-md">
                    <FaMapMarkerAlt className="w-3.5 md:w-4 lg:w-5 h-3.5 md:h-4 lg:h-5 text-[#F0CB46]" />
                  </div>
                  <p className="max-w-[200px] md:max-w-[220px] lg:max-w-[250px]">Pac Inn, Under G, Ogbomosho, Oyo State, Nigeria</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1 md:p-2 lg:p-3 bg-[#001D3D] rounded-md">
                    <FaPhoneAlt className="w-3.5 md:w-4 lg:w-5 h-3.5 md:h-4 lg:h-5 text-[#F0CB46]" />
                  </div>
                  <p>0912 817 0788</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1 md:p-2 lg:p-3 bg-[#001D3D] rounded-md">
                    <FaEnvelope className="w-3.5 md:w-4 lg:w-5 h-3.5 md:h-4 lg:h-5 text-[#F0CB46]" />
                  </div>
                  <p>pacinn21@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Newsletter and Social Media */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-white relative pb-1 md:pb-2 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-[#F0CB46] after:to-[#CCA000]">
                Connect With Us
              </h3>
              
              <div className="flex gap-3 md:gap-4 mt-2">
                {[
                  { icon: <FaFacebookF className="w-4 md:w-5  h-4 md:h-5" />, color: "hover:bg-[#3b5998]" },
                  { icon: <FaTwitter className="w-4 md:w-5  h-4 md:h-5" />, color: "hover:bg-[#1da1f2]" },
                  { icon: <FaInstagram className="w-4 md:w-5  h-4 md:h-5" />, color: "hover:bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743]" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`p-2 md:p-3  bg-[#001D3D] rounded-lg text-gray-300 transition-all duration-300 ${social.color} hover:text-white transform hover:-translate-y-1`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Newsletter Subscription */}
              <div className="flex flex-col gap-3 md:gap-4 mt-3 md:mt-4">
                <p className="text-gray-300 text-sm md:text-sm ">Subscribe to our newsletter.</p>
                <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="p-3 md:p-2 lg:p-3 bg-[#001D3D] text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F0CB46] flex-1 placeholder:px-4 placeholder:md:px-0 min-w-0"
                  />
                  <button
                    onClick={handleNewsletterSubmit}
                    className="p-3 md:p-2 lg:p-3 bg-[#F0CB46] text-[#000814] rounded-md hover:bg-[#CCA000] transition-all duration-300 w-full md:w-auto md:min-w-[100px] text-center"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-[#003566] pt-3 md:pt-4 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm md:text-sm  text-gray-400">
              © 2025 Pac Inn Hotel. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;