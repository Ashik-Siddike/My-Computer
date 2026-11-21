const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://ashikur:ashikur1122@cluster0.b9u4s.mongodb.net/my_computer?retryWrites=true&w=majority';
const DATA_DIR = path.resolve(__dirname, '../server/data');

const CATEGORIES_11 = [
  {
    id: 'desktop-laptop',
    name: 'Desktop & Laptop',
    nameBn: 'ডেস্কটপ ও ল্যাপটপ',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
    itemCount: 22,
    order: 1,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'business-laptop', name: 'Business Laptops', nameBn: 'বিজনেস ল্যাপটপ' },
      { id: 'gaming-laptop', name: 'Gaming Laptops', nameBn: 'গেমিং ল্যাপটপ' },
      { id: 'apple-macbook', name: 'Apple MacBooks', nameBn: 'অ্যাপল ম্যাকবুক' },
      { id: 'all-in-one-pc', name: 'All-in-One PC', nameBn: 'অল ইন ওয়ান পিসি' },
    ]
  },
  {
    id: 'components',
    name: 'Components',
    nameBn: 'কম্পোনেন্টস',
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop',
    itemCount: 16,
    order: 2,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'processor', name: 'Processors (CPU)', nameBn: 'প্রসেসর' },
      { id: 'motherboard', name: 'Motherboards', nameBn: 'মাদারবোর্ড' },
      { id: 'ram', name: 'Memory (RAM)', nameBn: 'র‌্যাম' },
      { id: 'graphics-card', name: 'Graphics Cards (GPU)', nameBn: 'গ্রাফিক্স কার্ড' },
      { id: 'casing', name: 'Casings & Fans', nameBn: 'কেসিং ও কুলার' },
    ]
  },
  {
    id: 'monitors',
    name: 'Monitors',
    nameBn: 'মনিটর',
    icon: 'Monitor',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
    itemCount: 30,
    order: 3,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'lg-monitor', name: 'LG Monitors', nameBn: 'এলজি মনিটর' },
      { id: 'asus-monitor', name: 'ASUS Monitors', nameBn: 'আসুস মনিটর' },
      { id: '4k-monitor', name: '4K UHD Monitors', nameBn: '৪কে মনিটর' },
      { id: 'gaming-monitor', name: 'Gaming Monitors (144Hz+)', nameBn: 'গেমিং মনিটর' },
    ]
  },
  {
    id: 'storage',
    name: 'Storage',
    nameBn: 'স্টোরেজ',
    icon: 'HardDrive',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop',
    itemCount: 12,
    order: 4,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'nvme-ssd', name: 'NVMe M.2 SSDs', nameBn: 'এনভিএমই এসএসডি' },
      { id: 'sata-ssd', name: 'SATA SSDs', nameBn: 'সাটা এসএসডি' },
      { id: 'portable-ssd', name: 'Portable SSD & HDD', nameBn: 'পোর্টেবল স্টোরেজ' },
      { id: 'surveillance-hdd', name: 'Surveillance & NAS HDD', nameBn: 'সার্ভেল্যান্স হার্ডডিস্ক' },
    ]
  },
  {
    id: 'ups',
    name: 'UPS',
    nameBn: 'ইউপিএস',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    itemCount: 10,
    order: 5,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'offline-ups', name: 'Offline UPS (650VA - 1200VA)', nameBn: 'অফলাইন ইউপিএস' },
      { id: 'online-ups', name: 'Online UPS (1KVA - 10KVA)', nameBn: 'অনলাইন ইউপিএস' },
      { id: 'voltage-stabilizer', name: 'Voltage Stabilizers', nameBn: 'ভোল্টেজ স্ট্যাবিলাইজার' },
    ]
  },
  {
    id: 'networking',
    name: 'Networking',
    nameBn: 'নেটওয়ার্কিং',
    icon: 'Wifi',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
    itemCount: 38,
    order: 6,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'wifi-routers', name: 'Wi-Fi 6 & Mesh Routers', nameBn: 'ওয়াই-ফাই রাউটার' },
      { id: 'onu-device', name: 'GPON / EPON ONU Devices', nameBn: 'ওএনইউ ডিভাইস' },
      { id: 'network-switch', name: 'Gigabit & PoE Switches', nameBn: 'নেটওয়ার্ক সুইচ' },
      { id: 'access-points', name: 'Enterprise Access Points', nameBn: 'এক্সেস পয়েন্ট' },
    ]
  },
  {
    id: 'camera',
    name: 'Camera & Security',
    nameBn: 'ক্যামেরা ও সিকিউরিটি',
    icon: 'Camera',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop',
    itemCount: 73,
    order: 7,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'ezviz-camera', name: 'EZVIZ Smart AI Cameras', nameBn: 'ইজভিজ ক্যামেরা' },
      { id: 'cc-camera', name: 'IP & CCTV Cameras', nameBn: 'সিসি ক্যামেরা' },
      { id: 'dvr-nvr', name: 'NVR & DVR Systems', nameBn: 'এনভিআর ও ডিভিআর' },
      { id: 'action-camera', name: 'Action & Dash Cameras', nameBn: 'অ্যাকশন ক্যামেরা' },
    ]
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameBn: 'এক্সেসরিজ',
    icon: 'Keyboard',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop',
    itemCount: 15,
    order: 8,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'keyboards', name: 'Keyboards & Mice', nameBn: 'কীবোর্ড ও মাউস' },
      { id: 'hubs-docks', name: 'USB-C Hubs & Adapters', nameBn: 'ইউএসবি হাব' },
      { id: 'cables-chargers', name: 'High-Speed Cables & Chargers', nameBn: 'চার্জার ও কেবল' },
    ]
  },
  {
    id: 'printer-office',
    name: 'Printer & Office',
    nameBn: 'প্রিন্টার ও অফিস',
    icon: 'Printer',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=800&auto=format&fit=crop',
    itemCount: 10,
    order: 9,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'laser-printers', name: 'Laser & Ink Tank Printers', nameBn: 'লেজার প্রিন্টার' },
      { id: 'scanners', name: 'Document Scanners', nameBn: 'স্ক্যানার' },
      { id: 'barcode-scanners', name: 'POS & Barcode Readers', nameBn: 'বারকোড রিডার' },
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming Gear',
    nameBn: 'গেমিং গিয়ার',
    icon: 'Gamepad2',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    itemCount: 18,
    order: 10,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'gaming-keyboards', name: 'Mechanical Keyboards', nameBn: 'মেকানিক্যাল কীবোর্ড' },
      { id: 'gaming-mouse', name: 'Esports Gaming Mouse', nameBn: 'গেমিং মাউস' },
      { id: 'gaming-headsets', name: 'Gaming Headsets 7.1', nameBn: 'গেমিং হেডসেট' },
      { id: 'gaming-chairs', name: 'Ergonomic Gaming Chairs', nameBn: 'গেমিং চেয়ার' },
    ]
  },
  {
    id: 'earbuds-headphones',
    name: 'Earbuds & Headphones',
    nameBn: 'ইয়ারবাডস ও হেডফোন',
    icon: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    itemCount: 22,
    order: 11,
    popular: true,
    isVisible: true,
    subCategories: [
      { id: 'wireless-earbuds', name: 'Wireless Earbuds', nameBn: 'ওয়্যারলেস ইয়ারবাডস' },
      { id: 'bluetooth-earbuds', name: 'Bluetooth Earbuds', nameBn: 'ব্লুটুথ ইয়ারবাডস' },
      { id: 'gaming-earbuds', name: 'Gaming Earbuds', nameBn: 'গেমিং ইয়ারবাডস' },
      { id: 'neckband-earphones', name: 'Neckband Earphones', nameBn: 'নেকব্যান্ড ইয়ারফোন' },
      { id: 'wired-earphones', name: 'Wired Earphones', nameBn: 'তারযুক্ত ইয়ারফোন' },
      { id: 'bluetooth-headphones', name: 'Bluetooth Headphones', nameBn: 'ব্লুটুথ হেডফোন' },
      { id: 'wireless-headphones', name: 'Wireless Headphones', nameBn: 'ওয়্যারলেস হেডফোন' },
      { id: 'gaming-headphones', name: 'Gaming Headphones', nameBn: 'গেমিং হেডফোন' },
      { id: 'over-ear-headphones', name: 'Over-Ear Headphones', nameBn: 'ওভার-ইয়ার হেডফোন' },
      { id: 'on-ear-headphones', name: 'On-Ear Headphones', nameBn: 'অন-ইয়ার হেডফোন' },
    ]
  }
];

const EARBUDS_22_PRODUCTS = [
  {
    id: 'prod-audio-01',
    productId: 'prod-audio-01',
    name: 'Apple AirPods Pro (2nd Generation with MagSafe USB-C)',
    slug: 'apple-airpods-pro-2-usb-c',
    brand: 'Apple',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wireless Earbuds',
    regularPrice: 28500,
    discountPrice: 28500,
    price: 28500,
    salePrice: 28500,
    discountPercentage: 0,
    rating: 4.9,
    reviewCount: 58,
    stockStatus: 'In Stock',
    stockCount: 20,
    stock: 20,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Apple H2 Headphone Chip with Computational Audio',
      'Up to 2x more Active Noise Cancellation than prior generation',
      'Adaptive Audio with Transparency and Personalized Spatial Audio',
      'IP54 dust, sweat, and water resistant with USB-C MagSafe case'
    ],
    specifications: {
      'Audio Technology': [
        { label: 'Chipset', value: 'Apple H2 Silicon' },
        { label: 'Noise Cancellation', value: 'Active Noise Cancellation (ANC)' },
        { label: 'Transparency Mode', value: 'Adaptive Transparency' },
        { label: 'Spatial Audio', value: 'Personalized Spatial Audio with dynamic head tracking' }
      ],
      'Battery & Charging': [
        { label: 'Battery Life', value: 'Up to 6 hours (30 hours with case)' },
        { label: 'Charging Case', value: 'MagSafe USB-C with speaker and lanyard loop' }
      ]
    },
    warranty: '1 Year Apple Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 2375,
    isVisible: true,
    isFeatured: true
  },
  {
    id: 'prod-audio-02',
    productId: 'prod-audio-02',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    slug: 'sony-wh-1000xm5-black',
    brand: 'Sony',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Over-Ear Headphones',
    regularPrice: 38500,
    discountPrice: 38500,
    price: 38500,
    salePrice: 38500,
    discountPercentage: 0,
    rating: 4.9,
    reviewCount: 44,
    stockStatus: 'In Stock',
    stockCount: 15,
    stock: 15,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Industry-leading active noise cancellation with 8 microphones & Auto NC Optimizer',
      'Integrated Processor V1 and HD Noise Canceling Processor QN1',
      '30-hour battery life with 3-minute quick charging for 3 hours playback',
      'Crystal-clear hands-free calling with 4 beamforming mics and AI noise reduction'
    ],
    specifications: {
      'Acoustic Driver': [
        { label: 'Driver Unit', value: '30mm precision-engineered carbon fiber' },
        { label: 'Frequency Response', value: '4Hz - 40,000Hz (Hi-Res Audio Wireless LDAC)' }
      ],
      'Connectivity': [
        { label: 'Bluetooth', value: 'v5.2 Multipoint (2 devices simultaneously)' },
        { label: 'Battery Life', value: '30 Hours (NC On) / 40 Hours (NC Off)' }
      ]
    },
    warranty: '1 Year Sony Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 3208,
    isVisible: true,
    isFeatured: true
  },
  {
    id: 'prod-audio-03',
    productId: 'prod-audio-03',
    name: 'Sony WF-1000XM5 Truly Wireless Noise Canceling Earbuds',
    slug: 'sony-wf-1000xm5-anc-earbuds',
    brand: 'Sony',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wireless Earbuds',
    regularPrice: 27500,
    discountPrice: 27500,
    price: 27500,
    salePrice: 27500,
    discountPercentage: 0,
    rating: 4.8,
    reviewCount: 30,
    stockStatus: 'In Stock',
    stockCount: 14,
    stock: 14,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Dynamic Driver X for rich vocals and deep immersive bass reproduction',
      'Multi-noise sensor technology with 3 microphones per earbud',
      'Multipoint connection & Bone conduction sensors for crystal-clear calls',
      'Qi wireless charging case with 24 hours total battery life'
    ],
    specifications: {
      'Sound Performance': [
        { label: 'Driver', value: '8.4mm Dynamic Driver X' },
        { label: 'Audio Codecs', value: 'LDAC, AAC, SBC, LC3' }
      ]
    },
    warranty: '1 Year Sony Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 2291,
    isVisible: true
  },
  {
    id: 'prod-audio-04',
    productId: 'prod-audio-04',
    name: 'Bose QuietComfort Ultra Wireless Noise Cancelling Headphones',
    slug: 'bose-quietcomfort-ultra-headphones',
    brand: 'Bose',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Over-Ear Headphones',
    regularPrice: 46500,
    discountPrice: 46500,
    price: 46500,
    salePrice: 46500,
    discountPercentage: 0,
    rating: 4.9,
    reviewCount: 24,
    stockStatus: 'In Stock',
    stockCount: 8,
    stock: 8,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'World-class active noise cancellation with CustomTune personalized audio technology',
      'Bose Immersive Audio pushes spatial soundstage boundaries',
      'Ultra-luxurious protein leather earcups with cast aluminum headband arms',
      'Up to 24 hours continuous battery life on a single USB-C charge'
    ],
    specifications: {
      'Acoustic Features': [
        { label: 'Audio Technology', value: 'CustomTune Sound Calibration' },
        { label: 'Spatial Sound', value: 'Bose Immersive Audio' }
      ]
    },
    warranty: '1 Year Bose Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 3875,
    isVisible: true,
    isFeatured: true
  },
  {
    id: 'prod-audio-05',
    productId: 'prod-audio-05',
    name: 'Bose QuietComfort Ultra True Wireless Noise Cancelling Earbuds',
    slug: 'bose-qc-ultra-earbuds-black',
    brand: 'Bose',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wireless Earbuds',
    regularPrice: 33500,
    discountPrice: 33500,
    price: 33500,
    salePrice: 33500,
    discountPercentage: 0,
    rating: 4.8,
    reviewCount: 20,
    stockStatus: 'In Stock',
    stockCount: 10,
    stock: 10,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Breakthrough spatialized sound with Bose Immersive Audio technology',
      'World-class noise cancellation automatically tuned to your ear canal',
      '9 combinations of eartips and stability bands for tailored comfort',
      'Up to 6 hours continuous listening (24 hours total with case)'
    ],
    specifications: {
      'Design': [
        { label: 'Water Resistance', value: 'IPX4 Rated' },
        { label: 'Bluetooth Version', value: 'v5.3 Low Energy' }
      ]
    },
    warranty: '1 Year Bose Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 2791,
    isVisible: true
  },
  {
    id: 'prod-audio-06',
    productId: 'prod-audio-06',
    name: 'Sennheiser Momentum 4 Wireless Over-Ear ANC Headphones',
    slug: 'sennheiser-momentum-4-wireless',
    brand: 'Sennheiser',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Over-Ear Headphones',
    regularPrice: 36500,
    discountPrice: 36500,
    price: 36500,
    salePrice: 36500,
    discountPercentage: 0,
    rating: 4.9,
    reviewCount: 22,
    stockStatus: 'In Stock',
    stockCount: 9,
    stock: 9,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Audiophile-inspired 42mm dynamic transducer system for brilliant acoustics',
      'Exceptional 60-hour battery life with fast Type-C charging',
      'Next-generation Adaptive Noise Cancellation & Transparency Mode',
      'Lightweight folding design with padded headband and deeply cushioned earpads'
    ],
    specifications: {
      'Audio Details': [
        { label: 'Transducer Size', value: '42mm Dynamic' },
        { label: 'Battery Capacity', value: '60 Hours' }
      ]
    },
    warranty: '2 Years Sennheiser Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 3041,
    isVisible: true
  },
  {
    id: 'prod-audio-07',
    productId: 'prod-audio-07',
    name: 'Sennheiser HD 450BT Wireless Noise Cancelling Headphones',
    slug: 'sennheiser-hd-450bt-black',
    brand: 'Sennheiser',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Bluetooth Headphones',
    regularPrice: 17500,
    discountPrice: 17500,
    price: 17500,
    salePrice: 17500,
    discountPercentage: 0,
    rating: 4.7,
    reviewCount: 35,
    stockStatus: 'In Stock',
    stockCount: 16,
    stock: 16,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Active noise cancellation for uninterrupted listening pleasure',
      '30-hour battery life via USB-C fast charging interface',
      'Sennheiser Smart Control App equalizer support and podcast speech mode',
      'High-quality wireless codec support including AAC and AptX Low Latency'
    ],
    specifications: {
      'Battery': [
        { label: 'Playtime', value: '30 Hours with ANC' },
        { label: 'Charging Time', value: 'Approx. 2 Hours' }
      ]
    },
    warranty: '2 Years Sennheiser Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1458,
    isVisible: true
  },
  {
    id: 'prod-audio-08',
    productId: 'prod-audio-08',
    name: 'Audio-Technica ATH-M50x Professional Studio Monitor Headphones',
    slug: 'audio-technica-ath-m50x-studio-monitor',
    brand: 'Audio-Technica',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wired Earphones',
    regularPrice: 16800,
    discountPrice: 16800,
    price: 16800,
    salePrice: 16800,
    discountPercentage: 0,
    rating: 5.0,
    reviewCount: 72,
    stockStatus: 'In Stock',
    stockCount: 22,
    stock: 22,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Critically acclaimed sonic performance praised by top audio engineers worldwide',
      'Proprietary 45mm large-aperture drivers with rare earth copper-clad aluminum wire',
      'Exceptional clarity throughout an extended frequency range with deep bass',
      '90-degree swiveling earcups for effortless one-ear audio monitoring'
    ],
    specifications: {
      'Driver': [
        { label: 'Driver Size', value: '45mm Large Aperture' },
        { label: 'Frequency Response', value: '15 - 28,000 Hz' }
      ]
    },
    warranty: '1 Year Audio-Technica Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1400,
    isVisible: true
  },
  {
    id: 'prod-audio-09',
    productId: 'prod-audio-09',
    name: 'Anker Soundcore Liberty 4 NC True Wireless Earbuds',
    slug: 'anker-soundcore-liberty-4-nc',
    brand: 'Anker',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wireless Earbuds',
    regularPrice: 8200,
    discountPrice: 8200,
    price: 8200,
    salePrice: 8200,
    discountPercentage: 0,
    rating: 4.8,
    reviewCount: 48,
    stockStatus: 'In Stock',
    stockCount: 30,
    stock: 30,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Reduce noise by up to 98.5% with Adaptive ANC 2.0 real-time environment sensor',
      '11mm custom-tuned drivers with Hi-Res Wireless and LDAC support',
      '50-hour total playtime (10 hours earbuds + 40 hours charging case)',
      '6 beamforming microphones with AI clear call algorithm for wind-free voice'
    ],
    specifications: {
      'Acoustics': [
        { label: 'Driver', value: '11mm Custom Dynamic' },
        { label: 'Noise Reduction', value: 'Up to 98.5% Adaptive ANC' }
      ]
    },
    warranty: '18 Months Anker Official Replacement Warranty',
    emiAvailable: false,
    isVisible: true
  },
  {
    id: 'prod-audio-10',
    productId: 'prod-audio-10',
    name: 'Anker Soundcore Life Q30 Hybrid Active Noise Cancelling Headphones',
    slug: 'anker-soundcore-life-q30',
    brand: 'Anker',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Bluetooth Headphones',
    regularPrice: 7500,
    discountPrice: 7500,
    price: 7500,
    salePrice: 7500,
    discountPercentage: 0,
    rating: 4.7,
    reviewCount: 55,
    stockStatus: 'In Stock',
    stockCount: 28,
    stock: 28,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Advanced hybrid ANC with Transport, Outdoor, and Indoor targeted modes',
      'Custom 40mm silk-diaphragm drivers certified for Hi-Res Audio reproduction',
      'Up to 40 hours playtime in ANC mode (60 hours in standard Bluetooth mode)',
      'Ultra-soft protein leather earcups with memory foam padding for all-day comfort'
    ],
    specifications: {
      'Playtime': [
        { label: 'ANC Playtime', value: '40 Hours' },
        { label: 'Standard Playtime', value: '60 Hours' }
      ]
    },
    warranty: '18 Months Anker Official Replacement Warranty',
    emiAvailable: false,
    isVisible: true
  },
  {
    id: 'prod-audio-11',
    productId: 'prod-audio-11',
    name: 'JBL Tune 770NC Wireless Adaptive Noise Cancelling Headphones',
    slug: 'jbl-tune-770nc-bluetooth-headphones',
    brand: 'JBL',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Bluetooth Headphones',
    regularPrice: 9800,
    discountPrice: 9800,
    price: 9800,
    salePrice: 9800,
    discountPercentage: 0,
    rating: 4.7,
    reviewCount: 38,
    stockStatus: 'In Stock',
    stockCount: 20,
    stock: 20,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Adaptive Noise Cancelling with Smart Ambient awareness modes',
      'JBL Pure Bass Sound with customizable EQ via official JBL Headphones app',
      'Up to 70 hours battery life with speed charging (5 min charge = 3 hours playback)',
      'Bluetooth 5.3 with multi-point connection support for seamless switching'
    ],
    specifications: {
      'Driver': [
        { label: 'Driver Size', value: '40mm Dynamic Driver' },
        { label: 'Battery Life', value: 'Up to 70 Hours (BT only)' }
      ]
    },
    warranty: '1 Year JBL Official Warranty',
    emiAvailable: false,
    isVisible: true
  },
  {
    id: 'prod-audio-12',
    productId: 'prod-audio-12',
    name: 'JBL Wave Beam True Wireless In-Ear Earbuds',
    slug: 'jbl-wave-beam-tws-earbuds',
    brand: 'JBL',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wireless Earbuds',
    regularPrice: 4950,
    discountPrice: 4950,
    price: 4950,
    salePrice: 4950,
    discountPercentage: 0,
    rating: 4.6,
    reviewCount: 45,
    stockStatus: 'In Stock',
    stockCount: 35,
    stock: 35,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'JBL Deep Bass Sound powered by 8mm dynamic acoustic drivers',
      'Comfortable ergonomic stick-closed design that isolates background noise',
      'Up to 32 hours total battery (8 hours earbuds + 24 hours charging case)',
      'IP54 water and dust resistant certified for workouts and outdoor use'
    ],
    specifications: {
      'Battery': [
        { label: 'Earbud Playtime', value: '8 Hours' },
        { label: 'Case Reserve', value: '24 Hours' }
      ]
    },
    warranty: '1 Year JBL Official Warranty',
    emiAvailable: false,
    isVisible: true
  },
  {
    id: 'prod-audio-13',
    productId: 'prod-audio-13',
    name: 'Samsung Galaxy Buds2 Pro True Wireless Earbuds',
    slug: 'samsung-galaxy-buds2-pro',
    brand: 'Samsung',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wireless Earbuds',
    regularPrice: 16500,
    discountPrice: 16500,
    price: 16500,
    salePrice: 16500,
    discountPercentage: 0,
    rating: 4.8,
    reviewCount: 33,
    stockStatus: 'In Stock',
    stockCount: 16,
    stock: 16,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      '24-bit Hi-Fi audio processing for uncompromised studio quality sound',
      'Intelligent 360 Audio with enhanced direct multi-channel head tracking',
      '3 high-SNR microphones for superior Active Noise Cancellation and wind shielding',
      'IPX7 certified water resistance rating for heavy sweat and rain protection'
    ],
    specifications: {
      'Audio': [
        { label: 'Codec', value: 'Samsung Seamless Codec HiFi, AAC, SBC' },
        { label: 'Microphone', value: '3 High-SNR Mic Array' }
      ]
    },
    warranty: '1 Year Samsung Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1375,
    isVisible: true
  },
  {
    id: 'prod-audio-14',
    productId: 'prod-audio-14',
    name: 'Razer BlackShark V2 Pro Wireless Esports Gaming Headset',
    slug: 'razer-blackshark-v2-pro-wireless-gaming',
    brand: 'Razer',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Gaming Headphones',
    regularPrice: 19500,
    discountPrice: 19500,
    price: 19500,
    salePrice: 19500,
    discountPercentage: 0,
    rating: 4.9,
    reviewCount: 41,
    stockStatus: 'In Stock',
    stockCount: 14,
    stock: 14,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Razer HyperClear Super Wideband Mic for broadcast-grade voice communication',
      'TriForce Titanium 50mm Drivers with custom-tuned competitive FPS sound profiles',
      'Ultra-low latency Razer HyperSpeed 2.4GHz Wireless with Bluetooth 5.2 duality',
      'Up to 70 hours battery life with Type-C rapid charging interface'
    ],
    specifications: {
      'Gaming Audio': [
        { label: 'Drivers', value: 'TriForce Titanium 50mm' },
        { label: 'Microphone', value: 'HyperClear Super Wideband Detachable' },
        { label: 'Wireless Tech', value: 'Razer HyperSpeed 2.4GHz + BT' }
      ]
    },
    warranty: '2 Years Razer Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1625,
    isVisible: true,
    isFeatured: true
  },
  {
    id: 'prod-audio-15',
    productId: 'prod-audio-15',
    name: 'Razer Hammerhead True Wireless Pro Gaming Earbuds',
    slug: 'razer-hammerhead-pro-anc-gaming',
    brand: 'Razer',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Gaming Earbuds',
    regularPrice: 11500,
    discountPrice: 11500,
    price: 11500,
    salePrice: 11500,
    discountPercentage: 0,
    rating: 4.7,
    reviewCount: 22,
    stockStatus: 'In Stock',
    stockCount: 15,
    stock: 15,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'THX Certified true wireless audio fidelity tested by cinematic sound experts',
      'Advanced Hybrid Active Noise Cancellation (ANC) with feedforward & feedback mics',
      '60ms ultra-low latency gaming mode for competitive mobile and PC gameplay',
      'Comply black foam ear tips included for maximum acoustic seal and comfort'
    ],
    specifications: {
      'Latency': [
        { label: 'Gaming Latency', value: '60ms Low Latency Mode' },
        { label: 'Certification', value: 'THX Cinema Audio' }
      ]
    },
    warranty: '2 Years Razer Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 958,
    isVisible: true
  },
  {
    id: 'prod-audio-16',
    productId: 'prod-audio-16',
    name: 'Logitech G PRO X 2 LIGHTSPEED Wireless Gaming Headset',
    slug: 'logitech-g-pro-x-2-lightspeed',
    brand: 'Logitech',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Gaming Headphones',
    regularPrice: 25500,
    discountPrice: 25500,
    price: 25500,
    salePrice: 25500,
    discountPercentage: 0,
    rating: 4.9,
    reviewCount: 29,
    stockStatus: 'In Stock',
    stockCount: 11,
    stock: 11,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      '50mm Graphene Audio Drivers for enhanced acoustic response and reduced distortion',
      'LIGHTSPEED wireless with up to 50 hours battery life on a single charge',
      'DTS Headphone:X 2.0 7.1 surround sound positioning with situational awareness',
      'Durable aluminum fork and steel headband with swiveling memory foam earcups'
    ],
    specifications: {
      'Drivers': [
        { label: 'Diaphragm Material', value: 'Pure Graphene 50mm' },
        { label: 'Wireless Range', value: 'Up to 30 Meters' }
      ]
    },
    warranty: '2 Years Logitech Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 2125,
    isVisible: true,
    isFeatured: true
  },
  {
    id: 'prod-audio-17',
    productId: 'prod-audio-17',
    name: 'SteelSeries Arctis Nova 7 Wireless Gaming Headset',
    slug: 'steelseries-arctis-nova-7-wireless',
    brand: 'SteelSeries',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Gaming Headphones',
    regularPrice: 22500,
    discountPrice: 22500,
    price: 22500,
    salePrice: 22500,
    discountPercentage: 0,
    rating: 4.8,
    reviewCount: 26,
    stockStatus: 'In Stock',
    stockCount: 12,
    stock: 12,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Nova Acoustic System with High Fidelity Drivers and Sonar parametric EQ software',
      'Simultaneous 2.4GHz gaming wireless and mobile Bluetooth connectivity',
      '38-hour battery life with USB-C fast charging (15 min = 6 hours gameplay)',
      'ClearCast Gen 2 AI-powered bidirectional noise cancelling microphone'
    ],
    specifications: {
      'Wireless': [
        { label: 'Connectivity', value: 'Dual Wireless: 2.4GHz + Bluetooth' },
        { label: 'Battery Life', value: '38 Hours continuous' }
      ]
    },
    warranty: '1 Year SteelSeries Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1875,
    isVisible: true
  },
  {
    id: 'prod-audio-18',
    productId: 'prod-audio-18',
    name: 'HyperX Cloud III Wireless Gaming Headset',
    slug: 'hyperx-cloud-3-wireless-red',
    brand: 'HyperX',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Gaming Headphones',
    regularPrice: 15500,
    discountPrice: 15500,
    price: 15500,
    salePrice: 15500,
    discountPercentage: 0,
    rating: 4.8,
    reviewCount: 36,
    stockStatus: 'In Stock',
    stockCount: 18,
    stock: 18,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Signature HyperX comfort with plush red memory foam in headband and ear pads',
      'Up to 120 hours of continuous battery life on a single wireless charge',
      'Re-engineered angled 53mm dynamic audio drivers tuned for gaming spatial cues',
      'Ultra-clear 10mm microphone with internal mesh filter and LED mute indicator'
    ],
    specifications: {
      'Battery': [
        { label: 'Wireless Battery Life', value: 'Up to 120 Hours' },
        { label: 'Driver Size', value: '53mm Angled Neodymium' }
      ]
    },
    warranty: '2 Years HyperX Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1291,
    isVisible: true
  },
  {
    id: 'prod-audio-19',
    productId: 'prod-audio-19',
    name: 'OnePlus Bullets Wireless Z2 Bluetooth Neckband Earphones',
    slug: 'oneplus-bullets-wireless-z2-magico-black',
    brand: 'OnePlus',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Neckband Earphones',
    regularPrice: 2450,
    discountPrice: 2450,
    price: 2450,
    salePrice: 2450,
    discountPercentage: 0,
    rating: 4.7,
    reviewCount: 82,
    stockStatus: 'In Stock',
    stockCount: 40,
    stock: 40,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      '12.4mm deep bass dynamic drivers with anti-distortion sound technology',
      'Warp Charge: 10 minutes charging gives 20 hours of continuous music playback',
      'Up to 30 hours of long-lasting battery life on a single full charge',
      'IP55 sweat and water resistance with magnetic earbud power on/off lock'
    ],
    specifications: {
      'Charging': [
        { label: 'Warp Fast Charge', value: '10 Mins for 20 Hours' },
        { label: 'Total Playtime', value: '30 Hours' }
      ]
    },
    warranty: '6 Months OnePlus Brand Warranty',
    emiAvailable: false,
    isVisible: true
  },
  {
    id: 'prod-audio-20',
    productId: 'prod-audio-20',
    name: 'Realme Buds Wireless 3 ANC Bluetooth Neckband Earphones',
    slug: 'realme-buds-wireless-3-bass-yellow',
    brand: 'Realme',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Neckband Earphones',
    regularPrice: 2950,
    discountPrice: 2950,
    price: 2950,
    salePrice: 2950,
    discountPercentage: 0,
    rating: 4.6,
    reviewCount: 56,
    stockStatus: 'In Stock',
    stockCount: 35,
    stock: 35,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      '30dB Active Noise Cancellation with dual feedback microphones',
      '13.6mm dynamic bass boost driver with PET+carbon composite diaphragm',
      '360-degree spatial audio effect support for gaming and cinematic content',
      '40-hour total battery life with fast Type-C charging support'
    ],
    specifications: {
      'ANC': [
        { label: 'Noise Cancellation Depth', value: '30dB ANC' },
        { label: 'Battery Life', value: '40 Hours Playtime' }
      ]
    },
    warranty: '6 Months Realme Brand Warranty',
    emiAvailable: false,
    isVisible: true
  },
  {
    id: 'prod-audio-21',
    productId: 'prod-audio-21',
    name: 'Sony WH-CH720N Wireless Noise Canceling Headphones',
    slug: 'sony-wh-ch720n-anc-blue',
    brand: 'Sony',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Bluetooth Headphones',
    regularPrice: 12500,
    discountPrice: 12500,
    price: 12500,
    salePrice: 12500,
    discountPercentage: 0,
    rating: 4.7,
    reviewCount: 32,
    stockStatus: 'In Stock',
    stockCount: 16,
    stock: 16,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Sony Integrated Processor V1 for premium adaptive noise cancellation',
      'Ultra-lightweight design at only 192g for fatigue-free all-day comfort',
      'Up to 35 hours battery life with quick charging (3 min = 1 hour playback)',
      'Multipoint connection allows switching between two Bluetooth devices seamlessly'
    ],
    specifications: {
      'Weight & Battery': [
        { label: 'Weight', value: '192 Grams' },
        { label: 'Playtime', value: '35 Hours with ANC' }
      ]
    },
    warranty: '1 Year Sony Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1041,
    isVisible: true
  },
  {
    id: 'prod-audio-22',
    productId: 'prod-audio-22',
    name: 'Apple AirPods (3rd Generation with Lightning Case)',
    slug: 'apple-airpods-3rd-gen-white',
    brand: 'Apple',
    category: 'earbuds-headphones',
    categoryName: 'Earbuds & Headphones',
    subcategory: 'Wireless Earbuds',
    regularPrice: 21500,
    discountPrice: 21500,
    price: 21500,
    salePrice: 21500,
    discountPercentage: 0,
    rating: 4.8,
    reviewCount: 31,
    stockStatus: 'In Stock',
    stockCount: 18,
    stock: 18,
    availability: 'In Stock',
    images: [
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800&auto=format&fit=crop'
    ],
    shortSpecs: [
      'Personalized Spatial Audio with dynamic head tracking places sound all around you',
      'Force sensor lets you easily control your entertainment and answer or end calls',
      'Sweat and water resistant (IPX4) for both AirPods and the charging case',
      'Up to 6 hours of listening time on a single charge and up to 30 hours total'
    ],
    specifications: {
      'Design': [
        { label: 'Sensor', value: 'Force Sensor & Skin-detect Sensor' },
        { label: 'Battery Life', value: 'Up to 30 Hours with Case' }
      ]
    },
    warranty: '1 Year Apple Official Warranty',
    emiAvailable: true,
    emiStartingBDT: 1791,
    isVisible: true
  }
];

