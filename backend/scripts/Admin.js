import '../dns-preload.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import Admin from '../models/Admin.js';

dotenv.config();

await mongoose.connect(
    process.env.MONGODB_URI
);

const hashedPassword =
    await bcrypt.hash(
        'admin123',
        10
    );

const admin =
    await Admin.create({
        username: 'admin',
        password:
            hashedPassword
    });

console.log(
    'Admin Created:',
    admin
);

process.exit();