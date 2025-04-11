import { Router } from "express";
import { Booking } from "../models/bookingSchema.js";
import { Parking } from "../models/parkingSchema.js";
import { Types } from "mongoose";

const bookingRouter = Router();

// Middleware to check if the user is an owner
const isOwner = async (req, res, next) => {
    const { user_id } = req.query; // Assuming user_id is passed in the query or headers
    const { id } = req.params; // Booking ID for update/delete routes

    try {
        console.log("Middleware: user_id:", user_id, "booking_id:", id); // Debugging

        if (!user_id) {
            return res.status(400).json({ error: "User ID is missing" });
        }

        if (!Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // Check if the user is the owner of the parking associated with the booking
        const booking = await Booking.findById(id).populate("parking_id");
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        console.log("Middleware: booking.parking_id.user_id:", booking.parking_id.user_id.toString()); // Debugging

        if (booking.parking_id.user_id.toString() !== user_id) {
            return res.status(403).json({ error: "You are not authorized to perform this action" });
        }

        next();
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(500).json({ error: "An error occurred while checking ownership" });
    }
};
bookingRouter.post("/", async (req, res) => {
    try {
        const { vehicle_name, plate_number, start_time, paymentMethod, slotNumber, parking_id, user_id } = req.body;

        // Create the booking
        const booking = await Booking.create({
            vehicle_name,
            plate_number,
            start_time,
            paymentMethod,
            slotNumber,
            parking_id,
            user_id,
            confirm_booking: "confirmed", // Automatically set to confirmed
        });

        res.json({ message: "Booking created successfully", booking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "An error occurred while creating the booking" });
    }
});
// Fetch bookings
bookingRouter.get("/", async (req, res) => {
    try {
        const { user_id, owner_id } = req.query;

        let query = {};
        if (user_id) {
            // Fetch bookings for a specific user (seeker)
            query.user_id = user_id;
        }

        let bookings;

        if (owner_id) {
            // Fetch bookings for all parkings created by the owner
            const parkings = await Parking.find({ user_id: owner_id }).select("_id");
            const parkingIds = parkings.map((parking) => parking._id);

            bookings = await Booking.find({ parking_id: { $in: parkingIds } })
                .populate("parking_id", "name address city") // Populate parking details
                .populate("user_id", "name email"); // Populate user details
        } else {
            // Fetch bookings for a specific user (seeker)
            bookings = await Booking.find(query)
                .populate("parking_id", "name address city") // Populate parking details
                .populate("user_id", "name email"); // Populate user details
        }

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: "An error occurred while fetching bookings" });
    }
});
// Update a booking (only for owners)
bookingRouter.put("/:id", isOwner, async (req, res) => {
    try {
        const { id } = req.params;
        const { confirm_booking } = req.body;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid booking ID" });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Update the booking status
        booking.confirm_booking = confirm_booking || booking.confirm_booking;
        await booking.save();

        res.json({ message: "Booking updated successfully", booking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ error: "An error occurred while updating the booking" });
    }
});

// Delete a booking (only for owners)
bookingRouter.delete("/:id", isOwner, async (req, res) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid booking ID" });
        }

        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const parking = await Parking.findOneAndUpdate(
            { "slots._id": booking.slot_id },
            { $set: { "slots.$.isBooked": false } },
            { new: true }
        );

        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ error: "An error occurred while deleting the booking" });
    }
});

export default bookingRouter;