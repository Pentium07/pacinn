import React from 'react'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom';
import Bookings from './pages/Bookings';
import Ticket from './pages/Ticket';
import Contact from './pages/Contact';
import Mode from './component/Mode';

const App = () => {
  return (
    <div>
      <Mode>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Bookings />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Mode>
    </div>
  )
}

export default App