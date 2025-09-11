import React from 'react'
import Home from './pages/Home'
import Layout from './component/layout'
import { Routes, Route } from 'react-router-dom';
import Bookings from './pages/Bookings';
import Ticket from './pages/Ticket';
import Contact from './pages/Contact';

const App = () => {
  return (
    <div>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Bookings />} />
          <Route path="/ticket" element={<Ticket />} />
          {/* <Route path="/plan" element={<Plan />} /> */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App