import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import './../css/bookingForm.scss';
import Layout from './Layout';
import axios from 'axios';

const BookingForm = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [slot, setSlot] = useState(null);
    const [parkingDetails, setParkingDetails] = useState(null);

    const [form, setForm] = useState({
        vehicle_name: '',
        plate_number: '',
        start_time: '',
        paymentMethod: 'cash', // Default payment method
    });

    const [isCreated, setIsCreated] = useState(false);
    const [error, setError] = useState();

    const handleFormChange = ({ key, value }) => {
        setForm({ ...form, [key]: value });
    };

    const handleCreateBooking = async () => {
        setIsCreated(false);
        setError();

        const body = {
            ...form,
            user_id: user?._id,
            slotNumber: slot?.slotNumber,
            parking_id: state?.parking?._id,
            confirm_booking: "pending", // Set to pending until payment is verified
        };

        try {
            // Create the booking
            const bookingResponse = await axios.post("http://localhost:8000/booking", body);

            if (bookingResponse?.data?.booking) {
                // Redirect to the UPI frontend
                window.location.href = "https://upi-frontend.vercel.app/";
            } else {
                setError("Failed to create booking.");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            setError("An error occurred while creating the booking.");
        }
    };

    const fetchParkingDetails = async (parkingId) => {
        try {
            const response = await axios.get(`http://localhost:8000/parking/${parkingId}`);
            setParkingDetails(response.data);
        } catch (error) {
            console.error('Error fetching parking details:', error);
        }
    };

    useEffect(() => {
        if (state?.slot) {
            setSlot(state.slot);
            fetchParkingDetails(state.parking?._id);
        }
    }, [state]);

    return (
        <>
            <Layout />
            <div className="book-container py-5">
                <div className="card booking-card p-5">
                    <h3 className="mb-4 h3-Book">Slot Details</h3>
                    {slot && parkingDetails && (
                        <div className="slot-details">
                            <p><strong>Slot Number:</strong> {slot?.slotNumber}</p>
                            <p><strong>Price:</strong> ₹{slot?.price}</p>
                            <p><strong>Availability:</strong> {slot?.isBooked ? 'Booked' : 'Available'}</p>
                            <p><strong>Address:</strong> {parkingDetails?.address}</p>
                            <p><strong>City:</strong> {parkingDetails?.city}</p>
                        </div>
                    )}

                    <h3 className="mb-4 h3-Book">Booking Form</h3>
                    {isCreated && (
                        <div className="alert alert-success" role="alert">
                            Booking created successfully!
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <label htmlFor="vehicle_name" className="form-book-label">Vehicle Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="vehicle_name"
                            value={form?.vehicle_name}
                            onChange={(e) => handleFormChange({ key: 'vehicle_name', value: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="plate_number" className="form-book-label">Plate Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id="plate_number"
                            value={form?.plate_number}
                            onChange={(e) => handleFormChange({ key: 'plate_number', value: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="start_time" className="form-book-label">Start Time</label>
                        <input
                            type="time"
                            className="form-control"
                            id="start_time"
                            value={form?.start_time}
                            onChange={(e) => handleFormChange({ key: 'start_time', value: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-book-label">Payment Method</label>
                        <div className="payment-method-grid">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    id="cash"
                                    value="cash"
                                    checked={form.paymentMethod === 'cash'}
                                    onChange={(e) => handleFormChange({ key: 'paymentMethod', value: e.target.value })}
                                />
                                <label className="form-check-label" htmlFor="cash">
                                    Cash
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentMethod"
                                    id="online"
                                    value="online"
                                    checked={form.paymentMethod === 'online'}
                                    onChange={(e) => handleFormChange({ key: 'paymentMethod', value: e.target.value })}
                                />
                                <label className="form-check-label" htmlFor="online">
                                    Online
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between">
                        <button
                            type="button"
                            className={`btn btn-secondary half-width ${form.paymentMethod === 'online' ? 'enabled' : 'disabled'}`}
                            disabled={form.paymentMethod !== 'online'}
                            onClick={handleCreateBooking}
                        >
                            Pay Now
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary half-width"
                            onClick={handleCreateBooking}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookingForm;