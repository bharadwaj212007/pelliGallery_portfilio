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

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

const isCloudinaryConfigured = !!cloudName && !!apiKey && !!apiSecret;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
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
export const uploadImage = async (fileInput, title = 'gallery_image') => {
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

  // Determine if input is a Multer file or a raw Buffer
  let fileBuffer;
  let fileName = 'unknown_buffer';
  let mimeType = 'image/jpeg'; // Default assumption for raw buffer
  let fileSize = 0;

  if (Buffer.isBuffer(fileInput)) {
    fileBuffer = fileInput;
    fileSize = fileInput.length;
  } else if (fileInput && Buffer.isBuffer(fileInput.buffer)) {
    fileBuffer = fileInput.buffer;
    fileName = fileInput.originalname || 'unknown_multer';
    mimeType = fileInput.mimetype || 'image/jpeg';
    fileSize = fileInput.size || fileInput.buffer.length;
  } else {
    throw new Error('Invalid file input: Must be a Buffer or a Multer file object.');
  }

  // Verify buffer is valid and not empty
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Invalid file buffer: Buffer is empty.');
  }

  const cleanTitle = (title || 'gallery_image')
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, '_');

  const uploadOptions = {
    folder: 'pelligallery',
    public_id: cleanTitle,
    overwrite: true,
    resource_type: 'image',
  };

  // Log details before upload
  console.log('[Cloudinary Upload Request Diagnostics]');
  console.log(`- File Name: ${fileName}`);
  console.log(`- MIME Type: ${mimeType}`);
  console.log(`- File Size (reported): ${fileSize} bytes`);
  console.log(`- Buffer Length: ${fileBuffer.length} bytes`);
  console.log(`- Upload Options:`, JSON.stringify(uploadOptions, null, 2));

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            stack: error.stack,
            error
          });
          return reject(error);
        }
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
