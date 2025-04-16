import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/db.config.js";
import userRouter from "./controllers/user.js";
import handleError from './utils/errorHandler.js';
import isLoggedIn from "./controllers/middleware.js";
import parkingRouter from "./controllers/parking.js";
import paymentMethodRouter from "./controllers/paymentMethod.js";
import bookingRouter from "./controllers/booking.js";
import spaceRouter from "./controllers/spaceRouter.js";
import cors from 'cors';
import dotenv from "dotenv";
import reviewRouter from "./controllers/review.js";
import path from "path";
import paymentRouter from './controllers/payment.js';

const app = express();

// Set body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

dotenv.config();
const PORT = process.env.PORT || 8000;

app.use(cors());


app.get('/', async (req, res) => {
    res.json("API is running...");
});

app.use('/payment', paymentRouter);
app.use("/user", userRouter);
app.use("/parking", parkingRouter);
app.use("/paymentMethod", paymentMethodRouter);
app.use("/booking", bookingRouter);
app.use("/space", spaceRouter);
app.use("/review", reviewRouter);

// Error handler
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    handleError(error, res);
});
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
};

startServer();
