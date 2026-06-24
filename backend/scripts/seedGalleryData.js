import '../dns-preload.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GalleryCategory from '../models/GalleryCategory.js';
import GalleryImage from '../models/GalleryImage.js';

dotenv.config();

const categoriesData = [
  { name: 'Wedding', slug: 'wedding' },
  { name: 'Pre Wedding', slug: 'pre-wedding' },
  { name: 'Engagement', slug: 'engagement' },
  { name: 'Birthday', slug: 'birthday' },
  { name: 'Corporate Events', slug: 'corporate-events' }
];

const galleryImagesData = [
  // Wedding Category
  {
    categoryName: 'Wedding',
    title: 'Bride and Groom Hand in Hand',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_1'
  },
  {
    categoryName: 'Wedding',
    title: 'Grand Mandap Ceremony Decor',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_2'
  },
  {
    categoryName: 'Wedding',
    title: 'Emotional Vidai Moment',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_3'
  },
  {
    categoryName: 'Wedding',
    title: 'Elegant Wedding Rings',
    imageUrl: 'https://images.unsplash.com/photo-1507504038482-76210f5c0be1?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_4'
  },
  {
    categoryName: 'Wedding',
    title: 'Bridal Traditional Jewelry and Saree',
    imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_5'
  },
  {
    categoryName: 'Wedding',
    title: 'Couple Dance in Fairy Lights',
    imageUrl: 'https://images.unsplash.com/photo-1519225495810-7517c24a2ed7?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_6'
  },
  {
    categoryName: 'Wedding',
    title: 'Smiling Bride Candid Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_7'
  },
  {
    categoryName: 'Wedding',
    title: 'Bridal Veil and Groom Glance',
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_wedding_8'
  },

  // Pre Wedding Category
  {
    categoryName: 'Pre Wedding',
    title: 'Golden Hour Outdoor Couple Walk',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_1'
  },
  {
    categoryName: 'Pre Wedding',
    title: 'Scenic Lake Boat Ride Couple Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_2'
  },
  {
    categoryName: 'Pre Wedding',
    title: 'Romantic Sunset Kiss on Beach',
    imageUrl: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_3'
  },
  {
    categoryName: 'Pre Wedding',
    title: 'Holding Hands in Forest Trails',
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_4'
  },
  {
    categoryName: 'Pre Wedding',
    title: 'Candid Laughing Under Umbrella',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_5'
  },
  {
    categoryName: 'Pre Wedding',
    title: 'Vintage Streetwalk Hug',
    imageUrl: 'https://images.unsplash.com/photo-1520856729653-f4c6d678b544?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_6'
  },
  {
    categoryName: 'Pre Wedding',
    title: 'Sparklers Night Celebration',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_7'
  },
  {
    categoryName: 'Pre Wedding',
    title: 'Ethereal Mountain Backdrop Silhouette',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_prewedding_8'
  },

  // Engagement Category
  {
    categoryName: 'Engagement',
    title: 'The Engagement Ring Proposal',
    imageUrl: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_1'
  },
  {
    categoryName: 'Engagement',
    title: 'Excited Couple Showing Ring',
    imageUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_2'
  },
  {
    categoryName: 'Engagement',
    title: 'Romantic Forehead Touch',
    imageUrl: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_3'
  },
  {
    categoryName: 'Engagement',
    title: 'Champagne Ring Celebration Toast',
    imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_4'
  },
  {
    categoryName: 'Engagement',
    title: 'Happy Couple Dancing',
    imageUrl: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_5'
  },
  {
    categoryName: 'Engagement',
    title: 'Intimate Hug in Wildflowers',
    imageUrl: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_6'
  },
  {
    categoryName: 'Engagement',
    title: 'Close-up of Hand Placed on Heart',
    imageUrl: 'https://images.unsplash.com/photo-1621097816008-0112fb78f089?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_7'
  },
  {
    categoryName: 'Engagement',
    title: 'Smiles at Cozy Coffee Date',
    imageUrl: 'https://images.unsplash.com/photo-1607190073883-9366df04bf49?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_engagement_8'
  },

  // Birthday Category
  {
    categoryName: 'Birthday',
    title: 'Cake Blowing Candles Sparkle',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_1'
  },
  {
    categoryName: 'Birthday',
    title: 'Colorful Birthday Cupcakes and Gifts',
    imageUrl: 'https://images.unsplash.com/photo-1464349113733-4a683a90611d?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_2'
  },
  {
    categoryName: 'Birthday',
    title: 'Festive Balloon Decor Background',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_3'
  },
  {
    categoryName: 'Birthday',
    title: 'Confetti Rain and Dancing Kids',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_4'
  },
  {
    categoryName: 'Birthday',
    title: 'Bright Outdoor Birthday Picnic Set',
    imageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_5'
  },
  {
    categoryName: 'Birthday',
    title: 'Fun Birthday Photobooth Props',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_6'
  },
  {
    categoryName: 'Birthday',
    title: 'Glow Lights Birthday Night Party',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_7'
  },
  {
    categoryName: 'Birthday',
    title: 'Happy Child Cake Smudge Laugh',
    imageUrl: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_birthday_8'
  },

  // Corporate Events Category
  {
    categoryName: 'Corporate Events',
    title: 'Main Stage Presentation Event Hall',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_1'
  },
  {
    categoryName: 'Corporate Events',
    title: 'Team Collaboration and Brainstorming Session',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_2'
  },
  {
    categoryName: 'Corporate Events',
    title: 'Professional Summit Networking Buffet',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_3'
  },
  {
    categoryName: 'Corporate Events',
    title: 'Grand Conference Audience Seating',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_4'
  },
  {
    categoryName: 'Corporate Events',
    title: 'Elegant Gala Dinner Round Tables',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_5'
  },
  {
    categoryName: 'Corporate Events',
    title: 'Annual Keynote Presentation Hall Lights',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_6'
  },
  {
    categoryName: 'Corporate Events',
    title: 'Business Event Panel Discussions Q&A',
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_7'
  },
  {
    categoryName: 'Corporate Events',
    title: 'Interactive Tech Workshop Panelists',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5209768a7f41?auto=format&fit=crop&w=1200&q=80',
    public_id: 'seeder_corporate_8'
  }
];

async function runSeeder() {
  try {
    console.log('Connecting to MongoDB Atlas Cluster...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI missing in .env file!');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected.');

    // 1. Seed categories
    console.log('Refreshing gallery categories list...');
    await GalleryCategory.deleteMany({});
    const createdCategories = await GalleryCategory.create(categoriesData);
    console.log(`✅ Seeded ${createdCategories.length} categories.`);

    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat;
    });

    // 2. Seed gallery images
    console.log('Refreshing gallery images data entries...');
    await GalleryImage.deleteMany({});

    const imagesToCreate = galleryImagesData.map((img, index) => {
      const catObj = categoryMap[img.categoryName];
      return {
        title: img.title,
        imageUrl: img.imageUrl,
        image_url: img.imageUrl, // duplicate for schema/backward compatibility
        category: img.categoryName, // exact inline string requested by user
        category_id: catObj ? catObj._id : null, // database reference for app compatibility
        public_id: img.public_id,
        sort_order: index + 1
      };
    });

    const createdImages = await GalleryImage.create(imagesToCreate);
    console.log(`✅ Seeded ${createdImages.length} gallery images into 'galleryimages' collection.`);

    console.log('🎉 Database seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing database seed:', err);
    process.exit(1);
  }
}

runSeeder();
