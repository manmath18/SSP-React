import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteBooking, fetchBookings, updateBooking } from '../api/api';
import { DeleteModal } from '../components';
import Layout from './Layout';

const Booking = () => {
    const user = useSelector((state) => state.user);
    const [bookings, setBookings] = useState([]);

    // Delete management states
    const [selectedBooking, setSelectedBooking] = useState();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Used to display multiple Booking rows
    const bookingsRow = () => {
        return bookings.map((item, index) => (
            <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{item?.vehicle_name}</td>
                <td>{item?.plate_number}</td>
                <td>{moment(item?.start_time, "HH:mm").format("hh:mm A")}</td>
                <td>{item?.paymentMethod}</td>
                <td>{item?.confirm_booking}</td>
                <td>{moment.utc(item?.createdAt).format('DD-MM-YYYY / hh:mm A')}</td>
                <td>
                    {user?.type === 'owner' ? (
                        <>
                            {item?.confirm_booking === 'pending' ? (
                                <>
                                    <button
                                        className="btn btn-outline-success ms-2"
                                        onClick={() =>
                                            handleUpdateBooking({
                                                id: item?._id,
                                                confirm_booking: 'approved',
                                            })
                                        }
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-outline-danger ms-2"
                                        onClick={() =>
                                            handleUpdateBooking({
                                                id: item?._id,
                                                confirm_booking: 'rejected',
                                            })
                                        }
                                    >
                                        Reject
                                    </button>
                                </>
                            ) : null}
                            <button
                                className="btn btn-outline-danger ms-2"
                                onClick={() => handleDelete(item)}
                            >
                                Delete
                            </button>
                        </>
                    ) : (
                        <span>View Only</span>
                    )}
                </td>
            </tr>
        ));
    };

    useEffect(() => {
        // Fetch bookings based on user type
        if (user?.type === 'owner') {
            fetchBookings({ owner_id: user?._id, setBookings });
        } else {
            fetchBookings({ user_id: user?._id, setBookings });
        }
    }, [user?._id]);

    const handleDelete = (booking) => {
        setSelectedBooking(booking);
        setShowDeleteModal(true);
    };

    const handleUpdateBooking = ({ id, confirm_booking }) => {
        const body = { confirm_booking };
        updateBooking({
            id,
            body,
            handleUpdateBookingSuccess,
            handleUpdateBookingFailure,
        });
    };

    const handleUpdateBookingSuccess = () => {
        if (user?.type === 'owner') {
            fetchBookings({ owner_id: user?._id, setBookings });
        } else {
            fetchBookings({ user_id: user?._id, setBookings });
        }
    };

    const handleUpdateBookingFailure = (error) => {
        console.error('Error updating booking:', error);
    };

    const handleDeleteBooking = () => {
        deleteBooking({
            id: selectedBooking?._id,
            handleDeleteBookingSuccess,
            handleDeleteBookingFailure,
        });
    };

    const handleDeleteBookingSuccess = () => {
        fetchBookings({ user_id: user?._id, setBookings });
        setShowDeleteModal(false);
    };

    const handleDeleteBookingFailure = () => {
        setShowDeleteModal(false);
    };

    return (
        <>
            <Layout />
            <div className="container">
                <h1 className="mt-5">My Bookings</h1>

                <div className="row mt-2 g-5 table-responsive">
                    <table className="table table-striped table-hover booking-table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Vehicle Name</th>
                                <th scope="col">Plate Number</th>
                                <th scope="col">Start Time</th>
                                <th scope="col">Payment Method</th>
                                <th scope="col">Status</th>
                                <th scope="col">Booking Time</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings?.length > 0 ? (
                                bookingsRow()
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center">
                                        <em>No bookings found</em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <DeleteModal
                    showModal={showDeleteModal}
                    setShowModal={setShowDeleteModal}
                    onDeleteConfirm={handleDeleteBooking}
                />
            </div>
        </>
    );
};

export default Booking;