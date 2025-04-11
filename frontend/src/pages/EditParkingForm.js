import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { updateParking } from '../api/api';
import './../css/createParking.scss';
import Layout from './Layout';

const EditParkingForm = () => {
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

    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleFormChange = ({ key, value }) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleUpdateParking = () => {
        setSuccessMessage();
        setError();
    
        const body = {
            ...form,
            user_id: user?._id,
        };
    
        // Only include slots if totalSlots or pricePerSlot has changed
        if (form.totalSlots !== state?.parking?.totalSlots || form.pricePerSlot !== state?.parking?.pricePerSlot) {
            body.slots = Array.from({ length: Number(form.totalSlots) }, (_, index) => ({
                slotNumber: index + 1,
                isBooked: false, // Keep existing slots as available
                price: Number(form.pricePerSlot),
            }));
        }
    
        console.log("Payload Sent to Backend:", body); // Debugging
    
        updateParking({
            id: state?.parking?._id,
            body,
            handleUpdateParkingSuccess,
            handleUpdateParkingFailure,
        });
    };
    const handleUpdateParkingSuccess = () => {
        setSuccessMessage('Parking updated successfully!');
    };

    const handleUpdateParkingFailure = (error) => {
        setError(error);
    };

    const handleSubmit = () => {
        handleUpdateParking();
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
            <div className='container py-5'>
                <div className='card create-parking-card p-5'>
                    <h3 className='mb-4'>Update Parking</h3>
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    {error && <div className="alert alert-danger">{error}</div>}

                    {/* Name */}
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input type="text" className="form-control" value={form.name} onChange={(e) => handleFormChange({ key: 'name', value: e.target.value })} />
                    </div>

                    {/* Address */}
                    <div className="mb-3">
                        <label className="form-label">Address</label>
                        <textarea rows={2} className="form-control" value={form.address} onChange={(e) => handleFormChange({ key: 'address', value: e.target.value })} />
                    </div>

                    {/* City */}
                    <div className="mb-3">
                        <label className="form-label">City</label>
                        <input type="text" className="form-control" value={form.city} onChange={(e) => handleFormChange({ key: 'city', value: e.target.value })} />
                    </div>

                    {/* Latitude */}
                    <div className="mb-3">
                        <label className="form-label">Latitude</label>
                        <input type="number" className="form-control" value={form.lat} onChange={(e) => handleFormChange({ key: 'lat', value: e.target.value })} />
                    </div>

                    {/* Longitude */}
                    <div className="mb-3">
                        <label className="form-label">Longitude</label>
                        <input type="number" className="form-control" value={form.long} onChange={(e) => handleFormChange({ key: 'long', value: e.target.value })} />
                    </div>

                    {/* Total Slots */}
                    <div className="mb-3">
                        <label className="form-label">Total Slots</label>
                        <input type="number" className="form-control" value={form.totalSlots} onChange={(e) => handleFormChange({ key: 'totalSlots', value: e.target.value })} />
                    </div>

                    {/* Price Per Slot */}
                    <div className="mb-3">
                        <label className="form-label">Price per Slot (₹)</label>
                        <input type="number" className="form-control" value={form.pricePerSlot} onChange={(e) => handleFormChange({ key: 'pricePerSlot', value: e.target.value })} />
                    </div>

                    <button type="submit" className="btn btn-primary mt-4" onClick={handleSubmit}>Update</button>
                </div>
            </div>
        </>
    );
};

export default EditParkingForm;