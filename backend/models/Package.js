import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        inclusions: {
            type: [String],
            default: []
        },
        customization_options: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

export default mongoose.model(
    'Package',
    packageSchema
);