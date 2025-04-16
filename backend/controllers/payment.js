import { Router } from "express";
import { Booking } from "../models/bookingSchema.js";

const paymentRouter = Router();

// Initiate Payment
paymentRouter.post("/initiate-payment", async (req, res) => {
  const { client_txn_id, amount, user_id, booking_id } = req.body;

  if (!client_txn_id || !amount || !user_id || !booking_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const paymentUrl = `https://upi-frontend.vercel.app/?client_txn_id=${client_txn_id}&amount=${amount}&user_id=${user_id}&booking_id=${booking_id}`;
    res.json({ status: true, paymentUrl });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// Verify Payment
paymentRouter.post("/verify-payment", async (req, res) => {
  const { client_txn_id, booking_id } = req.body;

  if (!client_txn_id || !booking_id) {
    return res.status(400).json({ error: "Transaction ID and Booking ID are required" });
  }

  try {
    // Simulate payment verification (replace with actual payment gateway API call)
    const isPaymentSuccessful = true; // Replace with actual verification logic

    if (isPaymentSuccessful) {
      const booking = await Booking.findByIdAndUpdate(
        booking_id,
        { confirm_booking: "approved" },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json({ status: true, message: "Payment verified successfully", booking });
    } else {
      res.status(400).json({ status: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

export default paymentRouter;