import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
    {
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GalleryCategory'
        },
        category: String,
        imageUrl: String,
        image_url: String,
        public_id: String,
        title: String,
        sort_order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

export default mongoose.model(
    'GalleryImage',
    galleryImageSchema
);