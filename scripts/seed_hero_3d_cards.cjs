const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const heroHardwareCards = [
  {
    id: 'hero-3d-gpu',
    name: 'Hero 3D Card 1 - GeForce RTX 4090 GPU',
    section: 'homepage-hero',
    title: 'GeForce RTX 4090 OC',
    subtitle: 'NVIDIA Ada Lovelace',
    description: '24GB GDDR6X • DLSS 3.5 • 4K Real-Time Ray Tracing',
    badge: 'FLAGSHIP GPU',
    tagline: '৩ বছরের অফিসিয়াল ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop',
    accentColor: '#2563eb',
    targetEntityId: 'components',
    buttonText: 'Explore GPU',
    buttonLink: '/shop?category=components',
    displayOrder: 1,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-cpu',
    name: 'Hero 3D Card 2 - Intel Core i9-14900KS CPU',
    section: 'homepage-hero',
    title: 'Core i9-14900KS',
    subtitle: 'Intel 14th Gen Raptor Lake',
    description: '6.20 GHz Max Turbo • 24 Cores (8P + 16E) • 32 Threads',
    badge: 'FLAGSHIP PROCESSOR',
    tagline: 'অফিসিয়াল ৩ বছর ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop',
    accentColor: '#0284c7',
    targetEntityId: 'components',
    buttonText: 'Explore CPU',
    buttonLink: '/shop?category=components',
    displayOrder: 2,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-mobo',
    name: 'Hero 3D Card 3 - ROG Maximus Z790 Motherboard',
    section: 'homepage-hero',
    title: 'ROG Maximus Dark Hero',
    subtitle: 'ASUS Republic of Gamers',
    description: 'PCIe 5.0 • Wi-Fi 7 • Dual Thunderbolt 4 • Extreme VRM',
    badge: 'MOTHERBOARD',
    tagline: 'অফিসিয়াল রিটেইল পার্টনার',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    accentColor: '#4f46e5',
    targetEntityId: 'components',
    buttonText: 'Explore Motherboards',
    buttonLink: '/shop?category=components',
    displayOrder: 3,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-ram',
    name: 'Hero 3D Card 4 - Corsair Dominator DDR5 RAM',
    section: 'homepage-hero',
    title: 'Dominator Titanium 64GB',
    subtitle: 'Corsair Custom Crafted',
    description: 'DDR5-7200MHz CL34 • DHX Cooling • Intel XMP 3.0',
    badge: 'DDR5 RGB MEMORY',
    tagline: 'লাইফটাইম ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=800&auto=format&fit=crop',
    accentColor: '#9333ea',
    targetEntityId: 'components',
    buttonText: 'Explore Memory',
    buttonLink: '/shop?category=components',
    displayOrder: 4,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-ssd',
    name: 'Hero 3D Card 5 - Samsung 990 PRO NVMe SSD',
    section: 'homepage-hero',
    title: 'Samsung 990 PRO 2TB',
    subtitle: 'V-NAND TLC Gaming SSD',
    description: 'Up to 7,450 MB/s Read • Integrated Aluminum Heatsink',
    badge: 'NVME GEN4 SSD',
    tagline: '৫ বছরের অফিসিয়াল ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop',
    accentColor: '#059669',
    targetEntityId: 'storage',
    buttonText: 'Explore Storage',
    buttonLink: '/shop?category=storage',
    displayOrder: 5,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-cooler',
    name: 'Hero 3D Card 6 - NZXT Kraken Elite 360 Liquid Cooler',
    section: 'homepage-hero',
    title: 'Kraken Elite 360 RGB',
    subtitle: 'NZXT Liquid Thermal Control',
    description: 'Customizable 60Hz LCD Screen • Asetek 7th Gen Pump',
    badge: '360MM AIO COOLER',
    tagline: '৬ বছরের ব্র্যান্ড ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop',
    accentColor: '#0891b2',
    targetEntityId: 'components',
    buttonText: 'Explore Cooling',
    buttonLink: '/shop?category=components',
    displayOrder: 6,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-case',
    name: 'Hero 3D Card 7 - Lian Li O11 Dynamic EVO Casing',
    section: 'homepage-hero',
    title: 'O11 Dynamic EVO RGB',
    subtitle: 'Lian Li Architectural Chassis',
    description: 'Dual 420mm Radiator Support • Reverse Mode Capability',
    badge: 'PREMIUM CASING',
    tagline: 'অরিজিনাল অ্যালুমিনিয়াম বিল্ড',
    image: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?q=80&w=800&auto=format&fit=crop',
    accentColor: '#d97706',
    targetEntityId: 'components',
    buttonText: 'Explore Casings',
    buttonLink: '/shop?category=components',
    displayOrder: 7,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-psu',
    name: 'Hero 3D Card 8 - Seasonic Prime 1000W Power Supply',
    section: 'homepage-hero',
    title: 'Seasonic Prime TX-1000',
    subtitle: 'Japanese 105°C Capacitors',
    description: 'Native PCIe 5.0 12VHPWR • 0.5% Micro Tolerance Regulation',
    badge: 'TITANIUM POWER',
    tagline: '১২ বছরের অফিসিয়াল ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop',
    accentColor: '#ca8a04',
    targetEntityId: 'components',
    buttonText: 'Explore Power Supplies',
    buttonLink: '/shop?category=components',
    displayOrder: 8,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-monitor',
    name: 'Hero 3D Card 9 - ASUS ROG Swift OLED 4K Monitor',
    section: 'homepage-hero',
    title: 'ROG Swift PG32UCDM',
    subtitle: 'True 10-Bit Color Gaming',
    description: '32" 3840x2160 QD-OLED • 0.03ms Response • Custom Heatsink',
    badge: '4K QD-OLED MONITOR',
    tagline: '৩ বছর প্যানেল বার্ন-ইন ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
    accentColor: '#e11d48',
    targetEntityId: 'monitors',
    buttonText: 'Explore Monitors',
    buttonLink: '/shop?category=monitors',
    displayOrder: 9,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  },
  {
    id: 'hero-3d-keyboard',
    name: 'Hero 3D Card 10 - ROG Azoth Custom Mechanical Keyboard',
    section: 'homepage-hero',
    title: 'ROG Azoth Extreme',
    subtitle: 'Hot-Swappable 75% Layout',
    description: 'Silicone Gasket Mount • Carbon Fiber Plate • SpeedNova Wireless',
    badge: 'CUSTOM KEYBOARD',
    tagline: 'অফিসিয়াল ২ বছর ওয়ারেন্টি',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop',
    accentColor: '#0d9488',
    targetEntityId: 'gaming',
    buttonText: 'Explore Keyboards',
    buttonLink: '/shop?category=gaming',
    displayOrder: 10,
    isVisible: true,
    status: 'published',
    targetDevice: 'all'
  }
];

