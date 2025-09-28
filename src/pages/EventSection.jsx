import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_BASE_URL;

const EventSection = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/events?limit=3&t=${Date.now()}`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      console.log('API response:', JSON.stringify(response.data, null, 2));

      let fetchedEvents = [];
      if (Array.isArray(response.data.data)) {
        fetchedEvents = response.data.data;
      } else if (Array.isArray(response.data.events)) {
        fetchedEvents = response.data.events;
      } else if (response.data.event) {
        fetchedEvents = [response.data.event];
      } else if (response.data.data?.data) {
        fetchedEvents = response.data.data.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        fetchedEvents = [];
      }

      const mappedEvents = fetchedEvents.slice(0, 3).map(event => ({
        id: event.id || Date.now() + Math.random(),
        title: event.name || 'Unnamed Event',
        subtitle: event.description || 'No description available',
        image: event.image
          ? event.image.startsWith('http')
            ? event.image
            : `${STORAGE_URL}/${event.image}`
          : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?...',
      }));

      setEvents(mappedEvents);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      const errorMessage =
        err.code === 'ERR_NETWORK'
          ? 'Failed to fetch events due to network issues.'
          : err.response?.data?.message || 'Failed to fetch events.';
      setError(errorMessage);
      setEvents([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-tetClr h-12 w-12"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-tetClr rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-tetClr rounded col-span-2"></div>
                  <div className="h-2 bg-tetClr rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-tetClr rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-gray-600">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-600">No events found</div>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {events[0] && (
            <div
              key={events[0].id}
              className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-4 transform transition-all duration-500 overflow-hidden group"
            >
              <div className="relative w-full h-70 overflow-hidden rounded-t-3xl">
                <img
                  src={events[0].image}
                  alt={events[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <div className="p-4 flex flex-col gap-2 text-center">
                <h3 className="text-xl md:text-xl font-bold text-gray-800 tracking-wide drop-shadow-lg">
                  {events[0].title}
                </h3>
                <p className="text-sm md:text-sm text-gray-600 leading-6 opacity-90 max-w-md mx-auto">
                  {events[0].subtitle}
                </p>
                <NavLink
                  to="/ticket"
                  className="mt-4 inline-block bg-tetClr text-white py-3 px-6 rounded-full font-semibold text-sm md:text-sm hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  View Details
                </NavLink>
              </div>
            </div>
          )}
          {events[1] && (
            <div
              key={events[1].id}
              className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-4 transform transition-all duration-500 overflow-hidden group"
            >
              <div className="relative w-full h-70 overflow-hidden rounded-t-3xl">
                <img
                  src={events[1].image}
                  alt={events[1].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <div className="p-4 flex flex-col gap-2 text-center">
                <h3 className="text-xl md:text-xl font-bold text-gray-800 tracking-wide drop-shadow-lg">
                  {events[1].title}
                </h3>
                <p className="text-sm md:text-sm text-gray-600 leading-6 opacity-90 max-w-md mx-auto">
                  {events[1].subtitle}
                </p>
                <NavLink
                  to="/ticket"
                  className="mt-4 inline-block bg-tetClr text-white py-3 px-6 rounded-full font-semibold text-sm md:text-sm hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  View Details
                </NavLink>
              </div>
            </div>
          )}
          {events[2] && (
            <div
              key={events[2].id}
              className="relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-4 transform transition-all duration-500 overflow-hidden group"
            >
              <div className="relative w-full h-70 overflow-hidden rounded-t-3xl">
                <img
                  src={events[2].image}
                  alt={events[2].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <div className="p-4 flex flex-col gap-2 text-center">
                <h3 className="text-xl md:text-xl font-bold text-gray-800 tracking-wide drop-shadow-lg">
                  {events[2].title}
                </h3>
                <p className="text-sm md:text-sm text-gray-600 leading-6 opacity-90 max-w-md mx-auto">
                  {events[2].subtitle}
                </p>
                <NavLink
                  to="/ticket"
                  className="mt-4 inline-block bg-tetClr text-white py-3 px-6 rounded-full font-semibold text-sm md:text-sm hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  View Details
                </NavLink>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventSection;