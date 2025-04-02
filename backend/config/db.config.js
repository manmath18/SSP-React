import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

const connectDB = () => {
	const url =process.env.MONGODB_URI

	mongoose.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	mongoose.connection.once("open", async () => {
		console.log("Connected to database");
	});

	mongoose.connection.on("error", (err) => {
		console.log("Error connecting to database  ", err);
	});
};

export default connectDB;
