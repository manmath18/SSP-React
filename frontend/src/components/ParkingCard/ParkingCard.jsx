import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.scss';
import StarRating from '../StarRating/StarRating';
import { useSelector } from 'react-redux';

const ParkingCard = ({ parking, setSelectedParking, setShowDeleteModal }) => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const { name, address, city, lat, long, totalSlots, pricePerSlot, user_id, owner_rating } = parking;

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate('/edit-parking', { state: { parking } });
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setSelectedParking(parking);
        setShowDeleteModal(true);
    };

    const handleRatingClick = (e) => {
        e.stopPropagation();
        navigate('/review', { state: { owner_id: user_id?._id } });
    };

    const handleViewSlots = (e) => {
        e.stopPropagation();
        navigate('/parkingslot', { state: { parking } }); // Pass parking object to the ParkingSlots page
    };

    return (
        <>
            <div className="card">
                <div className="px-4 py-4 d-flex justify-content-between">
                    <div>
                        <h4>{name}</h4>
                        <span className="mt-5">Address</span>
                        <p>{address}</p>
                        <span>City</span>
                        <p>{city}</p>
                        <div className="d-flex">
                            <div>
                                <span>Lat</span>
                                <p>{lat}</p>
                            </div>
                            <div className="ms-3">
                                <span>Long</span>
                                <p>{long}</p>
                            </div>
                        </div>
                        <p>
                            <strong>Total Slots:</strong> {totalSlots}
                        </p>
                        <p>
                            <strong>Price per Slot:</strong> ₹{pricePerSlot}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex flex-column align-items-end">
                        {/* View Slots button visible to all users */}
                        <button className="btn btn-outline-info mb-2" onClick={handleViewSlots}>
                            View Slots
                        </button>

                        {/* Edit and Delete buttons only visible to owners */}
                        {user?.type === 'owner' && (
                            <>
                                <button className="btn btn-outline-warning mb-2" onClick={handleEdit}>
                                    Edit
                                </button>
                                <button className="btn btn-outline-danger" onClick={handleDelete}>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="posted-by px-4 py-2">
                    <p>
                        Posted by <span>{user_id?.name}</span>
                    </p>
                    <div onClick={handleRatingClick}>
                        <StarRating value={owner_rating} readonly />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ParkingCard;