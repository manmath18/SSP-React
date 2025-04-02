import { Router } from "express";
import { Parking } from "../models/parkingSchema.js";
import Joi from "joi";
import { Types } from "mongoose";
import { Review } from "../models/reviewSchema.js";

const parkingRouter = Router();

// Create new parking
parkingRouter.post("/", async (req, res) => {
    try {
        let { name, address, city, lat, long, user_id } = req.body;

        // Input validation
        const schema = Joi.object({
            name: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            lat: Joi.string().required(),
            long: Joi.string().required(),
            user_id: Joi.string().required(),
        });

        const { error } = schema.validate({ name, address, city, lat, long, user_id });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const parking = await Parking.create({ name, address, city, lat, long, user_id });
        res.json({ message: "Parking created", parking });
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Get existing parking list
parkingRouter.get("/", async (req, res) => {
    try {
        const { user_id } = req.query;
        let parking;
        if (user_id) {
            parking = await Parking.find({ user_id }).populate("user_id");
        } else {
            parking = await Parking.find({}).populate("user_id");
        }

        const reviews = await Review.find();

        const parkingWithOwnerRatings = parking.map((item) => {
            let rating = 0;
            let count = 0;
            const userReviews = reviews.filter((review) => {
                console.log("review ", review);
                console.log("item?.user_id ", item?.user_id);
                return review.owner_id.equals(item?.user_id?._id);
            });
            console.log("userReviews ", userReviews);
            userReviews.forEach((review) => {
                rating += review?.rating;
                count++;
            });
            const owner_rating = rating > 0 ? rating / count : 0;

            return { ...item.toObject(), owner_rating };
        });

        res.json(parkingWithOwnerRatings);
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Update parking
parkingRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (Types.ObjectId.isValid(id)) {
            const parking = await Parking.findById({ _id: id });
            if (!parking) {
                return res.status(400).json({ error: "Provide correct parking id" });
            }

            // Input validation
            const schema = Joi.object({
                name: Joi.string().required(),
                address: Joi.string().required(),
                city: Joi.string().required(),
                lat: Joi.string().required(),
                long: Joi.string().required(),
                user_id: Joi.string().required(),
            });

            let { name, address, city, lat, long, user_id } = parking;
            user_id = user_id.toString();
            const updatedParkingObj = { name, address, city, lat, long, user_id, ...req.body };

            const { error } = schema.validate(updatedParkingObj);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const updatedParking = await parking.updateOne(updatedParkingObj);
            if (updatedParking) {
                res.json({ message: "Parking updated successfully" });
            } else {
                res.status(400).json({ error: "Parking not updated" });
            }
        } else {
            res.status(400).json({ error: "Invalid id" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
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

export default parkingRouter;
