/**
 * Apex Sports — Core Storage & Configuration Manager
 * Handles default sports catalog, live store settings, and LocalStorage persistence.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'apex_sports_products',
  SETTINGS: 'apex_sports_settings',
  CART: 'apex_sports_cart',
  AUTH: 'apex_sports_admin_auth'
};

// Default Store Configuration
const DEFAULT_SETTINGS = {
  storeName: "Apex Sports Hub",
  tagline: "Pro Equipment, Athletic Gear & Fitness Accessories",
  phone: "+91 98765 43210",
  whatsappNumber: "919876543210", // No plus sign for wa.me URL
  email: "support@apexsports.in",
  address: "Stadium Main Road, Opp. Central Sports Complex, Metro Pillar 142",
  city: "Mumbai, Maharashtra - 400050",
  timings: "09:30 AM – 09:30 PM (All 7 Days Open)",
  currency: "₹",
  freeShippingAbove: 1499,
  adminUsername: "admin",
  adminPin: "sports123",
  announcementText: "🔥 BIG MATCH SEASON SALE: Flat 20% to 40% OFF on Cricket, Football & Gym Gear! Free Store Pickup Available!"
};

// Default Rich Sports Gear Catalog with High-Res Photos & Specs
const DEFAULT_PRODUCTS = [
  {
    id: "sp-cricket-01",
    name: "SS Vintage Finisher English Willow Cricket Bat",
    category: "Cricket",
    sport: "Cricket",
    price: 6499,
    originalPrice: 8999,
    badge: "PRO CHOICE",
    stock: "In Stock",
    sku: "CRK-BAT-01",
    description: "Handcrafted Grade 1 air-dried English Willow with massive 38-40mm edges and pronounced bow for effortless power hitting. Comes with multi-piece imported cane handle for supreme shock absorption.",
    highlights: ["Grade 1 English Willow", "Weight: 1160 - 1200g", "Huge 40mm Edges", "Semi-Oval Cane Handle", "Free Padded Cover"],
    sizes: ["Full Size (SH)", "Size 6", "Size 5"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
        caption: "Full Profile & Clean Grain Structure"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1000&q=80",
        caption: "Toe Guard & Edge Thickness"
      }
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: "sp-football-02",
    name: "Apex Striker FIFA Match Pro Football (Size 5)",
    category: "Football",
    sport: "Football",
    price: 1899,
    originalPrice: 2799,
    badge: "HOT SELLER",
    stock: "In Stock",
    sku: "FTB-BAL-02",
    description: "Thermobonded seamless surface technology for predictable trajectory, better ball feel and ultra-low water uptake. Reinforced butyl bladder for supreme air retention during intense turf matches.",
    highlights: ["FIFA Quality Pro Spec", "Thermobonded Seamless Panels", "Textured PU Outer Coating", "Butyl Bladder", "Standard Size 5"],
    sizes: ["Size 5 (Official)", "Size 4 (Youth)"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1000&q=80",
        caption: "Apex Match Pro Football"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1000&q=80",
        caption: "Texture Grip & Panel Seam"
      }
    ],
    featured: true,
    rating: 4.8,
    reviewsCount: 64
  },
  {
    id: "sp-badminton-03",
    name: "Yonex Voltric Z-Force II Graphite Badminton Racquet",
    category: "Badminton",
    sport: "Badminton",
    price: 3299,
    originalPrice: 4599,
    badge: "BEST VALUE",
    stock: "In Stock",
    sku: "BDM-RCQ-03",
    description: "Tri-Voltage system combining heavy smashes with speedy racquet handling. High modulus graphite with Tungsten infused shaft for maximum smash power and pinpoint shuttle control.",
    highlights: ["Weight: 4U (83g)", "Grip: G4", "String Tension: Up to 28 lbs", "Tri-Voltage Head Heavy Balance", "Includes Full Thermal Bag"],
    sizes: ["4U - G4 (Strung)", "3U - G4 (Strung)"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80",
        caption: "Graphite Frame & String Bed"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=1000&q=80",
        caption: "Tournament Match Spec"
      }
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 52
  },
  {
    id: "sp-gym-04",
    name: "Pro Rubber Hex Dumbbell Pair (10kg Each)",
    category: "Gym & Fitness",
    sport: "Gym & Fitness",
    price: 3499,
    originalPrice: 4999,
    badge: "HEAVY DUTY",
    stock: "In Stock",
    sku: "GYM-DBL-04",
    description: "Commercial-grade solid cast iron core encased in heavy virgin rubber to reduce noise and floor impact. Ergonomic knurled chrome-plated steel handles prevent slippage during intense lifts.",
    highlights: ["2 x 10kg Hex Dumbbells (20kg total)", "Anti-Roll Hexagonal Design", "Heavy Knurled Steel Grip", "Floor-Safe Virgin Rubber", "Commercial Grade"],
    sizes: ["Pair (10kg x 2)", "Pair (5kg x 2)", "Pair (15kg x 2)"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?auto=format&fit=crop&w=1000&q=80",
        caption: "Hexagon Rubber Dumbbell Pair"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80",
        caption: "Ergonomic Knurled Grip Handle"
      }
    ],
    featured: true,
    rating: 4.7,
    reviewsCount: 41
  },
  {
    id: "sp-shoes-05",
    name: "Velocity Turbo-Zoom Cushion Athletic Running Shoes",
    category: "Footwear",
    sport: "Running & Athletics",
    price: 2999,
    originalPrice: 4299,
    badge: "NEW DROP",
    stock: "In Stock",
    sku: "SH-RN-05",
    description: "Breathable engineered mesh upper paired with high-rebound Nitrogen-infused EVA midsole. Engineered for sprint training, marathon prep, and everyday high-mileage workouts.",
    highlights: ["Nitrogen Foam Rebound Sole", "Anti-Skid Carbon Rubber Tread", "Seamless Engineered Mesh", "Ultralight: 235g per shoe", "Reflective Night Strips"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
        caption: "Velocity Turbo-Zoom Athletic Shoes"
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80",
        caption: "Sole Cushion & Outsole Pattern"
      }
    ],
    featured: true,
    rating: 4.8,
    reviewsCount: 79
  },
  {
    id: "sp-cricket-06",
    name: "SG Pro Test Leather Cricket Ball (Box of 4 Balls)",
    category: "Cricket",
    sport: "Cricket",
    price: 2199,
    originalPrice: 2899,
    badge: "CLUB SPECIAL",
    stock: "In Stock",
    sku: "CRK-BAL-06",
    description: "Four-piece top alum-tanned steer hide leather cricket balls, hand-stitched with 80+ stitches. Wax finished for weather resistance and maximum seam prominence for swinging conditions.",
    highlights: ["Pack of 4 Red Leather Balls", "Hand-Stitched Portuguese Cork Core", "80+ Seam Stitches", "Tested for 40-50 Overs", "MCC Compliant"],
    sizes: ["Standard Mens (156g) - 4 Pack", "White Turf Ball - 4 Pack"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1000&q=80",
        caption: "SG Pro Test Leather Cricket Balls"
      }
    ],
    featured: false,
    rating: 4.8,
    reviewsCount: 29
  },
  {
    id: "sp-apparel-07",
    name: "AeroDry Pro Performance Athlete Compression T-Shirt",
    category: "Sportswear",
    sport: "Fitness & Training",
    price: 799,
    originalPrice: 1299,
    badge: "POPULAR",
    stock: "In Stock",
    sku: "APP-DRY-07",
    description: "4-way stretch moisture-wicking fabric that keeps core muscle groups engaged and warm while accelerating sweat evaporation. Anti-odor silver thread tech.",
    highlights: ["88% Poly, 12% Spandex", "4-Way Ergonomic Compression", "Flat-Lock Anti-Chafe Seams", "Quick Dry Technology", "UPF 40+ Sun Protection"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=1000&q=80",
        caption: "AeroDry Performance Compression"
      }
    ],
    featured: false,
    rating: 4.7,
    reviewsCount: 33
  },
  {
    id: "sp-gym-08",
    name: "Heavy-Duty Multi-Angle Adjustable Workout Bench",
    category: "Gym & Fitness",
    sport: "Gym & Fitness",
    price: 6999,
    originalPrice: 9999,
    badge: "COMMERCIAL",
    stock: "In Stock",
    sku: "GYM-BNC-08",
    description: "Heavy 2x2 gauge commercial steel frame with 7 back incline/decline positions and 3 seat positions. High density 2.5-inch sweatproof leather padding supporting up to 350kg load.",
    highlights: ["7 Incline/Decline Angles (Flat, Incline, 90° Military)", "350kg Max Load Rating", "High Density Tear-Proof Leather", "Rear Transport Wheels", "Folds for Easy Storage"],
    sizes: ["Standard Incline/Decline"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80",
        caption: "Adjustable Incline Bench Profile"
      }
    ],
    featured: true,
    rating: 4.9,
    reviewsCount: 19
  },
  {
    id: "sp-access-09",
    name: "ThermoSteel 1000ml Sports Water Bottle & Sipper",
    category: "Accessories",
    sport: "All Sports",
    price: 649,
    originalPrice: 999,
    badge: "ESSENTIAL",
    stock: "In Stock",
    sku: "ACC-BTL-09",
    description: "Double-walled vacuum insulated food-grade 304 stainless steel bottle. Keeps water chilled ice-cold for 24 hours or hot for 12 hours. 100% leak-proof flip lid with carry loop.",
    highlights: ["1000ml (1 Litre) Capacity", "Cold for 24h, Hot for 12h", "BPA-Free Food Grade 304 Steel", "One-Click Quick Flip Cap", "Scratch-Proof Matte Coat"],
    sizes: ["1000ml Stealth Black", "1000ml Military Green", "750ml Cyan"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80",
        caption: "Insulated 1L Sports Bottle"
      }
    ],
    featured: false,
    rating: 4.8,
    reviewsCount: 88
  },
  {
    id: "sp-access-10",
    name: "Apex 5-Level Heavy Resistance Booty & Power Loop Bands",
    category: "Gym & Fitness",
    sport: "Gym & Fitness",
    price: 899,
    originalPrice: 1499,
    badge: "5-PACK",
    stock: "In Stock",
    sku: "ACC-RST-10",
    description: "100% natural Malaysian latex resistance loop bands set of 5 resistance levels (X-Light, Light, Medium, Heavy, X-Heavy). Ideal for rehabilitation, warm-ups, pull-up assistance and glute activation.",
    highlights: ["Set of 5 Natural Latex Bands", "Color Coded Resistance Levels (5 lbs to 40 lbs)", "Includes Breathable Carry Pouch", "Full Exercise Guide Included", "Skin-Safe Non-Tear Material"],
    sizes: ["Complete Set of 5 Bands"],
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=1000&q=80",
        caption: "5-Level Resistance Power Bands"
      }
    ],
    featured: false,
    rating: 4.9,
    reviewsCount: 45
  }
];

// Helper Functions for Storage
const StorageManager = {
  // Load Settings
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn("Error reading settings from localStorage:", e);
    }
    return { ...DEFAULT_SETTINGS };
  },

  // Save Settings
  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error("Error saving settings:", e);
      return false;
    }
  },

  // Load Products (Loads custom added items or defaults)
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading products:", e);
    }
    // Initialize default if empty
    this.saveProducts(DEFAULT_PRODUCTS);
    return [...DEFAULT_PRODUCTS];
  },

  // Save Products
  saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return true;
    } catch (e) {
      console.error("Error saving products:", e);
      return false;
    }
  },

  // Add new product (Unlimited listings!)
  addProduct(newProduct) {
    const products = this.getProducts();
    const product = {
      id: newProduct.id || 'sp-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      name: newProduct.name || 'Untitled Gear',
      category: newProduct.category || 'General Sports',
      sport: newProduct.sport || newProduct.category || 'Multi-Sport',
      price: Number(newProduct.price) || 0,
      originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price) || 0,
      badge: newProduct.badge || 'NEW',
      stock: newProduct.stock || 'In Stock',
      sku: newProduct.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      description: newProduct.description || '',
      highlights: Array.isArray(newProduct.highlights) ? newProduct.highlights : [],
      sizes: Array.isArray(newProduct.sizes) && newProduct.sizes.length > 0 ? newProduct.sizes : ['Standard Size'],
      media: Array.isArray(newProduct.media) && newProduct.media.length > 0 ? newProduct.media : [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80',
          caption: 'Product Photo'
        }
      ],
      featured: Boolean(newProduct.featured),
      rating: newProduct.rating || 5.0,
      reviewsCount: newProduct.reviewsCount || 1,
      createdAt: new Date().toISOString()
    };
    products.unshift(product);
    this.saveProducts(products);
    return product;
  },

  // Update existing product
  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  // Quick Price Update (Change price anytime)
  updatePrice(id, newPrice, newOriginalPrice) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index].price = Number(newPrice);
      if (newOriginalPrice !== undefined) {
        products[index].originalPrice = Number(newOriginalPrice);
      }
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  // Delete product
  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
    return true;
  },

  // Reset to default sample catalog
  resetDefaults() {
    this.saveProducts(DEFAULT_PRODUCTS);
    this.saveSettings(DEFAULT_SETTINGS);
    return true;
  },

  // Export data as JSON
  exportData() {
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      products: this.getProducts()
    };
  },

  // Import JSON data
  importData(jsonData) {
    try {
      if (jsonData.settings) {
        this.saveSettings(jsonData.settings);
      }
      if (Array.isArray(jsonData.products)) {
        this.saveProducts(jsonData.products);
      }
      return true;
    } catch (e) {
      console.error("Import failed:", e);
      return false;
    }
  },

  // Cart operations
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error("Error saving cart:", e);
    }
  },

  clearCart() {
    localStorage.removeItem(STORAGE_KEYS.CART);
  },

  // Admin Auth helper
  checkAuth() {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  setAuth(val) {
    if (val) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }
};
