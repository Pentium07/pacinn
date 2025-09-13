import React from 'react';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Bookings from './pages/Bookings';
import Ticket from './pages/Ticket';
import Contact from './pages/Contact';
import Mode from './component/Mode';
import Admin from './admin/Admin';
import Dashboard from './admin/Dashboard';
import Room from './admin/Room';
import Event from './admin/Event';
import Scanner from './admin/Scanner';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Routes with Mode layout */}
        <Route
          path="/"
          element={
            <Mode>
              <Home />
            </Mode>
          }
        />
        <Route
          path="/booking"
          element={
            <Mode>
              <Bookings />
            </Mode>
          }
        />
        <Route
          path="/ticket"
          element={
            <Mode>
              <Ticket />
            </Mode>
          }
        />
        <Route
          path="/contact"
          element={
            <Mode>
              <Contact />
            </Mode>
          }
        />

        <Route path="/admin" element={<Admin />}>
          {/* when just "/admin" → Dashboard */}
          <Route index element={<Dashboard />} />

          {/* nested admin pages */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="booking" element={<Room />} />
          <Route path="event" element={<Event />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>


        {/* </Routes> */}
      </Routes>
    </div>
  );
};

export default App;
