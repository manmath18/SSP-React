import { Router } from "express";
import { Review } from "../models/reviewSchema.js";
import Joi from "joi";
import { Types } from "mongoose";

const reviewRouter = Router();

// Create new review
reviewRouter.post("/", async (req, res) => {
    try {
        let { message, rating, owner_id, user_id } = req.body;

        // Input validation
        const schema = Joi.object({
            message: Joi.string().required(),
            rating: Joi.number().required(),
            owner_id: Joi.string().required(),
            user_id: Joi.string().required(),
        });

        const { error } = schema.validate({ message, rating, owner_id, user_id });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const reviewExists = await Review.findOne({ owner_id, user_id });
        if (reviewExists) {
            return res.status(400).json({ error: 'Already reviewed. Cannot review the same owner more than once.' });
        }

        const review = await Review.create({ message, rating, owner_id, user_id });
        res.json({ message: "Review created", review });
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Get existing review list
reviewRouter.get("/", async (req, res) => {
    try {
        const { owner_id } = req.query;
        let reviews;
        if (owner_id) {
            reviews = await Review.find({ owner_id }).populate('user_id');
        } else {
            reviews = await Review.find({}).populate('user_id');
        }

        res.json(reviews);
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Update review
reviewRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (Types.ObjectId.isValid(id)) {
            const review = await Review.findById({ _id: id });
            if (!review) {
                return res.status(400).json({ error: "Provide correct review id" });
            }

            // Input validation
            const schema = Joi.object({
                message: Joi.string().required(),
                rating: Joi.number().required(),
            });

            const { message, rating, owner_id, user_id } = req.body;
            const updatedReviewObj = { message, rating, owner_id, user_id };

            const { error } = schema.validate(updatedReviewObj);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const updatedReview = await review.updateOne(updatedReviewObj);
            if (updatedReview) {
                res.json({ message: 'Review updated successfully' });
            } else {
                res.status(400).json({ error: 'Review not updated' });
            }
        } else {
            return res.status(400).json({ error: "Invalid id" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Delete review
reviewRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate id and delete review if exists
        if (Types.ObjectId.isValid(id)) {
            const review = await Review.findByIdAndDelete({ _id: id });

            if (review) {
                res.json({ message: "Review deleted successfully" });
            } else {
                res.status(404).json({ error: "Review not found" });
            }
        } else {
            res.status(400).json({ error: "Invalid review id" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

export default reviewRouter;
