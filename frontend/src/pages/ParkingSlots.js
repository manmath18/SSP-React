import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./../css/slotDetails.scss";
import Layout from "./Layout";
import axios from "axios";

const SlotDetails = () => {
  const { state } = useLocation();
  const parking = state?.parking;
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [totalSlots, setTotalSlots] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null); // State to track selected slot

  // Fetch slot data dynamically
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/parking/${parking?._id}/slots`
        );
        setSlots(response.data.slots);
        setTotalSlots(response.data.totalSlots);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };

    if (parking?._id) {
      fetchSlots();
    }
  }, [parking?._id]);

  // Close the dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".slot-dialog") &&
        !event.target.closest(".slot-box")
      ) {
        setSelectedSlot(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const renderSlots = () => {
    const slotElements = [];
    for (let i = 1; i <= totalSlots; i++) {
        const slot = slots.find((slot) => slot.slotNumber === i);
        const isBooked = slot?.isBooked;

        slotElements.push(
            <div
                key={i}
                className={`slot-box ${isBooked ? "booked" : "empty"}`}
                title={isBooked ? `Slot ${i}: Booked` : `Slot ${i}: Available`}
                onClick={() => setSelectedSlot(slot)}
            >
                {i}
            </div>
        );
    }
    return <div className="slots-grid">{slotElements}</div>;
};
  const handleBookSlot = (slot) => {
    console.log("Booking slot:", slot);
    navigate("/bookingForm", { state: { slot, parking } }); // Pass slot and parking data
  };

  return (
    <>
      <Layout />
      <div className="slot-container mt-5">
        <div className="parking-details-card">
          <h2 className="parking-title">{parking?.name}</h2>
          <div className="parking-info">
            <p>
              <strong>Address:</strong> {parking?.address}
            </p>
            <p>
              <strong>City:</strong> {parking?.city}
            </p>
            <p>
              <strong>Coordinates:</strong> {parking?.lat}, {parking?.long}
            </p>
            <p>
              <strong>Total Slots:</strong> {totalSlots}
            </p>
            <p>
              <strong>Price per Slot:</strong> ₹{parking?.pricePerSlot}
            </p>
          </div>
        </div>

        <h4 className="slot-availability-title">Slot Availability</h4>
        {renderSlots()}

        {/* Dialog for Selected Slot */}
        {selectedSlot && (
          <div className="slot-dialog">
            <p>
              <strong>Slot Number :</strong> {selectedSlot.slotNumber}
            </p>
            <p>
              <strong>Price per Slot :</strong> ₹{selectedSlot.price}
            </p>
            <p>
              <strong>Availability :</strong>{" "}
              {selectedSlot.isBooked ? "Booked" : "Available"}
            </p>
            {!selectedSlot.isBooked && (
              <button
                className="btn btn-primary"
                onClick={() => handleBookSlot(selectedSlot)}
              >
                Book Slot
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SlotDetails;
