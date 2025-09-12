// import React from 'react';
import assets from '../assets/assests';
import { NavLink } from "react-router-dom";
import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
// import { NavLink } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const Home = () => {
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
      image: assets.pic1,
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
      description: "Experience luxury at its finest in the Royal Suite, with grand interiors, extra space, and exclusive features fit for royalty",
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

  const events = [
    {
      id: 1,
      title: "Summer Gala Night",
      subtitle: "Join us for an evening of elegance with live music, gourmet dining,  fireworks under the stars.",
      image: assets.pic10,
    },
    {
      id: 2,
      title: "Wine Tasting Extravaganza",
      subtitle: "Savor exquisite wines from top vineyards, paired with artisanal cheeses inusive club lounge.",
      image: assets.pic10,
    },
    {
      id: 3,
      title: "Jazz & Blues Festival",
      subtitle: "Experience soulful performances by world-class artists in an open with vibrant energy.",
      image: assets.pic10,
    },
  ];


  const testimonials = [
    {
      id: 1,
      name: "Emma Thompson",
      review: "An absolutely delightful stay! The staff was incredibly attentive, and the ambiance was pure luxury. Highly recommend!",
    },
    {
      id: 2,
      name: "James Carter",
      review: "The best hotel experience I've ever had. The rooms were pristine, and the service was top-notch. I'll be back!",
    },
    {
      id: 3,
      name: "Sophia Nguyen",
      review: "Pac Inn made our vacation unforgettable. The attention to detail and warm hospitality were exceptional!",
    },
    {
      id: 4,
      name: "Liam Brooks",
      review: "From the moment we arrived, we felt welcomed. The amenities and comfort exceeded all expectations!",
    },
    {
      id: 5,
      name: "Olivia Patel",
      review: "A perfect blend of elegance and comfort. The staff went above and beyond to make our stay special.",
    },
    {
      id: 6,
      name: "Noah Kim",
      review: "Incredible experience! The atmosphere was vibrant, and the service was impeccable. Can't wait to return!",
    },
  ];


  // const scrollRef = useRef(null);

  // useEffect(() => {
  //   const scrollContainer = scrollRef.current;
  //   if (!scrollContainer) return;

  //   // Duplicate testimonials for seamless looping
  //   const totalWidth = scrollContainer.scrollWidth / 2; // Half due to duplication
  //   let scrollAmount = totalWidth; // Start at the end for right-to-left
  //   const scrollSpeed = 0.4; // Slower for smoother scrolling

  //   const autoScroll = () => {
  //     if (scrollContainer) {
  //       scrollAmount -= scrollSpeed; // Move right to left
  //       scrollContainer.scrollLeft = scrollAmount;

  //       // Reset for infinite loop
  //       if (scrollAmount <= 0) {
  //         scrollAmount = totalWidth;
  //         scrollContainer.scrollLeft = scrollAmount; // Instantly reset to avoid skip
  //       }
  //     }
  //     requestAnimationFrame(autoScroll); // Smooth continuous animation
  //   };

  //   const animationId = requestAnimationFrame(autoScroll);
  //   return () => cancelAnimationFrame(animationId); // Cleanup
  // }, []);


  return (
    <div className="w-full flex flex-col">
      <div className="relative w-full h-[100vh] overflow-hidden">
        {/* Background Image */}
        <img
          src={assets.bg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay - Solid on small screens, original gradient on larger screens */}
        <div className="absolute inset-0 bg-pryClr/70 lg:bg-pryClr/0 md:bg-gradient-to-r md:from-pryClr md:via-pryClr/70 md:to-pryClr/20"></div>

        {/* Text Container - Centered on small screens, original layout on larger screens */}
        <div className="relative z-10 flex items-center h-full px-4 text-center md:text-left md:px-8 lg:px-12">
          <div className="w-full flex flex-col gap-8 md:w-[50%]">
            <h1 className="text-3xl font-bold text-white md:text-6xl">
              Welcome to <span className='text-secClr'>Pac Inn</span>
            </h1>
            <p className="text-base text-gray-200 md:text-lg leading-relaxed">
              Welcome to Pac Inn Hotel, where comfort meets vibrant energy. From our cozy rooms and friendly staff to the lively bar and exciting game center, we create a space where every guest feels at home and every moment is memorable
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
        <div className="w-[90%]  flex flex-col gap-12 items-center text-center">
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
                {/* Decorative Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                {/* Image with Zoom Effect */}
                <div className="relative w-full h-70 overflow-hidden rounded-2xl mb-6">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                {/* Title with Smooth Animation */}
                <h3 className="relative text-xl md:text-2xl font-bold mb-4 tracking-wide drop-shadow-lg">
                  {card.title}
                </h3>
                {/* Subtitle with Fade-in Effect */}
                <p className="relative text-sm md:text-base leading-6 opacity-90 max-w-md drop-shadow-md">
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-16 items-center justify-center text-gray-900 py-12 md:py-12 bg-tetClr/40">
        <div className="w-[90%]  flex flex-col gap-12 items-center text-center">
          <div className="w-full md:w-[70%] flex flex-col gap-6 items-center">
            <h2 className="font-bold text-3xl md:text-5xl text-trdClr">
              Accomodations
            </h2>
            <p className="w-full text-sm md:text-lg leading-7 md:leading-9 text-pryClr">
              Indulge in unmatched comfort and elegance with our carefully curated room selections at Pac Inn Hotel, designed for an unforgettable stay.
            </p>
          </div>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="relative group bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl "
              >
                <div className="relative h-70  overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-0 right-0 bg-tetClr flex gap-2 items-center  text-white text-sm font-semibold px-4 py-2 rounded-bl-2xl shadow-md">
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
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {events.map((event) => (
              <div
                key={event.id}
                className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-4 transform transition-all duration-500 overflow-hidden group"
              >
                {/* Image with Zoom Effect */}
                <div className="relative w-full h-70 overflow-hidden rounded-t-3xl">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                </div>
                {/* Content */}
                <div className="p-4 flex flex-col gap-2 text-center">
                  <h3 className="text-xl md:text-xl font-bold text-gray-800 tracking-wide drop-shadow-lg">
                    {event.title}
                  </h3>
                  <p className="text-sm md:text-sm text-gray-600 leading-6 opacity-90 max-w-md mx-auto">
                    {event.subtitle}
                  </p>
                  <NavLink
                    to="/ticket"
                    className="mt-4 inline-block bg-tetClr text-white py-3 px-6 rounded-full font-semibold text-sm md:text-sm hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    View Details
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-12 items-center justify-center text-gray-900 py-12 md:py-12 bg-tetClr/40">
        <div className="w-[100%] flex flex-col gap-10 items-center text-center">
          <div className="w-full md:w-[70%] flex flex-col gap-6 items-center">
            <h2 className="font-bold text-3xl md:text-5xl text-trdClr">
              Guest Testimonials
            </h2>
            <p className="w-full text-sm md:text-lg leading-7 md:leading-9 text-pryClr">
              Hear the heartfelt stories of our guests who found luxury and warmth at Pac Inn.
            </p>
          </div>
          <div className="w-full overflow-hidden relative">
            <div className="flex animate-scrollRightToLeft gap-6 py-6">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={`${testimonial.id}-${index}`}
                  className="flex-none w-[90%] sm:w-[60%] md:w-[40%] lg:w-[30%] min-w-[320px] max-w-[400px] bg-white rounded-3xl shadow-lg p-6 md:p-8 border-t-4 border-trdClr"
                >
                  <div className="flex flex-col gap-4 text-center relative">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
                      {testimonial.name}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light max-w-[360px] mx-auto italic">
                      "{testimonial.review}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-12 items-center justify-center text-gray-800 py-12 md:py-20 bg-gradient-to-b from-white to-teal-50">
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
      </div>


    </div>

  );
};

export default Home;