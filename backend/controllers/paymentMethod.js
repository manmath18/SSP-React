import { Router } from "express";
import { PaymentMethod } from "../models/paymentMethodSchema.js";
import Joi from "joi";
import { Types } from "mongoose";

const paymentMethodRouter = Router();

// Create new paymentMethod
paymentMethodRouter.post("/", async (req, res) => {
    try {
        let { cash, interac } = req.body;

        // Input validation
        const schema = Joi.object({
            cash: Joi.boolean().required(),
        });

        const { error } = schema.validate({ cash });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const paymentMethod = await PaymentMethod.create({ cash, interac });
        res.json({ message: "PaymentMethod created", paymentMethod });
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Get existing paymentMethod list
paymentMethodRouter.get("/", async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find({});
        res.json(paymentMethods);
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Update payment method
paymentMethodRouter.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (Types.ObjectId.isValid(id)) {
            const paymentMethod = await PaymentMethod.findById({ _id: id });
            if (!paymentMethod) {
                return res.status(400).json({ error: "Provide correct paymentMethod id" });
            }

            // Input validation
            const schema = Joi.object({
                cash: Joi.boolean().required(),
            });

            let { cash, interac } = paymentMethod;
            let updatedPaymentMethodObj = { cash, ...req.body.cash };

            const { error } = schema.validate(updatedPaymentMethodObj);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            updatedPaymentMethodObj = { cash, interac, ...req.body };

            const updatedPaymentMethod = await PaymentMethod.updateOne(updatedPaymentMethodObj);
            if (updatedPaymentMethod) {
                res.json({ message: 'PaymentMethod updated successfully' });
            } else {
                res.status(400).json({ error: 'PaymentMethod not updated' });
            }
        } else {
            res.status(400).json({ error: "Invalid id" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

// Delete paymentMethod
paymentMethodRouter.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate id and delete paymentMethod if exists
        if (Types.ObjectId.isValid(id)) {
            const paymentMethod = await PaymentMethod.findByIdAndDelete({ _id: id });

            if (paymentMethod) {
                res.json({ message: "PaymentMethod deleted successfully" });
            } else {
                res.status(404).json({ error: "PaymentMethod not found" });
            }
        } else {
            res.status(400).json({ error: "Invalid paymentMethod id" });
        }
    } catch (error) {
        console.error("Error - ", error);
        res.status(400).json({ error });
    }
});

export default paymentMethodRouter;
