import React from 'react';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Bookings from './pages/Bookings';
import Ticket from './pages/Ticket';
import Contact from './pages/Contact';
import Mode from './component/Mode';
import Admin from './admin/admin';
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
  <Route index element={<Dashboard />} />
</Route>

<Route path="/admin/dashboard" element={<Admin><Dashboard /></Admin>} />
<Route path="/admin/booking" element={<Admin><Room /></Admin>} />
<Route path="/admin/event" element={<Admin><Event /></Admin>} />
<Route path="/admin/scanner" element={<Admin><Scanner /></Admin>} />


        {/* </Routes> */}
      </Routes>
    </div>
  );
};

export default App;