// 1. Update cards.json
const cardsFile = path.resolve(__dirname, '../server/data/cards.json');
let cards = [];
try {
  cards = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
} catch (e) {
  cards = [];
}

// Remove old hero-slide-* cards
cards = cards.filter(c => !c.id.startsWith('hero-slide-'));

// Merge or add heroHardwareCards
for (const newCard of heroHardwareCards) {
  const existingIndex = cards.findIndex(c => c.id === newCard.id);
  if (existingIndex >= 0) {
    cards[existingIndex] = { ...cards[existingIndex], ...newCard };
  } else {
    cards.push(newCard);
  }
}

fs.writeFileSync(cardsFile, JSON.stringify(cards, null, 2), 'utf8');
console.log('Saved server/data/cards.json successfully. Total cards:', cards.length);

// 2. Sync to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

(async () => {
  if (!MONGO_URI) {
    console.log('No MONGO_URI found, skipping mongo sync.');
    process.exit(0);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Clean up old hero-slide-* in DB
    await mongoose.connection.collection('sitecards').deleteMany({ id: { $regex: '^hero-slide-' } });

    for (const card of heroHardwareCards) {
      await mongoose.connection.collection('sitecards').updateOne(
        { id: card.id },
        { $set: card },
        { upsert: true }
      );
    }
    console.log('Successfully upserted 10 hero 3D hardware cards to MongoDB Atlas collection "sitecards"!');
    await mongoose.disconnect();
    console.log('MongoDB sync completed.');
    process.exit(0);
  } catch (err) {
    console.error('Mongo sync error:', err.message);
    process.exit(0);
  }
})();
