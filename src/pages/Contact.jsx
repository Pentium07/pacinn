import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaTwitter, FaInstagram } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Contact = () => {

    useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);


  return (
    <div>
      <div className="min-h-screen bg-trdClr/15 py-12 w-full pt-26 flex flex-col items-center">
        <div className="text-center mb-12 w-[90%]">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Exclusive Events</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join us for unforgettable experiences with our curated selection of premium events.
          </p>
        </div>
        {/* <div className="w-full flex flex-col gap-12 items-center justify-center text-gray-800 py-12 md:py-20 bg-gradient-to-b from-white to-teal-50"> */}
        <div className="w-[90%] flex flex-col gap-10">
          <div className="w-full h-[100vh] md:h-[60vh] flex flex-col lg:flex-row gap-8 md:gap-12">
            {/* Google Map */}
            <div className="w-full flex-[7]  rounded-2xl overflow-hidden shadow-lg border border-gray-200/50">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.4573106884054!2d4.266256575991439!3d8.156594502032485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10370d70992ed1a9%3A0xf8c3fb52d36ebda7!2sPAC%20Inn1!5e0!3m2!1sen!2sng!4v1757628541473!5m2!1sen!2sng"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pac Inn Hotel Location"
              ></iframe>
            </div>
            {/* Contact Information */}
            <div className="w-full flex-[3] flex flex-col justify-center bg-pryClr/20 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200/50">
              <h3 className="text-2xl md:text-3xl font-bold text-trdClr mb-6 tracking-tight">Contact Us</h3>
              <div className="flex flex-col gap-6 text-trdClr text-base md:text-lg">
                <p className="flex items-center gap-3">
                  <FaMapMarkerAlt className=" flex-shrink-0 w-5 h-5 text-trdClr" />
                  Pac Inn, Under G, Ogbomosho, Oyo State, Nigeria
                </p>
                <p className="flex items-center gap-3">
                  <FaPhoneAlt className=" flex-shrink-0 w-5 h-5 text-trdClr" />
                  0912 817 0788
                </p>
                <p className="flex items-center gap-3">
                  <FaEnvelope className=" flex-shrink-0 w-5 h-5 text-trdClr" />
                  pacinn21@gmail.com
                </p>
                <div className="flex gap-6 mt-6 justify-center">
                  <NavLink
                    to="https://wa.me/2349128170788"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trdClr hover:text-trdClr transition-colors duration-300"
                  >
                    <FaWhatsapp className="w-6 h-6" />
                  </NavLink>
                  <NavLink
                    to="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trdClr hover:text-trdClr transition-colors duration-300"
                  >
                    <FaTwitter className="w-6 h-6" />
                  </NavLink>
                  <NavLink
                    to="https://www.instagram.com/pac.inn?igsh=MTBtbm8xYThpczBuOQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-trdClr hover:text-trdClr transition-colors duration-300"
                  >
                    <FaInstagram className="w-6 h-6" />
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
};

export default Contact;