import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteParking, fetchParkings } from '../api/api';
import { DeleteModal, ParkingCard } from '../components';
import './../css/parking.scss';
import Layout from './Layout';

const Parking = () => {
    const user = useSelector((state) => state.user);
    const [parkings, setParkings] = useState([]);

    // Filter form state
    const [filterForm, setFilterForm] = useState({
        city: '',
        price: '',
        availability: false,
    });

    const [selectedParking, setSelectedParking] = useState();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        // Fetch parking list based on user type
        if (user?.type === 'owner') {
            fetchParkings({ user_id: user?._id, setParkings });
        } else {
            fetchParkings({ setParkings });
        }
    }, [user?._id]);

    const handleFilterChange = ({ key, value }) => {
        setFilterForm({ ...filterForm, [key]: value });
    };

    const handleFilter = () => {
        setParkings([]);
        fetchParkings({ ...filterForm, setParkings });
    };

    const parkingCards = () => {
        return parkings.map((item, index) => (
            <div className="col-md-4" key={index}>
                <ParkingCard
                    parking={item}
                    setSelectedParking={setSelectedParking}
                    setShowDeleteModal={setShowDeleteModal}
                />
            </div>
        ));
    };

    const handleDeleteParking = () => {
        deleteParking({ id: selectedParking?._id, handleDeleteParkingSuccess, handleDeleteParkingFailure });
    };

    const handleDeleteParkingSuccess = () => {
        fetchParkings({ ...filterForm, setParkings });
        setShowDeleteModal(false);
    };

    const handleDeleteParkingFailure = () => {
        setShowDeleteModal(false);
    };

    return (
        <>
            <Layout />
            <div className="container">
                <h1 className="mt-5">Parkings</h1>

                {/* Filter Section */}
                <div className="card p-4 mt-5">
                    <div className="row g-3 d-flex align-items-center">
                        <div className="col-md-3">
                            <input
                                type="text"
                                placeholder="City"
                                className="form-control"
                                value={filterForm.city}
                                onChange={(e) => handleFilterChange({ key: 'city', value: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <input
                                type="number"
                                placeholder="Max Price"
                                className="form-control"
                                value={filterForm.price}
                                onChange={(e) => handleFilterChange({ key: 'price', value: e.target.value })}
                            />
                        </div>
                        <div className="col-md-3">
                            <button
                                type="submit"
                                className="form-control btn btn-primary"
                                onClick={handleFilter}
                            >
                                Search
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search ms-2" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <h4 className="mt-5">Showing {parkings?.length || '0'} results</h4>

                <div className="row mt-2 g-5">
                    {parkingCards()}
                </div>

                <DeleteModal
                    value={selectedParking?.name}
                    showModal={showDeleteModal}
                    setShowModal={setShowDeleteModal}
                    onDeleteConfirm={handleDeleteParking}
                />
            </div>
        </>
    );
};

export default Parking;