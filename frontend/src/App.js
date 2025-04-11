import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home, NoPage, Parking } from './pages';
import ParkingForm from './pages/ParkingForm';
import Login from './pages/Login';
import Register from './pages/Register';
import BookingForm from './pages/BookingForm';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Reviews from './pages/Reviews';
import Users from './pages/Users';
import About from './pages/About.js';
import ImageUpload from './pages/ImageUpload';
import ParkingSlot from './pages/ParkingSlots.js'
import EditParkingForm from './pages/EditParkingForm.js';

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
          <Route path="/parking" element={<Parking />} />
          <Route path="/parkingForm" element={<ParkingForm />} />
          <Route path="/parkingslot" element={<ParkingSlot/>}/>
          <Route path="/bookingForm" element={<BookingForm />} />
          <Route path="/edit-parking" element={<EditParkingForm/>}/>
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
