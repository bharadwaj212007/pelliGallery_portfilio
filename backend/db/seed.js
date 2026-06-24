import bcrypt from 'bcryptjs';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const MOCK_DB_PATH = path.join(__dirname, 'local_db.json');

const categories = [
  { name: 'Weddings', slug: 'weddings' },
  { name: 'Birthdays', slug: 'birthdays' },
  { name: 'Corporate Events', slug: 'corporate' },
  { name: 'Pre-Wedding Shoots', slug: 'pre-wedding' }
];

const packages = [
  {
    name: 'Classic Wedding Package',
    description: 'Perfect for intimate weddings and celebrations capturing essential milestones.',
    price: 150000.00,
    inclusions: ['1 Lead Photographer', '1 Cinematographer', '150 Edited Photos', 'Standard Album', 'Full HD Highlights Video'],
    customization_options: JSON.stringify([
      { id: 'opt_drone', name: 'Drone Coverage', price: 25000 },
      { id: 'opt_album_premium', name: 'Premium Leather Album Upgrade', price: 15000 },
      { id: 'opt_extra_day', name: 'Additional Event Day', price: 50000 }
    ])
  },
  {
    name: 'Royal Muhurtham & Reception',
    description: 'Comprehensive photography and film coverage for grandeur multi-day traditional weddings.',
    price: 250000.00,
    inclusions: ['2 Traditional Photographers', '1 Candid Specialist', '2 Cinematographers', '300 Edited Photos', '2 Luxury Canvera Albums', '4K Cinematic Wedding Film'],
    customization_options: JSON.stringify([
      { id: 'opt_drone_4k', name: 'Dual 4K Drone Coverage', price: 40000 },
      { id: 'opt_pre_wedding', name: 'Pre-Wedding Portrait Session', price: 30000 },
      { id: 'opt_led_wall', name: 'Live LED Wall Projection', price: 20000 }
    ])
  },
  {
    name: 'Pre-Wedding Cinematic Shoot',
    description: 'A beautiful outdoor story-telling couple session at scenic spots around Hyderabad.',
    price: 45000.00,
    inclusions: ['1 Candid Photographer', '1 Cinematic Videographer', '30 Edited Images', '2-Minute Cinematic Invitation Video', 'Location Guidance'],
    customization_options: JSON.stringify([
      { id: 'opt_makeup', name: 'Stylist & Makeup Artist', price: 15000 },
      { id: 'opt_props', name: 'Themed Props & Smoke Bombs', price: 5000 }
    ])
  },
  {
    name: 'Celebrations & Birthdays',
    description: 'Vibrant and candid capturing of birthdays, anniversaries, and family functions.',
    price: 30000.00,
    inclusions: ['1 Photographer', 'All Raw Images', '50 High-res Edited Photos', 'Digital Photo Album Link'],
    customization_options: JSON.stringify([
      { id: 'opt_photobooth', name: 'Instant Print Photobooth (3 hours)', price: 12000 },
      { id: 'opt_videography', name: 'Event Highlight Reel (1 min)', price: 10000 }
    ])
  }
];

const images = [
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
  }
];

async function seedPostgres() {
  const connectionString = process.env.DATABASE_URL;
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'pelligallery',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  };

  const client = new pg.Client(connectionString ? { connectionString } : dbConfig);
  await client.connect();

  console.log('PostgreSQL client connected. Executing schema initialization...');
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  await client.query(schemaSql);

  // Check if admin exists
  const adminRes = await client.query('SELECT * FROM admins LIMIT 1');
  if (adminRes.rows.length === 0) {
    console.log('Seeding default administrator...');
    const hashedPass = await bcrypt.hash('Pellipusthakam@2026', 10);
    await client.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['admin', hashedPass]);
  }

  // Seed categories
  console.log('Seeding categories...');
  for (const cat of categories) {
    await client.query(
      'INSERT INTO gallery_categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [cat.name, cat.slug]
    );
  }

  // Get categories with IDs
  const catRes = await client.query('SELECT * FROM gallery_categories');
  const catMap = {};
  catRes.rows.forEach(c => {
    catMap[c.slug] = c.id;
  });

  // Seed packages
  console.log('Seeding packages...');
  const pkgRes = await client.query('SELECT * FROM packages LIMIT 1');
  if (pkgRes.rows.length === 0) {
    for (const pkg of packages) {
      await client.query(
        'INSERT INTO packages (name, description, price, inclusions, customization_options) VALUES ($1, $2, $3, $4, $5)',
        [pkg.name, pkg.description, pkg.price, pkg.inclusions, pkg.customization_options]
      );
    }
  }

  // Seed gallery images
  console.log('Seeding gallery images...');
  const imgRes = await client.query('SELECT * FROM gallery_images LIMIT 1');
  if (imgRes.rows.length === 0) {
    for (const img of images) {
      const catId = catMap[img.category_slug];
      if (catId) {
        await client.query(
          'INSERT INTO gallery_images (category_id, image_url, public_id, title, sort_order) VALUES ($1, $2, $3, $4, $5)',
          [catId, img.image_url, img.public_id, img.title, img.sort_order]
        );
      }
    }
  }

  await client.end();
  console.log('PostgreSQL database seeded successfully.');
}

async function seedMockJson() {
  console.log('Writing seed structures to Mock JSON Database...');
  const hashedPass = await bcrypt.hash('Pellipusthakam@2026', 10);
  
  const initialData = {
    admins: [
      {
        id: 1,
        username: 'admin',
        password: hashedPass,
        created_at: new Date().toISOString()
      }
    ],
    gallery_categories: categories.map((c, i) => ({ id: i + 1, name: c.name, slug: c.slug })),
    gallery_images: images.map((img, i) => {
      const catIndex = categories.findIndex(c => c.slug === img.category_slug);
      return {
        id: i + 1,
        category_id: catIndex !== -1 ? catIndex + 1 : 1,
        image_url: img.image_url,
        public_id: img.public_id,
        title: img.title,
        sort_order: img.sort_order,
        created_at: new Date().toISOString()
      };
    }),
    packages: packages.map((pkg, i) => ({
      id: i + 1,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      inclusions: pkg.inclusions,
      customization_options: JSON.parse(pkg.customization_options)
    })),
    bookings: [],
    booking_packages: []
  };

  const parentDir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  console.log('Mock JSON database seeded successfully.');
}

async function main() {
  let isPostgres = false;
  if (process.env.DATABASE_URL || process.env.DB_PASSWORD) {
    isPostgres = true;
  }

  try {
    if (isPostgres) {
      await seedPostgres();
    } else {
      await seedMockJson();
    }
  } catch (err) {
    console.error('Error running seed script, writing JSON fallback: ', err.message);
    await seedMockJson();
  }
}

main();
