import mongoose from "mongoose"

const paymentMethodSchema = new mongoose.Schema({
    cash: {
        type: Boolean,
        required: true
    },
    interac: {
        type: String,
    }
})

export const PaymentMethod=mongoose.model("PaymentMethod", paymentMethodSchema)