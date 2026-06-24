import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: String,
        slug: String
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

export default mongoose.model(
    'GalleryCategory',
    categorySchema
);