async function seed() {
  console.log('Seeding 11 Categories and 22 Earbuds & Headphones products...');

  // 1. Update local categories.json
  const categoriesFile = path.join(DATA_DIR, 'categories.json');
  fs.writeFileSync(categoriesFile, JSON.stringify(CATEGORIES_11, null, 2), 'utf8');
  console.log('Updated server/data/categories.json with 11 categories.');

  // 2. Update local products.json
  const productsFile = path.join(DATA_DIR, 'products.json');
  let currentProducts = [];
  if (fs.existsSync(productsFile)) {
    try {
      currentProducts = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    } catch {
      currentProducts = [];
    }
  }

  // Merge without duplicates
  for (const item of EARBUDS_22_PRODUCTS) {
    const idx = currentProducts.findIndex(p => (p.productId || p.id) === item.id);
    if (idx >= 0) {
      currentProducts[idx] = { ...currentProducts[idx], ...item };
    } else {
      currentProducts.push(item);
    }
  }

  fs.writeFileSync(productsFile, JSON.stringify(currentProducts, null, 2), 'utf8');
  console.log(`Updated server/data/products.json (Total products: ${currentProducts.length}).`);

  // 3. Connect to MongoDB and update collections
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB Atlas.');
    const db = client.db('my_computer');

    // Update Category collection
    const catColl = db.collection('categories');
    for (const cat of CATEGORIES_11) {
      await catColl.updateOne(
        { id: cat.id },
        { $set: cat },
        { upsert: true }
      );
    }
    console.log('Synchronized 11 categories in MongoDB.');

    // Update Product collection
    const prodColl = db.collection('products');
    for (const prod of EARBUDS_22_PRODUCTS) {
      await prodColl.updateOne(
        { productId: prod.id },
        { $set: prod },
        { upsert: true }
      );
    }
    console.log(`Synchronized 22 Earbuds & Headphones in MongoDB.`);

    await client.close();
  } catch (err) {
    console.warn('MongoDB sync warning:', err.message);
  }

  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
