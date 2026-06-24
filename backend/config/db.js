import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error(
      '❌ MongoDB Connection Error:',
      err.message
    );
    console.log(
      '⚠️ Starting server without database...'
    );
  }
};

// TEMPORARY
export const query = async () => {
  throw new Error(
    'SQL query() called. Route not migrated to MongoDB yet.'
  );
};

export default connectDB;