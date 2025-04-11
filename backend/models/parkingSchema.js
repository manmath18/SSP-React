import mongoose from "mongoose";
const parkingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    lat: { type: String, required: true },
    long: { type: String, required: true },
    totalSlots: { type: Number, required: true },
    pricePerSlot: { type: Number, required: true },
    slots: [
        {
            slotNumber: { type: Number, required: true },
            isBooked: { type: Boolean, default: false },
            price: { type: Number, required: true },
        },
    ],
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export const Parking = mongoose.model("Parking", parkingSchema);