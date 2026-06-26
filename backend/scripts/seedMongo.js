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
    name: 'Wedding Photography',
    description: 'Traditional and candid wedding photography captures for your most grand royal celebrations.',
    price: 50000.00,
    inclusions: ['Traditional Wedding', 'Candid Photography', 'Bridal Portraits', 'Groom Portraits', 'Family Photography', 'Drone Photography', 'Cinematic Coverage'],
    customization_options: [
      { id: 'opt_drone', name: 'Drone Coverage Upgrade', price: 10000 },
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Pre-Wedding Shoot',
    description: 'Cinematic romance and couple portraits at scenic lakes, mountains, and forest destinations.',
    price: 25000.00,
    inclusions: ['Outdoor Locations', 'Cinematic Photos', 'Couple Portraits', 'Sunset Photography', 'Drone Shoot', 'Creative Concepts'],
    customization_options: [
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Engagement Photography',
    description: 'Documenting the ring exchange ceremony, stage decor, and intimate family moments.',
    price: 20000.00,
    inclusions: ['Ring Ceremony', 'Couple Portraits', 'Family Moments', 'Decorations', 'Stage Photography'],
    customization_options: [
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Reception Photography',
    description: 'Capturing the grand couple entry, dance floor celebrations, and guest interactions under luxury lighting.',
    price: 30000.00,
    inclusions: ['Couple Entry', 'Stage Photography', 'Family Portraits', 'Dance Coverage', 'Guest Photography'],
    customization_options: [
      { id: 'opt_drone', name: 'Drone Coverage Upgrade', price: 10000 },
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Haldi Ceremony',
    description: 'Bright and happy snapshots of the traditional turmeric splash and fun family moments.',
    price: 18000.00,
    inclusions: ['Traditional Rituals', 'Candid Photography', 'Family Moments', 'Decorations', 'Drone Coverage'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Mehendi Photography',
    description: 'Intricate close-ups of bridal mehendi, happy family portraits, and candid smiles.',
    price: 18000.00,
    inclusions: ['Bride Portraits', 'Mehendi Close-ups', 'Family Photography', 'Decor', 'Candid Moments'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Birthday Photography',
    description: 'Colorful and joyful visual logs of kids or adult birthday cake cuttings and balloon stage decors.',
    price: 12000.00,
    inclusions: ['Kids Birthday', 'Adult Birthday', 'Cake Cutting', 'Family Photography', 'Decorations'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Maternity Shoot',
    description: 'Celebrate the beautiful new beginnings with creative indoor/outdoor couple and family portraits.',
    price: 15000.00,
    inclusions: ['Indoor Shoot', 'Outdoor Shoot', 'Couple Photos', 'Family Photos', 'Artistic Portraits'],
    customization_options: [
      { id: 'opt_album', name: 'Premium Hardbound Album Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Baby Shoot',
    description: 'Adorable newborns theme setups, cute creative poses, and heartwarming family memories.',
    price: 10000.00,
    inclusions: ['Newborn Photography', 'Theme Setup', 'Family Portraits', 'Creative Poses'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Corporate Events',
    description: 'Modern, sharp photography logging business meetings, panel discussions, galas, and summits.',
    price: 20000.00,
    inclusions: ['Conferences', 'Product Launches', 'Award Functions', 'Business Meetings', 'Team Events'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Fashion Photography',
    description: 'Studio and outdoor brand shoots creating a stunning professional model portfolio.',
    price: 18000.00,
    inclusions: ['Model Portfolio', 'Brand Shoot', 'Studio Photography', 'Outdoor Fashion'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Product Photography',
    description: 'High-definition lifestyle, jewelry, food, and e-commerce product catalog layouts.',
    price: 8000.00,
    inclusions: ['Ecommerce Products', 'Jewelry', 'Electronics', 'Food Photography', 'Lifestyle Products'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Event Photography',
    description: 'Covering private gigs, cultural programs, college festivals, concerts, and live shows.',
    price: 15000.00,
    inclusions: ['College Events', 'Cultural Programs', 'Concerts', 'Live Shows', 'Private Events'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Drone Photography',
    description: 'High-altitude dynamic venue coverage and breathtaking aerial photography captures.',
    price: 10000.00,
    inclusions: ['Wedding Drone Coverage', 'Aerial Photography', 'Venue Coverage', 'Outdoor Events'],
    customization_options: [
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  },
  {
    name: 'Cinematic Videography',
    description: 'Stunning 4K cinematic wedding films, teaser trailers, highlight reels, and full multi-cam event captures.',
    price: 35000.00,
    inclusions: ['Wedding Film', 'Teaser Video', 'Highlight Reel', 'Full Event Coverage', '4K Video'],
    customization_options: [
      { id: 'opt_drone', name: 'Drone Coverage Upgrade', price: 10000 },
      { id: 'opt_express', name: 'Express Delivery (48 Hours)', price: 5000 }
    ]
  }
];

const sampleImages = [
  // ==================== Category 1: Weddings (weddings) ====================
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_1',
    title: 'Royal Mandapam Ceremony',
    sort_order: 1
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_2',
    title: 'Traditional Bridal Blessing',
    sort_order: 2
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_3',
    title: 'Royal Bridal Portrait',
    sort_order: 3
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_4',
    title: 'Intricate Henna Details',
    sort_order: 4
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc35953?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_5',
    title: 'Couple Entry Ceremony',
    sort_order: 5
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_6',
    title: 'Elegance of Bridal Makeup',
    sort_order: 6
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_7',
    title: 'Sacred Varmala Ritual',
    sort_order: 7
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_8',
    title: 'Royal Mandap Portrait',
    sort_order: 8
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_9',
    title: 'Sacred Fire Ritual',
    sort_order: 9
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_10',
    title: 'The Grand Venue',
    sort_order: 10
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_11',
    title: 'Heartfelt Family Moment',
    sort_order: 11
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1507504038482-762102124e18?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_12',
    title: 'Golden Hour Portrait',
    sort_order: 12
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_13',
    title: 'Cinematic Night Walk',
    sort_order: 13
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1519225495810-7517c24a2ed7?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_14',
    title: 'Palace Wedding Glimpse',
    sort_order: 14
  },
  {
    category_slug: 'weddings',
    image_url: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_weddings_15',
    title: 'Candid Newlywed Smile',
    sort_order: 15
  },

  // ==================== Category 2: Pre-Wedding Shoots (pre-wedding) ====================
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_1',
    title: 'Golden Hour Sunset Walk',
    sort_order: 1
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_2',
    title: 'Forest Pathway Walk',
    sort_order: 2
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_3',
    title: 'Lakeside Sunset Silhouette',
    sort_order: 3
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1501901609772-df0848060b33?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_4',
    title: 'Mountain Peak Promise',
    sort_order: 4
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_5',
    title: 'Romantic Seaside Sunset',
    sort_order: 5
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_6',
    title: 'Heritage Fort Session',
    sort_order: 6
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1482841628122-9080d44bb807?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_7',
    title: 'Misty Sunrise Embrace',
    sort_order: 7
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1537907690979-ee8e01276184?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_8',
    title: 'City Lights Stroll',
    sort_order: 8
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_9',
    title: 'Lakeside Moments',
    sort_order: 9
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1520114878142-6e2b8f94e5e4?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_10',
    title: 'Flowing Dress Meadows',
    sort_order: 10
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_11',
    title: 'Epic Waterfall Couple',
    sort_order: 11
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_12',
    title: 'Beach Reflection Shot',
    sort_order: 12
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1505232458627-5ec90e586b9c?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_13',
    title: 'Sunlit Forest Gaze',
    sort_order: 13
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_14',
    title: 'Golden Fields Walk',
    sort_order: 14
  },
  {
    category_slug: 'pre-wedding',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_prewedding_15',
    title: 'Candid Sunset Laughter',
    sort_order: 15
  },

  // ==================== Category 3: Birthdays (birthdays) ====================
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_1',
    title: 'Premium Balloon Backdrop',
    sort_order: 1
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_2',
    title: 'First Birthday Smash',
    sort_order: 2
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_3',
    title: 'Sparkler Celebrations',
    sort_order: 3
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_4',
    title: 'Joyous Cake Cutting',
    sort_order: 4
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_5',
    title: 'Kids Party Playtime',
    sort_order: 5
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_6',
    title: 'Premium Birthday Decor',
    sort_order: 6
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1533227268964-c8b7158a65c1?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_7',
    title: 'Unboxing the Gift',
    sort_order: 7
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1567954970774-58d6aa69900a?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_8',
    title: 'Family Celebration',
    sort_order: 8
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1533294160022-41700685609d?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_9',
    title: 'Confetti Blast Joy',
    sort_order: 9
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_10',
    title: 'Birthday Cake Detail',
    sort_order: 10
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1464349172961-104d6e8b713d?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_11',
    title: 'Colorful Celebration',
    sort_order: 11
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_12',
    title: 'Birthday Milestone Toast',
    sort_order: 12
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_13',
    title: 'Designer Birthday Cake',
    sort_order: 13
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_14',
    title: 'Vibrant Party Lights',
    sort_order: 14
  },
  {
    category_slug: 'birthdays',
    image_url: 'https://images.unsplash.com/photo-1530103047867-b417da5457ef?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_birthdays_15',
    title: 'Friends Celebration',
    sort_order: 15
  },

  // ==================== Category 4: Corporate Events (corporate) ====================
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_1',
    title: 'Corporate Gala Stage',
    sort_order: 1
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_2',
    title: 'CEO Keynote Presentation',
    sort_order: 2
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_3',
    title: 'Auditorium Seminar',
    sort_order: 3
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_4',
    title: 'Product Launch Showcase',
    sort_order: 4
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_5',
    title: 'Boardroom Team Briefing',
    sort_order: 5
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_6',
    title: 'Networking Reception',
    sort_order: 6
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_7',
    title: 'Award Presentation Ceremony',
    sort_order: 7
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_8',
    title: 'Training Workshop Session',
    sort_order: 8
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_9',
    title: 'Panel Discussion Stage',
    sort_order: 9
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1560523136-407424472b25?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_10',
    title: 'Team Brainstorming Session',
    sort_order: 10
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1558224494-ef3c22b5e28a?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_11',
    title: 'Candid Networking',
    sort_order: 11
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_12',
    title: 'Summit Presentation Audience',
    sort_order: 12
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_13',
    title: 'Team Meeting Collaboration',
    sort_order: 13
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_14',
    title: 'Keynote Seminar Slides',
    sort_order: 14
  },
  {
    category_slug: 'corporate',
    image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_corporate_15',
    title: 'Team Milestone Toast',
    sort_order: 15
  },

  // ==================== Category 5: Engagement (engagement) ====================
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_1',
    title: 'Ring Exchange Close-up',
    sort_order: 1
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_2',
    title: 'Floral Arches Portrait',
    sort_order: 2
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_3',
    title: 'Ring Detail Showcase',
    sort_order: 3
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_4',
    title: 'Elegant Garden Setup',
    sort_order: 4
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_5',
    title: 'Candid Garden Romance',
    sort_order: 5
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1485872299829-c673f5194813?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_6',
    title: 'Rings Bokeh Details',
    sort_order: 6
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_7',
    title: 'Romantic Venue Portrait',
    sort_order: 7
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_8',
    title: 'Sunset Gaze',
    sort_order: 8
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1546800330-0a6a4eb9f731?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_9',
    title: 'Beach Proposal Setup',
    sort_order: 9
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_10',
    title: 'Engagement Stage Lights',
    sort_order: 10
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_11',
    title: 'Warm Embrace Portrait',
    sort_order: 11
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_12',
    title: 'Happy Stroll',
    sort_order: 12
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_13',
    title: 'Traditional Ring Ritual',
    sort_order: 13
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_14',
    title: 'Clasped Hands',
    sort_order: 14
  },
  {
    category_slug: 'engagement',
    image_url: 'https://images.unsplash.com/photo-1507504038482-762102124e18?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_engagement_15',
    title: 'Night Engagement Glimpse',
    sort_order: 15
  },

  // ==================== Category 6: Reception (reception) ====================
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_1',
    title: 'Reception Hall Design',
    sort_order: 1
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_2',
    title: 'Gala Dance Floor',
    sort_order: 2
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1464349172961-104d6e8b713d?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_3',
    title: 'Toast to the Newlyweds',
    sort_order: 3
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1471967183320-ee018f6e114a?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_4',
    title: 'Outdoor Fairy Lights',
    sort_order: 4
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_5',
    title: 'Dance Floor Celebration',
    sort_order: 5
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_6',
    title: 'Table Styling Detail',
    sort_order: 6
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_7',
    title: 'Grand Newlywed Entrance',
    sort_order: 7
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1561525140-c2a4cc68e4db?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_8',
    title: 'Premium Seating Layout',
    sort_order: 8
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1504933350103-e840edd978d5?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_9',
    title: 'DJ Music Party',
    sort_order: 9
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb56?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_10',
    title: 'Champagne Toast Detail',
    sort_order: 10
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_11',
    title: 'Grand Ballroom Dance',
    sort_order: 11
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1510924159515-834f8774aa0f?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_12',
    title: 'Decorated Reception Cake',
    sort_order: 12
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1516062423079-7ca13cca7c5b?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_13',
    title: 'Cheering Party Crowd',
    sort_order: 13
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1508219803418-5f1f894a79a6?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_14',
    title: 'Dancing Under String Lights',
    sort_order: 14
  },
  {
    category_slug: 'reception',
    image_url: 'https://images.unsplash.com/photo-1503525287298-596706de6747?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_reception_15',
    title: 'Banquet Table Setup',
    sort_order: 15
  },

  // ==================== Category 7: Haldi (haldi) ====================
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1595853035070-59a39fe84de3?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_1',
    title: 'Marigold Garland Backdrop',
    sort_order: 1
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_2',
    title: 'Floral Drapery Styling',
    sort_order: 2
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_3',
    title: 'Traditional Clay Pots',
    sort_order: 3
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_4',
    title: 'Sunlit Drapery Backdrop',
    sort_order: 4
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_5',
    title: 'Marigold Blossom Close-up',
    sort_order: 5
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_6',
    title: 'Marigold Petal Backdrop',
    sort_order: 6
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_7',
    title: 'Bright Sunlit Festivities',
    sort_order: 7
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_8',
    title: 'Yellow Floral Details',
    sort_order: 8
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1601987077677-5346c0c57d3f?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_9',
    title: 'Golden Thread Details',
    sort_order: 9
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_10',
    title: 'Sacred Turmeric Powders',
    sort_order: 10
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_11',
    title: 'Traditional Brass Vessels',
    sort_order: 11
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_12',
    title: 'Yellow Canopy Setup',
    sort_order: 12
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_13',
    title: 'Marigold Garland Strings',
    sort_order: 13
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1597586124394-fbd6ef244026?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_14',
    title: 'Floral Carpet Layout',
    sort_order: 14
  },
  {
    category_slug: 'haldi',
    image_url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1920&q=80&fm=webp',
    public_id: 'premium_haldi_15',
    title: 'Haldi Ritual Utensils',
    sort_order: 15
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
