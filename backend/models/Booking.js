import mongoose from 'mongoose';

const bookingItemSchema = new mongoose.Schema({
    package_id: String,
    package_name: String,
    package_price: Number,
    quantity: Number,
    selected_customizations: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
});

const bookingSchema = new mongoose.Schema(
    {
        customer_name: {
            type: String,
            required: true
        },
        customer_email: {
            type: String,
            required: true
        },
        event_date: String,
        event_location: String,
        special_requirements: String,

        items: {
            type: [bookingItemSchema],
            default: []
        },

        total_price: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: [
                'Pending',
                'Confirmed',
                'Cancelled'
            ],
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    'Booking',
    bookingSchema
);