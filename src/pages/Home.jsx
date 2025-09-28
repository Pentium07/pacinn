import React, { useEffect } from 'react';
import assets from '../assets/assests';
import { NavLink, useLocation } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaStar, FaTiktok } from 'react-icons/fa';
import EventSection from './EventSection';

const Home = () => {
  const location = useLocation();

  const cards = [
    {
      title: 'Rooms & Apartments',
      subtitle: 'Discover cozy, modern spaces crafted for ultimate comfort and relaxation, featuring stylish decor, premium amenities, and serene environments tailored to your needs.',
      image: assets.pic1,
      bgColor: 'bg-trdClr/60',
      textColor: 'text-white',
    },
    {
      title: 'Game Center',
      subtitle: 'Dive into fun and excitement with our state-of-the-art gaming facilities, offering cutting-edge technology, immersive experiences, and entertainment for all ages.',
      image: assets.pic2,
      bgColor: 'bg-tetClr/60',
      textColor: 'text-white',
    },
    {
      title: 'Food & Restaurant',
      subtitle: 'Savor delicious, expertly crafted meals by our renowned chefs, using fresh, high-quality ingredients to deliver a dining experience that delights every palate.',
      image: assets.pic3,
      bgColor: 'bg-trdClr/60',
      textColor: 'text-white',
    },
    {
      title: 'Event & Party',
      subtitle: 'Host unforgettable gatherings in our vibrant, versatile venues, equipped with modern facilities and customizable setups to make every occasion truly special.',
      image: assets.pic4,
      bgColor: 'bg-tetClr/60',
      textColor: 'text-white',
    },
    {
      title: 'Club House',
      subtitle: 'Unwind and connect in our exclusive club atmosphere, designed for relaxation and socializing with elegant spaces, premium services, and a welcoming vibe.',
      image: assets.pic5,
      bgColor: 'bg-trdClr/60',
      textColor: 'text-white',
    },
    {
      title: 'Hall Space',
      subtitle: 'Access spacious, state-of-the-art halls ideal for conferences, seminars, and large events, complete with advanced technology and flexible configurations.',
      image: assets.pic6,
      bgColor: 'bg-tetClr/60',
      textColor: 'text-white',
    },
  ];

  const rooms = [
    {
      id: 1,
      name: "Deluxe Suite",
      price: 350,
      rating: 4.5,
      image: assets.pic7,
      description: "Enjoy the perfect blend of style and comfort in our Deluxe Suite, featuring a spacious bedroom, elegant décor, and a relaxing lounge area .",
    },
    {
      id: 2,
      name: "Royal Suite",
      price: 280,
      rating: 4.7,
      image: assets.pic8,
      description: "Experience luxury at its finest in the Royal Suite, with grand interiors, extra space, and exclusive features fit for royalty and a relaxing lounge area.",
    },
    {
      id: 3,
      name: "Queen Suite",
      price: 550,
      rating: 5.0,
      image: assets.pic9,
      description: "Cozy and inviting, the Queen Room provides a comfortable queen-size bed, chic design, and all the essentials for a restful night.",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Chinelo Okafor",
      review: "An absolutely delightful stay! The staff was incredibly attentive, and the ambiance was pure luxury. Highly recommend!",
    },
    {
      id: 2,
      name: "Emeka Nwosu",
      review: "The best hotel experience I've ever had. The rooms were pristine, and the service was top-notch. I'll be back!",
    },
    {
      id: 3,
      name: "Amina Bello",
      review: "Pac Inn made our vacation unforgettable. The attention to detail and warm hospitality were exceptional!",
    },
    {
      id: 4,
      name: "Tunde Adeyemi",
      review: "From the moment we arrived, we felt welcomed. The amenities and comfort exceeded all expectations!",
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full h-[100vh] items-center justify-center overflow-hidden">
        <img
          src={assets.bg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-pryClr/70 lg:bg-pryClr/0 md:bg-gradient-to-r md:from-pryClr md:via-pryClr/70 md:to-pryClr/20"></div>
        <div className="relative z-10 w-[90%] mx-auto h-full flex items-center text-center md:text-left">
          <div className="w-full flex flex-col gap-10 md:gap-10 md:w-[55%]">
            <h1 className="text-3xl font-bold text-white md:text-6xl hidden md:block">
              Welcome to <span className="text-secClr">Pac Inn</span>
            </h1>
            <h1 className="text-xl text-white md:text-6xl block md:hidden">
              Welcome to <br /> <span className="text-secClr font-bold text-6xl">Pac Inn</span>
            </h1>
            <p className="text-sm text-gray-200 md:text-lg leading-relaxed">
              Welcome to Pac Inn Hotel, where comfort meets vibrant energy. From our
              cozy rooms and friendly staff to the lively bar and exciting game
              center, we create a space where every guest feels at home and every
              moment is memorable.
            </p>
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <NavLink
                to="/booking"
                className="px-16 md:px-12 py-2 text-lg font-semibold text-pryClr bg-secClr border border-secClr rounded-lg hover:bg-pryClr hover:text-white transition-colors duration-300 md:w-auto"
              >
                Bookings
              </NavLink>
              <NavLink
                to="/ticket"
                className="px-16 md:px-12 py-2 text-lg font-semibold text-white bg-pryClr rounded-lg hover:bg-secClr hover:text-pryClr border border-secClr transition-colors duration-300 md:w-auto"
              >
                Get Ticket
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-16 items-center justify-center text-gray-900 py-12 md:py-12 bg-gradient-to-b from-gray-50 to-blue-100">
        <div className="w-[90%] flex flex-col gap-12 items-center text-center">
          <div className="w-full md:w-[70%] flex flex-col gap-6 items-center">
            <h2 className="font-bold text-3xl md:text-5xl text-trdClr">
              Why Choose <span>Pac Inn?</span>
            </h2>
            <p className="w-full text-sm md:text-lg leading-7 md:leading-9 text-pryClr">
              Choosing Pac Inn means embracing unparalleled comfort. Experience luxury and excitement tailored to you.
            </p>
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`relative ${card.bgColor} p-6 md:p-6 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-4 transform transition-all duration-500 flex flex-col items-center text-center ${card.textColor} overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative w-full h-70 overflow-hidden rounded-2xl mb-6">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <h3 className="relative text-xl md:text-2xl font-bold mb-4 tracking-wide drop-shadow-lg">
                  {card.title}
                </h3>
                <p className="relative text-sm md:text-base leading-6 opacity-90 max-w-md drop-shadow-md">
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-16 items-center justify-center text-gray-900 py-12 md:py-12 bg-tetClr/40">
        <div className="w-[90%] flex flex-col gap-12 items-center text-center">
          <div className="w-full md:w-[70%] flex flex-col gap-6 items-center">
            <h2 className="font-bold text-3xl md:text-5xl text-trdClr">
              Accommodations
            </h2>
            <p className="w-full text-sm md:text-lg leading-7 md:leading-9 text-pryClr">
              Indulge in unmatched comfort and elegance with our carefully curated room selections at Pac Inn Hotel, designed for an unforgettable stay.
            </p>
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="relative group bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              >
                <div className="relative h-70 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-0 right-0 bg-tetClr flex gap-2 items-center text-white text-sm font-semibold px-4 py-2 rounded-bl-2xl shadow-md">
                    <span className="text-white text-lg">★</span>
                    <span className="text-white font-semibold">{room.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent h-1/2 w-full"></div>
                </div>
                <div className="p-4 flex flex-col gap-3 bg-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl md:text-xl lg:text-lg font-bold text-gray-800">{room.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm md:text-sm line-clamp-3 leading-relaxed text-start">
                    {room.description}
                  </p>
                  <NavLink
                    to="/booking"
                    className="mt-4 w-full bg-tetClr text-white py-3 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Book This Room
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-16 items-center justify-center text-gray-900 py-12 md:py-12 bg-gradient-to-b from-blue-50 to-gray-100">
        <div className="w-[90%] flex flex-col gap-12 items-center text-center">
          <div className="w-full md:w-[70%] flex flex-col gap-6 items-center">
            <h2 className="font-bold text-3xl md:text-5xl text-trdClr">
              Upcoming Events at Pac Inn
            </h2>
            <p className="w-full text-sm md:text-lg leading-7 md:leading-9 text-pryClr">
              Immerse yourself in unforgettable moments with our curated events, designed to thrill, delight, and inspire.
            </p>
          </div>
          <EventSection />
        </div>
      </div>

      <div className="w-full bg-tetClr/50 py-12 md:py-16 lg:py-20">
        <div className="w-[90%] mx-auto">
          <div className="text-center mb-10 md:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-trdClr tracking-tight">
              Our Guests' Experiences
            </h2>
            <p className="mt-4 text-sm md:text-lg lg:text-xl text-trdClr mx-auto leading-7 md:leading-8">
              Hear from our valued guests about their remarkable stays at Pac Inn, where luxury meets heartfelt hospitality.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-trdClr transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col gap-4 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-trdClr flex items-center justify-center text-white font-semibold text-lg md:text-xl">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-800">
                      {testimonial.name}
                    </h3>
                    <div className="flex justify-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-amber-400 text-sm md:text-base" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
                    "{testimonial.review}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full py-12 md:py-20 bg-gradient-to-b from-white to-teal-50">
      <div className="w-[90%] mx-auto ">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-trdClr tracking-tight">
            Get in Touch
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with us at Pac Inn Hotel for an unforgettable experience. We’re here to assist you!
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
              className="w-full h-[60vh] md:h-full"
            ></iframe>
          </div>
          {/* Contact Information */}
          <div className="relative bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100/50 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-fadeIn">
            <h3 className="text-2xl md:text-3xl font-bold text-trdClr mb-6 tracking-tight">
              Contact Us
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

export default Home;