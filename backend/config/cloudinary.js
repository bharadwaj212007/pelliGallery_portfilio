import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

console.log(
  'CLOUD_NAME:',
  process.env.CLOUDINARY_CLOUD_NAME
);
console.log(
  'API_KEY:',
  process.env.CLOUDINARY_API_KEY ? 'Loaded' : 'Missing'
);
console.log(
  'API_SECRET:',
  process.env.CLOUDINARY_API_SECRET ? 'Loaded' : 'Missing'
);

const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log(
    '✅ Cloudinary service initialized successfully.'
  );
} else {
  console.warn(
    '❌ Cloudinary credentials missing in .env. Falling back to mock uploads.'
  );
}

// Upload dynamic function supporting stream/buffer or file paths
export const uploadImage = async (fileBuffer, title = 'gallery_image') => {
  if (!isCloudinaryConfigured) {
    // Return a random high quality wedding photography placeholder URL from Unsplash
    const fallbackUrls = [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507504038482-7621c5f83c07?auto=format&fit=crop&w=1200&q=80'
    ];
    const randomIndex = Math.floor(Math.random() * fallbackUrls.length);
    const mockUrl = fallbackUrls[randomIndex];
    const mockPublicId = `mock_upload_${Date.now()}`;

    return {
      secure_url: mockUrl,
      public_id: mockPublicId
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'pelligallery',
        resource_type: 'image',
        filename_override: title,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured || publicId.startsWith('mock_')) {
    console.log(`Mock delete triggered for image: ${publicId}`);
    return { result: 'ok' };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

export default cloudinary;
