import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import assets from '../assets/assests';

const Footer = () => {
  return (
    <footer className="w-full bg-[#000814] text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#CCA000] via-[#F0CB46] to-[#CCA000]"></div>
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#001D3D] opacity-20"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#003566] opacity-20"></div>
      
      <div className="relative z-10 py-12">
        <div className="w-[90%]  mx-auto flex flex-col gap-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand and Description */}
            <div className="flex flex-col gap-6">
              <img src={assets.logo} className='w-18' alt="" />
              <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-sm">
                Experience luxury redefined at Pac Inn Hotel, where exceptional hospitality meets unforgettable memories.
              </p>
              
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg md:text-xl font-bold text-white relative pb-2 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-[#F0CB46] after:to-[#CCA000]">
                Explore
              </h3>
              <div className="flex flex-col gap-3">
                {['Home', 'Booking', 'Ticket', 'Contact'].map((item, index) => (
                  <NavLink
                    key={index}
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-300 text-sm md:text-base hover:text-[#F0CB46] transition-all duration-300 flex items-center group"
                  >
                    {/* <FaArrowRight className="mr-2 text-[#CCA000] text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
                    {item}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg md:text-xl font-bold text-white relative pb-2 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-[#F0CB46] after:to-[#CCA000]">
                Contact Us
              </h3>
              <div className="flex flex-col gap-4 text-gray-300 text-sm md:text-base">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-[#001D3D] rounded-md">
                    <FaMapMarkerAlt className="w-4 h-4 text-[#F0CB46]" />
                  </div>
                  <p>Pac Inn Hotel, 350 5th Ave, New York, NY 10118</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#001D3D] rounded-md">
                    <FaPhoneAlt className="w-4 h-4 text-[#F0CB46]" />
                  </div>
                  <p>(212) 555-1234</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#001D3D] rounded-md">
                    <FaEnvelope className="w-4 h-4 text-[#F0CB46]" />
                  </div>
                  <p>info@pacinn.com</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex flex-col gap-6">
              <h3 className="text-lg md:text-xl font-bold text-white relative pb-2 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-12 after:bg-gradient-to-r after:from-[#F0CB46] after:to-[#CCA000]">
                Connect With Us
              </h3>
              <p className="text-gray-300 text-sm">Follow us on social media for exclusive offers and updates.</p>
              
              <div className="flex gap-4 mt-2">
                {[
                  { icon: <FaFacebookF className="w-5 h-5" />, color: "hover:bg-[#3b5998]" },
                  { icon: <FaTwitter className="w-5 h-5" />, color: "hover:bg-[#1da1f2]" },
                  { icon: <FaInstagram className="w-5 h-5" />, color: "hover:bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743]" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`p-3 bg-[#001D3D] rounded-lg text-gray-300 transition-all duration-300 ${social.color} hover:text-white transform hover:-translate-y-1`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-[#003566] pt-4 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2025 Pac Inn Hotel. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;