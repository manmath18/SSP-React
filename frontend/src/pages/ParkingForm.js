import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createParking } from '../api/api';
import './../css/createParking.scss';
import Layout from './Layout';

const ParkingForm = () => {
    const { state } = useLocation();
    const user = useSelector((state) => state.user);

    const [form, setForm] = useState({
        name: '',
        address: '',
        city: '',
        lat: '',
        long: '',
        totalSlots: '',
        pricePerSlot: ''
    });

    const [successMessage, setSuccessMessage] = useState();
    const [error, setError] = useState();

    const handleFormChange = ({ key, value }) => {
        setForm({ ...form, [key]: value });
    };

    const handleCreateParking = () => {
        setSuccessMessage();
        setError();

        // Generate slots dynamically based on totalSlots
        const slots = Array.from({ length: Number(form.totalSlots) }, (_, index) => ({
            slotNumber: index + 1,
            isBooked: false, // Initially, all slots are available
            price: Number(form.pricePerSlot),
        }));

        const body = { ...form, slots, user_id: user?._id }; // Include slots in the payload
        createParking({ body, handleCreateParkingSuccess, handleCreateParkingFailure });
    };

    const handleCreateParkingSuccess = (data) => {
        setSuccessMessage('Parking created successfully!');
    };

    const handleCreateParkingFailure = (error) => {
        setError(error);
    };

    const handleSubmit = () => {
        handleCreateParking();
    };

    useEffect(() => {
        if (state?.parking) {
            setForm({
                name: state.parking.name || '',
                address: state.parking.address || '',
                city: state.parking.city || '',
                lat: state.parking.lat?.toString() || '',
                long: state.parking.long?.toString() || '',
                totalSlots: state.parking.totalSlots?.toString() || '',
                pricePerSlot: state.parking.pricePerSlot?.toString() || ''
            });
        }
    }, [state]);

    return (
        <>
            <Layout />
            <div className="container py-5">
                <div className="card create-parking-card p-5">
                    <h3 className="mb-4">Create Parking</h3>
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Form Fields */}
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            onChange={(e) => handleFormChange({ key: 'name', value: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Address</label>
                        <textarea
                            rows={2}
                            className="form-control"
                            value={form.address}
                            onChange={(e) => handleFormChange({ key: 'address', value: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">City</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.city}
                            onChange={(e) => handleFormChange({ key: 'city', value: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Latitude</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.lat}
                            onChange={(e) => handleFormChange({ key: 'lat', value: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Longitude</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.long}
                            onChange={(e) => handleFormChange({ key: 'long', value: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Total Slots</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.totalSlots}
                            onChange={(e) => handleFormChange({ key: 'totalSlots', value: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Price per Slot (₹)</label>
                        <input
                            type="number"
                            className="form-control"
                            value={form.pricePerSlot}
                            onChange={(e) => handleFormChange({ key: 'pricePerSlot', value: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary mt-4" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        </>
    );
};

export default ParkingForm;