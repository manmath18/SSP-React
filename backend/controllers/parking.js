import { Router } from "express";
import { Parking } from "../models/parkingSchema.js";
import Joi from "joi";
import { Types } from "mongoose";
import { Review } from "../models/reviewSchema.js";

const parkingRouter = Router();

parkingRouter.post("/", async (req, res) => {
    try {
        let { name, address, city, lat, long, totalSlots, pricePerSlot, user_id, slots } = req.body;

        // Convert to numbers
        totalSlots = Number(totalSlots);
        pricePerSlot = Number(pricePerSlot);

        // Input validation
        const schema = Joi.object({
            name: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            lat: Joi.string().required(),
            long: Joi.string().required(),
            totalSlots: Joi.number().required(),
            pricePerSlot: Joi.number().required(),
            user_id: Joi.string().required(),
            slots: Joi.array().items(
                Joi.object({
                    slotNumber: Joi.number().required(),
                    isBooked: Joi.boolean().required(),
                    price: Joi.number().required(),
                })
            ).optional(), // Make slots optional since it is generated dynamically
        });

        const { error } = schema.validate({ name, address, city, lat, long, totalSlots, pricePerSlot, user_id, slots });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Generate slots array dynamically if not provided
        if (!slots || slots.length === 0) {
            slots = Array.from({ length: totalSlots }, (_, index) => ({
                slotNumber: index + 1,
                isBooked: false,
                price: pricePerSlot,
            }));
        }

        console.log("Generated Slots:", slots);

        // Create parking with slots
        const parking = await Parking.create({ name, address, city, lat, long, totalSlots, pricePerSlot, slots, user_id });
        res.json({ message: "Parking created successfully", parking });
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});
parkingRouter.get("/", async (req, res) => {
    try {
        const { user_id, city, price } = req.query;
        // Build the query object dynamically
        const query = {};
        if (user_id) query.user_id = user_id;
        if (city) query.city = { $regex: city, $options: "i" }; // Case-insensitive search
        if (price) query.pricePerSlot = { $lte: Number(price) }; // Filter by max price

        const parking = await Parking.find(query).populate("user_id");

        res.json(parking);
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

parkingRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid parking ID" });
        }

        const parking = await Parking.findById({ _id: id });
        if (!parking) {
            return res.status(404).json({ error: "Parking not found" });
        }

        // Extract fields from the request body
        const { name, address, city, lat, long, totalSlots, pricePerSlot, user_id, slots } = req.body;

        // Handle the slots field dynamically
        let updatedSlots = [...parking.slots]; // Copy existing slots
        if (slots && Array.isArray(slots)) {
            updatedSlots = slots; // Use the provided slots if they exist
        } else if (totalSlots > parking.totalSlots) {
            // Add new slots if totalSlots has increased
            const newSlots = Array.from(
                { length: totalSlots - parking.totalSlots },
                (_, index) => ({
                    slotNumber: parking.totalSlots + index + 1,
                    isBooked: false,
                    price: pricePerSlot,
                })
            );
            updatedSlots = [...updatedSlots, ...newSlots];
        } else if (totalSlots < parking.totalSlots) {
            // Remove extra slots if totalSlots has decreased
            updatedSlots = updatedSlots.slice(0, totalSlots);
        }

        // Update slot prices
        updatedSlots = updatedSlots.map((slot) => ({
            ...slot,
            price: pricePerSlot,
        }));

        // Prepare the updated parking object
        const updatedParkingObj = {
            name: name || parking.name,
            address: address || parking.address,
            city: city || parking.city,
            lat: lat || parking.lat,
            long: long || parking.long,
            totalSlots: totalSlots || parking.totalSlots,
            pricePerSlot: pricePerSlot || parking.pricePerSlot,
            slots: updatedSlots,
            user_id: user_id || parking.user_id,
        };

        // Update the parking in the database
        const updatedParking = await Parking.findByIdAndUpdate(id, updatedParkingObj, { new: true });
        if (updatedParking) {
            res.json({ message: "Parking updated successfully", parking: updatedParking });
        } else {
            res.status(400).json({ error: "Parking not updated" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(500).json({ error: "An error occurred while updating parking" });
    }
});
// Delete parking
parkingRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate id and delete parking if exists
        if (Types.ObjectId.isValid(id)) {
            const parking = await Parking.findByIdAndDelete({ _id: id });

            if (parking) {
                res.json({ message: "Parking deleted successfully" });
            } else {
                res.status(404).json({ error: "Parking not found" });
            }
        } else {
            res.status(400).json({ error: "Invalid parking id" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
});
parkingRouter.get("/:id/slots", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid parking ID" });
        }

        const parking = await Parking.findById(id);
        if (!parking) {
            return res.status(404).json({ error: "Parking not found" });
        }

        res.json({ slots: parking.slots, totalSlots: parking.totalSlots });
    } catch (error) {
        console.error("Error fetching slots:", error);
        res.status(500).json({ error: "An error occurred while fetching slots" });
    }
});
parkingRouter.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid parking ID" });
        }

        const parking = await Parking.findById(id);
        if (!parking) {
            return res.status(404).json({ error: "Parking not found" });
        }

        res.json(parking);
    } catch (error) {
        console.error("Error fetching parking details:", error);
        res.status(500).json({ error: "An error occurred while fetching parking details" });
    }
});
export default parkingRouter;
