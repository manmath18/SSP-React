import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    vehicle_name: {
        type: String,
        required: true,
    },
    plate_number: {
        type: String,
        required: true,
    },
    start_time: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["cash", "online"],
    },
    confirm_booking: {
        type: String,
        required: true,
        enum: ["approved", "rejected", "pending", "confirmed"], // Add "confirmed" as a valid value
        default: "pending",
    },
    slotNumber: {
        type: Number, // Store the slot number directly
        required: true,
    },
    parking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parking", // Reference the Parking model
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);