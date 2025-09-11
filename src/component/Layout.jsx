import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navbar overlays on top */}
      <Navbar />

      {/* Children take full height */}
      <main className="flex-grow relative">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
