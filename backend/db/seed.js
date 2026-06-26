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
    name: 'Wedding Photography',
    description: 'Traditional and candid wedding photography captures for your most grand royal celebrations.',
    price: 50000.00,
    inclusions: ['Traditional Wedding', 'Candid Photography', 'Bridal Portraits', 'Groom Portraits', 'Family Photography', 'Drone Photography', 'Cinematic Coverage'],
    customization_options: JSON.stringify([
      { id: 'opt_drone', name: 'Drone Coverage Upgrade', price: 10000 },
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Pre-Wedding Shoot',
    description: 'Cinematic romance and couple portraits at scenic lakes, mountains, and forest destinations.',
    price: 25000.00,
    inclusions: ['Outdoor Locations', 'Cinematic Photos', 'Couple Portraits', 'Sunset Photography', 'Drone Shoot', 'Creative Concepts'],
    customization_options: JSON.stringify([
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Engagement Photography',
    description: 'Documenting the ring exchange ceremony, stage decor, and intimate family moments.',
    price: 20000.00,
    inclusions: ['Ring Ceremony', 'Couple Portraits', 'Family Moments', 'Decorations', 'Stage Photography'],
    customization_options: JSON.stringify([
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Reception Photography',
    description: 'Capturing the grand couple entry, dance floor celebrations, and guest interactions under luxury lighting.',
    price: 30000.00,
    inclusions: ['Couple Entry', 'Stage Photography', 'Family Portraits', 'Dance Coverage', 'Guest Photography'],
    customization_options: JSON.stringify([
      { id: 'opt_drone', name: 'Drone Coverage Upgrade', price: 10000 },
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Haldi Ceremony',
    description: 'Bright and happy snapshots of the traditional turmeric splash and fun family moments.',
    price: 18000.00,
    inclusions: ['Traditional Rituals', 'Candid Photography', 'Family Moments', 'Decorations', 'Drone Coverage'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Mehendi Photography',
    description: 'Intricate close-ups of bridal mehendi, happy family portraits, and candid smiles.',
    price: 18000.00,
    inclusions: ['Bride Portraits', 'Mehendi Close-ups', 'Family Photography', 'Decor', 'Candid Moments'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Birthday Photography',
    description: 'Colorful and joyful visual logs of kids or adult birthday cake cuttings and balloon stage decors.',
    price: 12000.00,
    inclusions: ['Kids Birthday', 'Adult Birthday', 'Cake Cutting', 'Family Photography', 'Decorations'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Maternity Shoot',
    description: 'Celebrate the beautiful new beginnings with creative indoor/outdoor couple and family portraits.',
    price: 15000.00,
    inclusions: ['Indoor Shoot', 'Outdoor Shoot', 'Couple Photos', 'Family Photos', 'Artistic Portraits'],
    customization_options: JSON.stringify([
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Baby Shoot',
    description: 'Adorable newborns theme setups, cute creative poses, and heartwarming family memories.',
    price: 10000.00,
    inclusions: ['Newborn Photography', 'Theme Setup', 'Family Portraits', 'Creative Poses'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Corporate Events',
    description: 'Modern, sharp photography logging business meetings, panel discussions, galas, and summits.',
    price: 20000.00,
    inclusions: ['Conferences', 'Product Launches', 'Award Functions', 'Business Meetings', 'Team Events'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Fashion Photography',
    description: 'Studio and outdoor brand shoots creating a stunning professional model portfolio.',
    price: 18000.00,
    inclusions: ['Model Portfolio', 'Brand Shoot', 'Studio Photography', 'Outdoor Fashion'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Product Photography',
    description: 'High-definition lifestyle, jewelry, food, and e-commerce product catalog layouts.',
    price: 8000.00,
    inclusions: ['Ecommerce Products', 'Jewelry', 'Electronics', 'Food Photography', 'Lifestyle Products'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Event Photography',
    description: 'Covering private gigs, cultural programs, college festivals, concerts, and live shows.',
    price: 15000.00,
    inclusions: ['College Events', 'Cultural Programs', 'Concerts', 'Live Shows', 'Private Events'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Drone Photography',
    description: 'High-altitude dynamic venue coverage and breathtaking aerial photography captures.',
    price: 10000.00,
    inclusions: ['Wedding Drone Coverage', 'Aerial Photography', 'Venue Coverage', 'Outdoor Events'],
    customization_options: JSON.stringify([
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ])
  },
  {
    name: 'Cinematic Videography',
    description: 'Stunning 4K cinematic wedding films, teaser trailers, highlight reels, and full multi-cam event captures.',
    price: 35000.00,
    inclusions: ['Wedding Film', 'Teaser Video', 'Highlight Reel', 'Full Event Coverage', '4K Video'],
    customization_options: JSON.stringify([
      { id: 'opt_drone', name: 'Drone Coverage Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
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
