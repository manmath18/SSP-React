import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home, Layout, NoPage, Parking } from './pages';
import ParkingForm from './pages/ParkingForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Space from './pages/Space';
import SpaceForm from './pages/SpaceForm';
import BookingForm from './pages/BookingForm';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Reviews from './pages/Reviews';
import Users from './pages/Users';
import About from './pages/About.js';
import ImageUpload from './pages/ImageUpload';
// import { useState } from 'react';
// import axios from 'axios';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useLocation } from 'react-router-dom';
// import { useParams } from 'react-router-dom';
// import { useRef } from 'react';
// import { useMemo } from 'react';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
          <Route path="/parking" element={<Parking />} />
          <Route path="/parkingForm" element={<ParkingForm />} />
          <Route path="/space" element={<Space />} />
          <Route path="/spaceForm" element={<SpaceForm />} />
          <Route path="/bookingForm" element={<BookingForm />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/review" element={<Reviews />} />
          <Route path="/users" element={<Users />} />/
          <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<NoPage />} />
        <Route path="/upload" element={<ImageUpload />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
