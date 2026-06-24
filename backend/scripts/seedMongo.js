import '../dns-preload.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import Admin from '../models/Admin.js';
import GalleryCategory from '../models/GalleryCategory.js';
import GalleryImage from '../models/GalleryImage.js';
import Package from '../models/Package.js';

dotenv.config();

const categories = [
  { name: 'Weddings', slug: 'weddings' },
  { name: 'Birthdays', slug: 'birthdays' },
  { name: 'Corporate Events', slug: 'corporate' },
  { name: 'Pre-Wedding Shoots', slug: 'pre-wedding' },
  { name: 'Engagement', slug: 'engagement' },
  { name: 'Reception', slug: 'reception' },
  { name: 'Haldi', slug: 'haldi' }
];

const packages = [
  {
    name: 'Classic Wedding Package',
    description: 'Perfect for intimate weddings and celebrations capturing essential milestones.',
    price: 150000.00,
    inclusions: ['1 Lead Photographer', '1 Cinematographer', '150 Edited Photos', 'Standard Album', 'Full HD Highlights Video'],
    customization_options: [
      { id: 'opt_drone', name: 'Drone Coverage', price: 25000 },
      { id: 'opt_album_premium', name: 'Premium Leather Album Upgrade', price: 15000 },
      { id: 'opt_extra_day', name: 'Additional Event Day', price: 50000 }
    ]
  },
  {
    name: 'Royal Muhurtham & Reception',
    description: 'Comprehensive photography and film coverage for grandeur multi-day traditional weddings.',
    price: 250000.00,
    inclusions: ['2 Traditional Photographers', '1 Candid Specialist', '2 Cinematographers', '300 Edited Photos', '2 Luxury Canvera Albums', '4K Cinematic Wedding Film'],
    customization_options: [
      { id: 'opt_drone_4k', name: 'Dual 4K Drone Coverage', price: 40000 },
      { id: 'opt_pre_wedding', name: 'Pre-Wedding Portrait Session', price: 30000 },
      { id: 'opt_led_wall', name: 'Live LED Wall Projection', price: 20000 }
    ]
  },
  {
    name: 'Pre-Wedding Cinematic Shoot',
    description: 'A beautiful outdoor story-telling couple session at scenic spots around Hyderabad.',
    price: 45000.00,
    inclusions: ['1 Candid Photographer', '1 Cinematic Videographer', '30 Edited Images', '2-Minute Cinematic Invitation Video', 'Location Guidance'],
    customization_options: [
      { id: 'opt_makeup', name: 'Stylist & Makeup Artist', price: 15000 },
      { id: 'opt_props', name: 'Themed Props & Smoke Bombs', price: 5000 }
    ]
  },
  {
    name: 'Celebrations & Birthdays',
    description: 'Vibrant and candid capturing of birthdays, anniversaries, and family functions.',
    price: 30000.00,
    inclusions: ['1 Photographer', 'All Raw Images', '50 High-res Edited Photos', 'Digital Photo Album Link'],
    customization_options: [
      { id: 'opt_photobooth', name: 'Instant Print Photobooth (3 hours)', price: 12000 },
      { id: 'opt_videography', name: 'Event Highlight Reel (1 min)', price: 10000 }
    ]
  }
];

const sampleImages = [
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_wedding_1',
    title: 'Royal Mandapam Ceremony',
    sort_order: 1
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_wedding_2',
    title: 'Bridal Portrait',
    sort_order: 2
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_pre_wedding_1',
    title: 'Golden Hour Sunset Walk',
    sort_order: 3
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_birthday_1',
    title: 'Joyous Cake Cutting',
    sort_order: 4
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_corporate_1',
    title: 'Annual Gala Stage',
    sort_order: 5
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_engagement_1',
    title: 'Exchange of Promises',
    sort_order: 6
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1519225495810-7517c24a2ed7?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_reception_1',
    title: 'The First Dance',
    sort_order: 7
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    public_id: 'mock_haldi_1',
    title: 'Traditional Turmeric Splash',
    sort_order: 8
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Seed Admin
    console.log('Clearing old admin records...');
    await Admin.deleteMany({});
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultAdmin = await Admin.create({
      username: 'admin',
      password: hashedPassword
    });
    console.log('✅ Admin seeded:', defaultAdmin.username);

    // 2. Seed Categories
    console.log('Clearing old category records...');
    await GalleryCategory.deleteMany({});
    const createdCategories = await GalleryCategory.create(categories);
    console.log(`✅ Seeded ${createdCategories.length} categories.`);

    // Map slug to category object
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat;
    });

    // 3. Seed Packages
    console.log('Clearing old pricing packages...');
    await Package.deleteMany({});
    const createdPackages = await Package.create(packages);
    console.log(`✅ Seeded ${createdPackages.length} packages.`);

    // 4. Seed Gallery Images
    console.log('Clearing old gallery images...');
    await GalleryImage.deleteMany({});
    const imagesToCreate = sampleImages.map(img => {
      const category = categoryMap[img.category_slug];
      return {
        category_id: category ? category._id : null,
        image_url: img.image_url,
        public_id: img.public_id,
        title: img.title,
        sort_order: img.sort_order
      };
    }).filter(img => img.category_id !== null);

    const createdImages = await GalleryImage.create(imagesToCreate);
    console.log(`✅ Seeded ${createdImages.length} gallery images.`);

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
