import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import UUID from "uuid-int";
import Participant from "./user.model.js";
import path from "path";

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json({ limit: "16mb", extended: true }));
app.use(express.urlencoded({ limit: "16mb", extended: true }));
app.use(cors());

const id = {};

// MongoDB Atlas connection
mongoose
  .connect(process.env.connectionString, {})
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

mongoose.Promise = global.Promise;

app.get("/", (req, res) => {
  res.send("UPI Payment Gateway");
});

function formatDate(date, format) {
  const ISTOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const ISTDate = date.toLocaleString("en-IN", ISTOptions);

  const map = {
    mm: ISTDate.slice(3, 5),
    dd: ISTDate.slice(0, 2),
    yy: ISTDate.slice(8, 10),
    yyyy: ISTDate.slice(6, 10),
  };

  return format.replace(/dd|mm|yyyy/gi, (matched) => map[matched]);
}

function stringToDate(dateString) {
  const [day, month, year] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setTime(date.getTime() + 5.5 * 60 * 60 * 1000);
  return date;
}

String.prototype.shuffle = function () {
  let a = this.split(""),
    n = a.length;

  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.join("");
};

async function checkPayment(client_txn_id, txn_date, user) {
  await axios
    .post("https://merchant.upigateway.com/api/check_order_status", {
      client_txn_id,
      txn_date,
      key: process.env.merchant_key,
    })
    .then((res) => {
      const data = res.data;
      if (data.status === true) {
        const info = data.data;
        if (info.status === "success") {
          clearInterval(id[client_txn_id].id);
          user.client_txn_id = data.data.client_txn_id;
          user.upi_txn_id = data.data.upi_txn_id;
          user.amount = data.data.amount;
          user.status = true;
          user.txn_date = stringToDate(txn_date);
          create(user);
          delete id[client_txn_id];
        } else if (info.status === "failure" || id[client_txn_id].time >= 100) {
          clearInterval(id[client_txn_id].id);
          user.client_txn_id = data.data.client_txn_id;
          user.upi_txn_id = data.data.upi_txn_id;
          user.amount = data.data.amount;
          user.status = false;
          user.txn_date = stringToDate(txn_date);
          create(user);
          delete id[client_txn_id];
        } else {
          id[client_txn_id].time++;
        }
      }
      return res.data;
    })
    .catch((e) => {
      console.log(e);
    });
}

async function create(user) {
  try {
    const participant = new Participant(user);
    await participant.save();
    return true;
  } catch (e) {
    console.log(e);
    return { err: "something went wrong" };
  }
}
app.post("/pay", async (req, res) => {
  const payload = req.body.payload;

  if (!payload) {
    return res.status(400).json({ status: false, msg: "Payload is missing" });
  }

  payload["key"] = process.env.merchant_key; // Ensure the merchant_key is added
  payload["client_txn_id"] = `txn_${Date.now()}`;
  payload["p_info"] = "UPI Payment Gateway";
  payload["redirect_url"] = process.env.frontend_url.trim() || "http://localhost:5173/receipt";

  console.log("Payload being sent to UPI Gateway:", payload);

  try {
    const response = await axios.post("https://merchant.upigateway.com/api/create_order", payload);

    if (response.data.status && response.data.payment_url) {
      res.json({
        status: true,
        msg: "Order Created",
        payment_url: response.data.payment_url,
      });
    } else {
      res.json({
        status: false,
        msg: response.data.msg || "Failed to create order.",
      });
    }
  } catch (error) {
    console.error("Error from UPI Gateway:", error.response?.data || error.message);
    res.status(500).json({ status: false, msg: "Failed to create order." });
  }
});
app.post("/payCheck", async (req, res) => {
  const { client_txn_id } = req.body;

  if (!client_txn_id) {
    return res.status(400).json({ status: false, msg: "client_txn_id is required" });
  }

  try {
    const user = await Participant.findOne({ client_txn_id });

    if (!user) {
      return res.status(404).json({ status: false, msg: "Transaction not found" });
    }

    const txn_date = formatDate(user.txn_date, "dd-mm-yyyy");

    const response = await axios.post("https://merchant.upigateway.com/api/check_order_status", {
      client_txn_id,
      txn_date,
      key: process.env.merchant_key,
    });

    if (response.data.status) {
      return res.json({ status: true, msg: "Transaction found", data: response.data.data, user });
    } else {
      return res.json({ status: false, msg: "Transaction not found" });
    }
  } catch (error) {
    console.error("Error in /payCheck:", error.message);
    return res.status(500).json({ status: false, msg: "Internal server error" });
  }
});
// Serve React app for all non-API routes
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client/upi-payment-gateway/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/upi-payment-gateway/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Started application on port ${port}`);
});