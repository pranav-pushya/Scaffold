import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="mainContent" className="flex-1">
        <Outlet key={location.pathname} />
      </main>
      <Footer />
    </div>
  );
}
