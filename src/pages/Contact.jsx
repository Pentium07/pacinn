import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaTwitter, FaInstagram, FaTiktok } from 'react-icons/fa';
import assets from '../assets/assests';

const Contact = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src={assets.bg}
          alt="Contact Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-pryClr/70 bg-gradient-to-r from-pryClr via-pryClr/70 to-pryClr/20"></div>
        <div className="relative z-10 w-[90%] mx-auto text-center animate-fadeIn flex flex-col gap-4 md:gap-8 mt-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white ">
            Contact <span className="text-secClr">Pac Inn</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Reach out to us for bookings, inquiries, or to plan your next unforgettable experience at Pac Inn Hotel.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="w-full py-12 md:py-20 bg-gradient-to-b from-white to-teal-50">
        <div className="w-[90%] mx-auto max-w-7xl">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-trdClr tracking-tight">
              Get in Touch
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our team is here to assist you. Contact us via phone, email, or social media.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Map Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100/50 transform transition-all duration-500 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-tetClr/10 to-transparent z-10"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.4573106884054!2d4.266256575991439!3d8.156594502032485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10370d70992ed1a9%3A0xf8c3fb52d36ebda7!2sPAC%20Inn1!5e0!3m2!1sen!2sng!4v1757628541473!5m2!1sen!2sng"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pac Inn Hotel Location"
                className="h-[60vh] md:h-full"
              ></iframe>
            </div>
            {/* Contact Information */}
            <div className="relative bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100/50 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fadeIn">
              <h3 className="text-xl md:text-2xl font-bold text-trdClr mb-6 tracking-tight">
                Contact Details
              </h3>
              <div className="flex flex-col gap-6 text-trdClr text-base md:text-lg">
                <div className="flex items-center gap-4 group">
                  <FaMapMarkerAlt className="flex-shrink-0 w-6 h-6 text-tetClr group-hover:text-secClr transition-colors duration-300" />
                  <p className="leading-relaxed">
                    Pac Inn, Under G, Ogbomosho, Oyo State, Nigeria
                  </p>
                </div>
                <div className="flex items-center gap-4 group">
                  <FaPhoneAlt className="flex-shrink-0 w-6 h-6 text-tetClr group-hover:text-secClr transition-colors duration-300" />
                  <p className="leading-relaxed">0912 817 0788, 0806 896 4678</p>
                </div>
                <div className="flex items-center gap-4 group">
                  <FaEnvelope className="flex-shrink-0 w-6 h-6 text-tetClr group-hover:text-secClr transition-colors duration-300" />
                  <p className="leading-relaxed">pacinn21@gmail.com</p>
                </div>
                <div className="flex gap-6 mt-8 justify-center">
                  <NavLink
                    to="https://wa.me/2349128170788"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trdClr hover:text-secClr transition-all duration-300 transform hover:scale-110"
                  >
                    <FaWhatsapp className="w-8 h-8" />
                  </NavLink>
                  <NavLink
                    to="https://www.tiktok.com/@pac.inn3?_t=ZS-906TEpZVkAM&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trdClr hover:text-secClr transition-all duration-300 transform hover:scale-110"
                  >
                    <FaTiktok className="w-8 h-8" />
                  </NavLink>
                  <NavLink
                    to="https://www.instagram.com/pac.inn?igsh=MTBtbm8xYThpczBuOQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trdClr hover:text-secClr transition-all duration-300 transform hover:scale-110"
                  >
                    <FaInstagram className="w-8 h-8" />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;