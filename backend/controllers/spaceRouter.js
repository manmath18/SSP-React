import { Router } from "express";
import { Booking } from "../models/bookingSchema.js";
import { Space } from "../models/spaceSchema.js";
import Joi from "joi";
import { Types } from "mongoose";

const spaceRouter = Router();

// Create new space
spaceRouter.post("/", async (req, res) => {
    try {
        let { name, date, slot_start_time, slot_end_time, price, parking_id } = req.body;

        // Input validation
        const schema = Joi.object({
            name: Joi.string().required(),
            date: Joi.date().required(),
            slot_start_time: Joi.string().required(),
            slot_end_time: Joi.string().required(),
            price: Joi.number().required(),
            parking_id: Joi.string().required(),
        });

        const { error } = schema.validate({ name, date, slot_start_time, slot_end_time, price, parking_id });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const space = await Space.create({ name, date, slot_start_time, slot_end_time, price, parking_id });
        res.json({ message: "Space created", space });
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error: "An error occurred while creating the space." });
    }
});

// Get existing space list
spaceRouter.get("/", async (req, res) => {
    try {
        const { user_id, parking_id, date, city, time, availability } = req.query;
        let query = {};

        // Filter by parking_id
        if (parking_id) {
            query.parking_id = parking_id;
        }

        // Filter by date
        if (date) {
            query.date = new Date(date);
        }

        // Filter by time
        if (time) {
            query.slot_start_time = time;
        }

        // Fetch all booked space IDs
        const bookings = await Booking.find();
        const bookedSpaces = new Set();
        bookings.forEach(booking => {
            if (booking.confirm_booking === 'approved') {
                bookedSpaces.add(booking.space_id.toString());
            }
        });

        let spaces = await Space.find(query).populate('parking_id');

        // Filter spaces by availability
        if (availability) {
            spaces = spaces.filter(space => !bookedSpaces.has(space._id.toString()));
        }

        // Filter by user_id if provided
        if (user_id) {
            spaces = spaces.filter((item) => item?.parking_id?.user_id.equals(user_id));
        }

        // Add an 'is_booked' flag to each space
        const spacesWithBookedFlag = spaces.map(space => {
            const isBooked = bookedSpaces.has(space._id.toString());
            return { ...space.toJSON(), is_booked: isBooked };
        });

        res.json(spacesWithBookedFlag);
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error: "An error occurred while fetching spaces." });
    }
});

// Update space
spaceRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (Types.ObjectId.isValid(id)) {
            const space = await Space.findById({ _id: id });
            if (!space) {
                return res.status(400).json({ error: "Space not found" });
            }

            // Input validation
            const schema = Joi.object({
                name: Joi.string().required(),
                date: Joi.date().required(),
                slot_start_time: Joi.string().required(),
                slot_end_time: Joi.string().required(),
                price: Joi.number().required(),
                parking_id: Joi.string().required(),
            });

            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const updatedSpace = await space.updateOne({ ...req.body });
            if (updatedSpace) {
                res.json({ message: 'Space updated successfully' });
            } else {
                res.status(400).json({ error: 'Space not updated' });
            }
        } else {
            res.status(400).json({ error: "Invalid id" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error: "An error occurred while updating the space." });
    }
});

// Delete space
spaceRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (Types.ObjectId.isValid(id)) {
            const space = await Space.findByIdAndDelete({ _id: id });
            if (space) {
                res.json({ message: "Space deleted successfully" });
            } else {
                res.status(404).json({ error: "Space not found" });
            }
        } else {
            res.status(400).json({ error: "Invalid space id" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error: "An error occurred while deleting the space." });
    }
});

export default spaceRouter;
