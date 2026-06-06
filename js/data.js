const products = [
  {
    id: 38,
    name: "iPhone 17",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 9500,
    description: "The iPhone 17 introduces the powerful A19 chip, a stunning 6.2-inch Super Retina XDR OLED display with ProMotion, and a dual-camera system with 48MP Main and 12MP Ultra Wide. All-day battery life and sleek aluminum design.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-2.jpg"
    ],
    specifications: {
      Display: "6.2-inch Super Retina XDR OLED, 120Hz ProMotion",
      Processor: "A19 Chip (3nm)",
      Camera: "48MP Main + 12MP Ultra Wide",
      FrontCamera: "12MP TrueDepth",
      Battery: "Up to 22 hours video playback",
      Storage: "128GB / 256GB / 512GB",
      OS: "iOS 19"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 1000 },
        { label: "512GB", price: 2000 }
      ],
      color: [
        { label: "Black", hex: "#1C1C1E" },
        { label: "White", hex: "#F5F5F0" },
        { label: "Blue", hex: "#4A90D9" },
        { label: "Pink", hex: "#F4A4B8" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 39,
    name: "iPhone 17 Pro",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 13500,
    description: "Pro performance redefined. The iPhone 17 Pro features the A19 Pro chip, a 6.3-inch Super Retina XDR OLED display with ProMotion, and a triple-camera system with 48MP Main, 48MP Ultra Wide, and 12MP Telephoto with 5x optical zoom. Titanium design with USB-C 3.2.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-pro-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-pro-2.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-pro-3.jpg"
    ],
    specifications: {
      Display: "6.3-inch Super Retina XDR OLED, 120Hz ProMotion",
      Processor: "A19 Pro Chip (3nm)",
      Camera: "48MP Main + 48MP Ultra Wide + 12MP Telephoto (5x)",
      FrontCamera: "12MP TrueDepth",
      Battery: "Up to 27 hours video playback",
      Storage: "256GB / 512GB / 1TB",
      OS: "iOS 19"
    },
    options: {
      storage: [
        { label: "256GB", price: 0 },
        { label: "512GB", price: 2000 },
        { label: "1TB", price: 4000 }
      ],
      color: [
        { label: "Natural Titanium", hex: "#8B8B7A" },
        { label: "Desert Titanium", hex: "#C4A882" },
        { label: "White Titanium", hex: "#E8E8E0" },
        { label: "Black Titanium", hex: "#2C2C2E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 40,
    name: "iPhone 17 Pro Max",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 15500,
    description: "The ultimate iPhone. The iPhone 17 Pro Max boasts a massive 6.9-inch Super Retina XDR OLED display with ProMotion, the A19 Pro chip, and a professional-grade camera system with 48MP Main, 48MP Ultra Wide, and 12MP Telephoto with 10x optical zoom. Titanium design with the longest battery life ever in an iPhone.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-pro-max-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-pro-max-2.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-17-pro-max-3.jpg"
    ],
    specifications: {
      Display: "6.9-inch Super Retina XDR OLED, 120Hz ProMotion",
      Processor: "A19 Pro Chip (3nm)",
      Camera: "48MP Main + 48MP Ultra Wide + 12MP Telephoto (10x)",
      FrontCamera: "12MP TrueDepth",
      Battery: "Up to 36 hours video playback",
      Storage: "256GB / 512GB / 1TB",
      OS: "iOS 19"
    },
    options: {
      storage: [
        { label: "256GB", price: 0 },
        { label: "512GB", price: 2000 },
        { label: "1TB", price: 4000 }
      ],
      color: [
        { label: "Natural Titanium", hex: "#8B8B7A" },
        { label: "Desert Titanium", hex: "#C4A882" },
        { label: "White Titanium", hex: "#E8E8E0" },
        { label: "Black Titanium", hex: "#2C2C2E" }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 1,
    name: "iPhone 16 Pro Max",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 14500,
    description: "The most advanced iPhone ever. Featuring the powerful A18 Pro chip, a stunning 6.9-inch Super Retina XDR OLED display with ProMotion technology, and a professional-grade camera system with 48MP Main, 48MP Ultra Wide, and 12MP Telephoto lenses. Titanium design, USB-C, and all-day battery life.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-2.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-3.jpg"
    ],
    specifications: {
      Display: "6.9-inch Super Retina XDR OLED, 120Hz ProMotion",
      Processor: "A18 Pro Chip (3nm)",
      Camera: "48MP Main + 48MP Ultra Wide + 12MP Telephoto (5x)",
      FrontCamera: "12MP TrueDepth",
      Battery: "Up to 33 hours video playback",
      Storage: "256GB / 512GB / 1TB",
      OS: "iOS 18"
    },
    options: {
      storage: [
        { label: "256GB", price: 0 },
        { label: "512GB", price: 2000 },
        { label: "1TB", price: 4000 }
      ],
      color: [
        { label: "Natural Titanium", hex: "#8B8B7A" },
        { label: "Blue Titanium", hex: "#4A6FA5" },
        { label: "White Titanium", hex: "#E8E8E0" },
        { label: "Black Titanium", hex: "#2C2C2E" }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: "iPhone 16 Pro",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 13000,
    description: "The iPhone 16 Pro packs the same A18 Pro chip and pro camera system into a more compact 6.3-inch form factor. Perfect for those who want pro features without the Pro Max size.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-2.jpg"
    ],
    specifications: {
      Display: "6.3-inch Super Retina XDR OLED, 120Hz ProMotion",
      Processor: "A18 Pro Chip (3nm)",
      Camera: "48MP Main + 48MP Ultra Wide + 12MP Telephoto (3x)",
      FrontCamera: "12MP TrueDepth",
      Battery: "Up to 27 hours video playback",
      Storage: "128GB / 256GB / 512GB / 1TB",
      OS: "iOS 18"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 1500 },
        { label: "512GB", price: 3500 },
        { label: "1TB", price: 5500 }
      ],
      color: [
        { label: "Natural Titanium", hex: "#8B8B7A" },
        { label: "Blue Titanium", hex: "#4A6FA5" },
        { label: "White Titanium", hex: "#E8E8E0" },
        { label: "Black Titanium", hex: "#2C2C2E" }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 3,
    name: "iPhone 16",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 8500,
    description: "The iPhone 16 delivers incredible performance with the A18 chip, a beautiful 6.1-inch display, and a powerful dual-camera system. Available in five vibrant colors.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-2.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR OLED",
      Processor: "A18 Chip (3nm)",
      Camera: "48MP Main + 12MP Ultra Wide",
      Battery: "Up to 22 hours video playback",
      Storage: "128GB / 256GB / 512GB",
      OS: "iOS 18"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 1000 },
        { label: "512GB", price: 3000 }
      ],
      color: [
        { label: "Black", hex: "#1C1C1E" },
        { label: "Blue", hex: "#4A90D9" },
        { label: "Green", hex: "#5E9B8C" },
        { label: "Pink", hex: "#F5A0B8" },
        { label: "White", hex: "#F5F5F0" }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 4,
    name: "iPhone 15 Pro Max",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 9500,
    description: "The iPhone 15 Pro Max features the A17 Pro chip, a 6.7-inch Super Retina XDR display, and an advanced pro camera system with up to 5x optical zoom. Titanium design with USB-C.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-2.jpg"
    ],
    specifications: {
      Display: "6.7-inch Super Retina XDR OLED, 120Hz ProMotion",
      Processor: "A17 Pro Chip (3nm)",
      Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto (5x)",
      Battery: "Up to 29 hours video playback",
      Storage: "256GB / 512GB / 1TB",
      OS: "iOS 17"
    },
    options: {
      storage: [
        { label: "256GB", price: 0 },
        { label: "512GB", price: 2000 },
        { label: "1TB", price: 4000 }
      ],
      color: [
        { label: "Natural Titanium", hex: "#8B8B7A" },
        { label: "Blue Titanium", hex: "#4A6FA5" },
        { label: "White Titanium", hex: "#E8E8E0" },
        { label: "Black Titanium", hex: "#2C2C2E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 5,
    name: "iPhone 15",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 6500,
    description: "The iPhone 15 features the A16 Bionic chip, a 6.1-inch Super Retina XDR display with Dynamic Island, and a 48MP main camera. USB-C and vibrant color options.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-2.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR OLED",
      Processor: "A16 Bionic Chip",
      Camera: "48MP Main + 12MP Ultra Wide",
      Battery: "Up to 20 hours video playback",
      Storage: "128GB / 256GB / 512GB",
      OS: "iOS 17"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 800 },
        { label: "512GB", price: 2500 }
      ],
      color: [
        { label: "Black", hex: "#1C1C1E" },
        { label: "Blue", hex: "#5A8BBF" },
        { label: "Green", hex: "#7BA88E" },
        { label: "Pink", hex: "#F5C0C0" },
        { label: "Yellow", hex: "#F5D76E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 41,
    name: "iPhone 15 Pro",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 8500,
    description: "The iPhone 15 Pro features the A17 Pro chip, a 6.1-inch Super Retina XDR display, and a professional camera system in a lightweight titanium design.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-2.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR OLED, 120Hz ProMotion",
      Processor: "A17 Pro Chip",
      Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto (3x)",
      Battery: "Up to 23 hours video playback",
      Storage: "128GB / 256GB / 512GB / 1TB",
      OS: "iOS 17"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 1200 },
        { label: "512GB", price: 3000 },
        { label: "1TB", price: 5000 }
      ],
      color: [
        { label: "Natural Titanium", hex: "#8B8B7A" },
        { label: "Blue Titanium", hex: "#4A6FA5" },
        { label: "White Titanium", hex: "#E8E8E0" },
        { label: "Black Titanium", hex: "#2C2C2E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 42,
    name: "iPhone 15 Plus",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 7500,
    description: "The iPhone 15 Plus offers the same great features as the iPhone 15 but with a larger 6.7-inch display and even longer battery life.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-plus-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-plus-2.jpg"
    ],
    specifications: {
      Display: "6.7-inch Super Retina XDR OLED",
      Processor: "A16 Bionic Chip",
      Camera: "48MP Main + 12MP Ultra Wide",
      Battery: "Up to 26 hours video playback",
      Storage: "128GB / 256GB / 512GB",
      OS: "iOS 17"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 800 },
        { label: "512GB", price: 2500 }
      ],
      color: [
        { label: "Black", hex: "#1C1C1E" },
        { label: "Blue", hex: "#5A8BBF" },
        { label: "Green", hex: "#7BA88E" },
        { label: "Pink", hex: "#F5C0C0" },
        { label: "Yellow", hex: "#F5D76E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 43,
    name: "iPhone 14 Pro Max",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 8500,
    description: "The iPhone 14 Pro Max features Dynamic Island, the A16 Bionic chip, and the first-ever 48MP camera on an iPhone. Pro performance with a large 6.7-inch Always-On display.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-max-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-max-2.jpg"
    ],
    specifications: {
      Display: "6.7-inch LTPO Super Retina XDR, 120Hz",
      Processor: "A16 Bionic Chip",
      Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      Battery: "Up to 29 hours video playback",
      Storage: "128GB / 256GB / 512GB / 1TB",
      OS: "iOS 16 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 1000 },
        { label: "512GB", price: 2500 },
        { label: "1TB", price: 4500 }
      ],
      color: [
        { label: "Space Black", hex: "#2C2C2E" },
        { label: "Deep Purple", hex: "#4A3F5B" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Gold", hex: "#E5D1B2" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 44,
    name: "iPhone 14 Pro",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 7500,
    description: "Compact pro performance with a 6.1-inch Always-On display, Dynamic Island, and the A16 Bionic chip. Incredible 48MP camera for stunning details.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-2.jpg"
    ],
    specifications: {
      Display: "6.1-inch LTPO Super Retina XDR, 120Hz",
      Processor: "A16 Bionic Chip",
      Camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      Battery: "Up to 23 hours video playback",
      Storage: "128GB / 256GB / 512GB / 1TB",
      OS: "iOS 16 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 1000 },
        { label: "512GB", price: 2500 },
        { label: "1TB", price: 4500 }
      ],
      color: [
        { label: "Space Black", hex: "#2C2C2E" },
        { label: "Deep Purple", hex: "#4A3F5B" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Gold", hex: "#E5D1B2" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 45,
    name: "iPhone 14 Plus",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 6500,
    description: "The iPhone 14 Plus features a large 6.7-inch display and the best battery life ever on an iPhone 14. Powerful A15 Bionic chip and improved camera system.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-plus-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-plus-2.jpg"
    ],
    specifications: {
      Display: "6.7-inch Super Retina XDR OLED",
      Processor: "A15 Bionic Chip",
      Camera: "12MP Dual-Camera System",
      Battery: "Up to 26 hours video playback",
      Storage: "128GB / 256GB / 512GB",
      OS: "iOS 16 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 800 },
        { label: "512GB", price: 2200 }
      ],
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Purple", hex: "#B39DDB" },
        { label: "Blue", hex: "#4A90D9" },
        { label: "Red", hex: "#DC143C" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 46,
    name: "iPhone 14",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 5500,
    description: "The iPhone 14 features a 6.1-inch display, the A15 Bionic chip, and a dual-camera system that takes stunning photos in any light. Safety features like Crash Detection.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-2.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR OLED",
      Processor: "A15 Bionic Chip",
      Camera: "12MP Dual-Camera System",
      Battery: "Up to 20 hours video playback",
      Storage: "128GB / 256GB / 512GB",
      OS: "iOS 16 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 800 },
        { label: "512GB", price: 2200 }
      ],
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Purple", hex: "#B39DDB" },
        { label: "Blue", hex: "#4A90D9" },
        { label: "Red", hex: "#DC143C" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 47,
    name: "iPhone 13 Pro Max",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 7000,
    description: "The iPhone 13 Pro Max introduced the 120Hz ProMotion display and incredible battery life. Pro camera system with ProRes video support.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-pro-max-01.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-pro-max-02.jpg"
    ],
    specifications: {
      Display: "6.7-inch Super Retina XDR with ProMotion",
      Processor: "A15 Bionic Chip",
      Camera: "Triple 12MP Pro System",
      Battery: "Up to 28 hours video playback",
      OS: "iOS 15 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 800 },
        { label: "512GB", price: 2000 },
        { label: "1TB", price: 4000 }
      ],
      color: [
        { label: "Sierra Blue", hex: "#9BB3D4" },
        { label: "Graphite", hex: "#4A4A4A" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Alpine Green", hex: "#2D4A3E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 48,
    name: "iPhone 13 Pro",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 6000,
    description: "ProMotion display and advanced Pro cameras in a 6.1-inch design. The A15 Bionic chip delivers incredible performance for gaming and multitasking.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-pro-01.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-pro-02.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR with ProMotion",
      Processor: "A15 Bionic Chip",
      Camera: "Triple 12MP Pro System",
      Battery: "Up to 22 hours video playback",
      OS: "iOS 15 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 800 },
        { label: "512GB", price: 2000 },
        { label: "1TB", price: 4000 }
      ],
      color: [
        { label: "Sierra Blue", hex: "#9BB3D4" },
        { label: "Graphite", hex: "#4A4A4A" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Alpine Green", hex: "#2D4A3E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 49,
    name: "iPhone 13",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 4200,
    description: "The iPhone 13 features the A15 Bionic chip, an advanced dual-camera system with Sensor-shift OIS, and a brighter Super Retina XDR display.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-01.jpg",
      "https://i.pinimg.com/736x/6b/36/c1/6b36c1dbf64607491d0d24c5aa3349ad.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR OLED",
      Processor: "A15 Bionic Chip",
      Camera: "Dual 12MP System",
      Battery: "Up to 19 hours video playback",
      OS: "iOS 15 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 700 },
        { label: "512GB", price: 1800 }
      ],
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Blue", hex: "#4A90D9" },
        { label: "Pink", hex: "#F5A0B8" },
        { label: "Red", hex: "#DC143C" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 50,
    name: "iPhone 13 Mini",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 3800,
    description: "The last of the minis. All the power of the iPhone 13 in a compact, pocket-friendly 5.4-inch design. Perfect for one-handed use.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-mini-01.jpg",
      "https://i.pinimg.com/1200x/42/da/e9/42dae9de773baac2b5599881f8b38b44.jpg"
    ],
    specifications: {
      Display: "5.4-inch Super Retina XDR OLED",
      Processor: "A15 Bionic Chip",
      Camera: "Dual 12MP System",
      Battery: "Up to 17 hours video playback",
      OS: "iOS 15 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 700 },
        { label: "512GB", price: 1800 }
      ],
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Blue", hex: "#4A90D9" },
        { label: "Pink", hex: "#F5A0B8" },
        { label: "Green", hex: "#2D4A3E" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 51,
    name: "iPhone 12 Pro Max",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 5500,
    description: "The first iPhone with MagSafe and Ceramic Shield. The 12 Pro Max offers a massive 6.7-inch display and advanced photography features like LiDAR and ProRAW.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-12-pro-max-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-12-pro-max-2.jpg"
    ],
    specifications: {
      Display: "6.7-inch Super Retina XDR OLED",
      Processor: "A14 Bionic Chip",
      Camera: "Triple 12MP System + LiDAR",
      Battery: "Up to 20 hours video playback",
      OS: "iOS 14 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 600 },
        { label: "512GB", price: 1500 }
      ],
      color: [
        { label: "Pacific Blue", hex: "#2C5282" },
        { label: "Graphite", hex: "#4A4A4A" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Gold", hex: "#E5D1B2" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 52,
    name: "iPhone 12 Pro",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 4800,
    description: "Pro camera features and LiDAR in a 6.1-inch design. Stainless steel frame and Ceramic Shield front for extreme durability.",
    images: [
      "https://i.pinimg.com/736x/8c/1b/12/8c1b1208fca4933dad3f3916cae2caee.jpg",
      "https://i.pinimg.com/736x/ba/2f/11/ba2f1168ed2a716e79412511f40be82c.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR OLED",
      Processor: "A14 Bionic Chip",
      Camera: "Triple 12MP System + LiDAR",
      Battery: "Up to 17 hours video playback",
      OS: "iOS 14 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "128GB", price: 0 },
        { label: "256GB", price: 600 },
        { label: "512GB", price: 1500 }
      ],
      color: [
        { label: "Pacific Blue", hex: "#2C5282" },
        { label: "Graphite", hex: "#4A4A4A" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Gold", hex: "#E5D1B2" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 53,
    name: "iPhone 12",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 3500,
    description: "The iPhone 12 features 5G, the A14 Bionic chip, and a brilliant OLED display. Modern flat-edge design and MagSafe compatibility.",
    images: [
      "https://i.pinimg.com/1200x/27/7b/08/277b0863512849dd0490efbe297b43d0.jpg",
      "https://i.pinimg.com/736x/24/7c/04/247c04a2e6de6961c5183fc27aa7d777.jpg"
    ],
    specifications: {
      Display: "6.1-inch Super Retina XDR OLED",
      Processor: "A14 Bionic Chip",
      Camera: "Dual 12MP System",
      Battery: "Up to 17 hours video playback",
      OS: "iOS 14 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "64GB", price: 0 },
        { label: "128GB", price: 400 },
        { label: "256GB", price: 1000 }
      ],
      color: [
        { label: "Black", hex: "#1C1C1E" },
        { label: "White", hex: "#F5F5F0" },
        { label: "Blue", hex: "#2C5282" },
        { label: "Green", hex: "#7BA88E" },
        { label: "Purple", hex: "#B39DDB" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 54,
    name: "iPhone 12 Mini",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 3000,
    description: "The first mini. All the features of the iPhone 12 in an incredibly small and light design. Still very capable today.",
    images: [
      "https://i.pinimg.com/736x/eb/31/61/eb3161bbe3c7ee52fff1b57512f35400.jpg",
      "https://i.pinimg.com/736x/d1/93/0e/d1930eebb8d282d29ec6996149204ac0.jpg"
    ],
    specifications: {
      Display: "5.4-inch Super Retina XDR OLED",
      Processor: "A14 Bionic Chip",
      Camera: "Dual 12MP System",
      Battery: "Up to 15 hours video playback",
      OS: "iOS 14 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "64GB", price: 0 },
        { label: "128GB", price: 400 },
        { label: "256GB", price: 1000 }
      ],
      color: [
        { label: "Black", hex: "#1C1C1E" },
        { label: "White", hex: "#F5F5F0" },
        { label: "Blue", hex: "#2C5282" },
        { label: "Green", hex: "#7BA88E" },
        { label: "Purple", hex: "#B39DDB" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 55,
    name: "iPhone 11 Pro Max",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 4200,
    description: "The first 'Pro' iPhone. Featuring a triple-camera system and a gorgeous matte glass finish. Still a powerhouse for photography.",
    images: [
      "https://i.pinimg.com/736x/d8/8a/73/d88a73559ac595122239ac8d69bae7dd.jpg",
      "https://i.pinimg.com/736x/0c/fc/7c/0cfc7c93ed029ae071bfbed0869c832a.jpg"
    ],
    specifications: {
      Display: "6.5-inch Super Retina XDR OLED",
      Processor: "A13 Bionic Chip",
      Camera: "Triple 12MP System",
      Battery: "Up to 20 hours video playback",
      OS: "iOS 13 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "64GB", price: 0 },
        { label: "256GB", price: 600 },
        { label: "512GB", price: 1200 }
      ],
      color: [
        { label: "Midnight Green", hex: "#2D4A3E" },
        { label: "Space Gray", hex: "#5A5A5A" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Gold", hex: "#E5D1B2" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 56,
    name: "iPhone 11 Pro",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 3800,
    description: "Triple cameras and a stunning 5.8-inch display. The Pro performance in a more compact size.",
    images: [
      "https://i.pinimg.com/736x/95/fd/86/95fd8611e66409279650e04974d0269f.jpg",
      "https://i.pinimg.com/1200x/f6/4e/cf/f64ecf654cafa3f9f1d8ee31e234656f.jpg"
    ],
    specifications: {
      Display: "5.8-inch Super Retina XDR OLED",
      Processor: "A13 Bionic Chip",
      Camera: "Triple 12MP System",
      Battery: "Up to 18 hours video playback",
      OS: "iOS 13 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "64GB", price: 0 },
        { label: "256GB", price: 600 },
        { label: "512GB", price: 1200 }
      ],
      color: [
        { label: "Midnight Green", hex: "#2D4A3E" },
        { label: "Space Gray", hex: "#5A5A5A" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Gold", hex: "#E5D1B2" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 26,
    name: "iPhone 11",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 2800,
    description: "The iPhone 11 features a 6.1-inch Liquid Retina HD display and the A13 Bionic chip. Incredible value with a dual-camera system.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-11-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-11-2.jpg"
    ],
    specifications: {
      Display: "6.1-inch Liquid Retina HD LCD",
      Processor: "A13 Bionic Chip",
      Camera: "Dual 12MP System",
      Battery: "Up to 17 hours video playback",
      OS: "iOS 13 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "64GB", price: 0 },
        { label: "128GB", price: 400 },
        { label: "256GB", price: 800 }
      ],
      color: [
        { label: "Black", hex: "#1C1C1E" },
        { label: "White", hex: "#F5F5F0" },
        { label: "Purple", hex: "#B39DDB" },
        { label: "Green", hex: "#7BA88E" },
        { label: "Yellow", hex: "#F5D76E" },
        { label: "Red", hex: "#DC143C" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 57,
    name: "iPhone SE (3rd generation)",
    category: "Phones",
    brand: "Apple",
    family: "iPhone",
    basePrice: 2500,
    description: "Classic design meets modern performance. The A15 Bionic chip in a compact 4.7-inch design with a Home button. The most affordable iPhone.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-se-2022-1.jpg",
      "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-se-2022-2.jpg"
    ],
    specifications: {
      Display: "4.7-inch Retina HD LCD",
      Processor: "A15 Bionic Chip",
      Camera: "12MP Main Camera",
      Battery: "Up to 15 hours video playback",
      OS: "iOS 15 (Upgradable to iOS 18)"
    },
    options: {
      storage: [
        { label: "64GB", price: 0 },
        { label: "128GB", price: 400 },
        { label: "256GB", price: 1000 }
      ],
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Red", hex: "#DC143C" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 9,
    name: "MacBook Pro 16-inch (M3 Max)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 35000,
    description: "The ultimate powerhouse for professionals. M3 Max chip with 16-core CPU and 40-core GPU. Stunning 16.2-inch Liquid Retina XDR display.",
    images: [
      "https://i.pinimg.com/1200x/cc/38/48/cc3848a2541c91ecb971f757d2db10ba.jpg",
      "https://i.pinimg.com/736x/d4/33/24/d433244a8fa534d27b294723edfd8103.jpg"
    ],
    specifications: {
      Display: "16.2-inch Liquid Retina XDR",
      Processor: "Apple M3 Max Chip",
      RAM: "36GB / 48GB / 64GB / 128GB",
      Storage: "1TB / 2TB / 4TB / 8TB SSD",
      Battery: "Up to 22 hours"
    },
    options: {
      ram: [
        { label: "36GB Unified Memory", price: 0 },
        { label: "48GB Unified Memory", price: 3000 },
        { label: "64GB Unified Memory", price: 6000 },
        { label: "128GB Unified Memory", price: 15000 }
      ],
      storage: [
        { label: "1TB SSD", price: 0 },
        { label: "2TB SSD", price: 4000 },
        { label: "4TB SSD", price: 10000 },
        { label: "8TB SSD", price: 22000 }
      ],
      color: [
        { label: "Space Black", hex: "#2C2C2E" },
        { label: "Silver", hex: "#E8E8E8" }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 58,
    name: "MacBook Pro 14-inch (M3 Max)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 31000,
    description: "Extreme power in a portable 14-inch form factor. M3 Max chip with up to 128GB unified memory. Liquid Retina XDR display with 120Hz ProMotion.",
    images: [
      "https://i.pinimg.com/736x/27/28/cc/2728cc495dd827774c74b03526c044c9.jpg",
      "https://i.pinimg.com/736x/a6/d3/41/a6d3419ecad9496342c3847f696d0c7b.jpg"
    ],
    specifications: {
      Display: "14.2-inch Liquid Retina XDR",
      Processor: "Apple M3 Max Chip",
      RAM: "36GB / 48GB / 64GB / 128GB",
      Storage: "1TB / 2TB / 4TB SSD"
    },
    options: {
      ram: [
        { label: "36GB Unified Memory", price: 0 },
        { label: "48GB Unified Memory", price: 3000 },
        { label: "128GB Unified Memory", price: 15000 }
      ],
      color: [
        { label: "Space Black", hex: "#2C2C2E" },
        { label: "Silver", hex: "#E8E8E8" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 32,
    name: "MacBook Pro 14-inch (M3 Pro)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 24500,
    description: "Great balance of power and portability. M3 Pro chip with 11 or 12-core CPU and up to 18-core GPU. Perfect for creative pros on the go.",
    images: [
      "https://i.pinimg.com/736x/20/97/aa/2097aad744c834823dc24666b428b561.jpg",
      "https://i.pinimg.com/736x/5a/9b/7d/5a9b7d744a71622554a44eb3c786534d.jpg"
    ],
    specifications: {
      Display: "14.2-inch Liquid Retina XDR",
      Processor: "Apple M3 Pro Chip",
      RAM: "18GB / 36GB",
      Storage: "512GB / 1TB SSD"
    },
    options: {
      ram: [
        { label: "18GB Unified Memory", price: 0 },
        { label: "36GB Unified Memory", price: 4000 }
      ],
      color: [
        { label: "Space Black", hex: "#2C2C2E" },
        { label: "Silver", hex: "#E8E8E8" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 10,
    name: "MacBook Air 15-inch (M3)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 18500,
    description: "Supercharged by the M3 chip. Strikingly thin and fast. Immersive 15.3-inch Liquid Retina display and up to 18 hours of battery life.",
    images: [
      "https://i.pinimg.com/1200x/3f/9c/76/3f9c7602a09d2d29370e369491465a1e.jpg",
      "https://i.pinimg.com/1200x/24/bf/39/24bf390d8808fa6869e40cd60c91c40d.jpg"
    ],
    specifications: {
      Display: "15.3-inch Liquid Retina",
      Processor: "Apple M3 Chip",
      RAM: "8GB / 16GB / 24GB",
      Storage: "256GB / 512GB / 1TB / 2TB SSD"
    },
    options: {
      ram: [
        { label: "8GB Unified Memory", price: 0 },
        { label: "16GB Unified Memory", price: 2000 },
        { label: "24GB Unified Memory", price: 4000 }
      ],
      storage: [
        { label: "256GB SSD", price: 0 },
        { label: "512GB SSD", price: 2000 },
        { label: "1TB SSD", price: 4000 }
      ],
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Space Gray", hex: "#5A5A5A" },
        { label: "Silver", hex: "#E8E8E8" }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 59,
    name: "MacBook Air 13-inch (M3)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 15500,
    description: "The world's most popular laptop, now even better with the M3 chip. Portable 13.6-inch Liquid Retina display and all-day battery.",
    images: [
      "https://i.pinimg.com/736x/48/eb/dc/48ebdc38ed1183d478473252447c0b85.jpg",
      "https://i.pinimg.com/736x/ec/28/92/ec2892b6d03bf0ad7d9812b4a11fabf3.jpg"
    ],
    specifications: {
      Display: "13.6-inch Liquid Retina",
      Processor: "Apple M3 Chip",
      RAM: "8GB / 16GB / 24GB",
      Storage: "256GB / 512GB / 1TB SSD"
    },
    options: {
      ram: [
        { label: "8GB Unified Memory", price: 0 },
        { label: "16GB Unified Memory", price: 2000 },
        { label: "24GB Unified Memory", price: 4000 }
      ],
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Space Gray", hex: "#5A5A5A" },
        { label: "Silver", hex: "#E8E8E8" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 60,
    name: "MacBook Pro 16-inch (M2 Max)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 28000,
    description: "Extraordinary power with the M2 Max chip. 16.2-inch Liquid Retina XDR display. Up to 96GB unified memory support.",
    images: [
      "https://i.pinimg.com/1200x/86/61/27/86612715b1f6f07fad13f4e79d58fcb8.jpg",
      "https://i.pinimg.com/736x/3c/03/a5/3c03a5e367e2335f058355443220e9c7.jpg"
    ],
    specifications: {
      Display: "16.2-inch Liquid Retina XDR",
      Processor: "Apple M2 Max Chip",
      RAM: "32GB / 64GB / 96GB",
      Battery: "Up to 22 hours"
    },
    options: {
      ram: [
        { label: "32GB Unified Memory", price: 0 },
        { label: "64GB Unified Memory", price: 5000 },
        { label: "96GB Unified Memory", price: 9000 }
      ],
      color: [
        { label: "Space Gray", hex: "#5A5A5A" },
        { label: "Silver", hex: "#E8E8E8" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 61,
    name: "MacBook Pro 14-inch (M2 Pro)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 19500,
    description: "Pro performance on the go with the M2 Pro chip. 14.2-inch Liquid Retina XDR display with ProMotion. HDMI 2.1 and SDXC slot.",
    images: [
      "https://i.pinimg.com/736x/8b/7d/87/8b7d87a1bd552a9cebcaffd81348f125.jpg",
      "https://i.pinimg.com/736x/23/38/ba/2338baf6592cbd4a069d33a922bcc727.jpg"
    ],
    specifications: {
      Display: "14.2-inch Liquid Retina XDR",
      Processor: "Apple M2 Pro Chip",
      RAM: "16GB / 32GB",
      Storage: "512GB / 1TB SSD"
    },
    options: {
      ram: [
        { label: "16GB Unified Memory", price: 0 },
        { label: "32GB Unified Memory", price: 3500 }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 63,
    name: "MacBook Air 13-inch (M2)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 13500,
    description: "Redesigned with the M2 chip. Thinner, lighter, and faster. 13.6-inch Liquid Retina display with 500 nits brightness.",
    images: [
      "https://i.pinimg.com/736x/f8/32/d2/f832d287219428f18cac8e7c4e954d9c.jpg",
      "https://i.pinimg.com/736x/c5/8b/9d/c58b9d2e3abb9a222b39fca4424458cf.jpg"
    ],
    specifications: {
      Display: "13.6-inch Liquid Retina",
      Processor: "Apple M2 Chip",
      RAM: "8GB / 16GB / 24GB",
      Storage: "256GB / 512GB SSD"
    },
    options: {
      color: [
        { label: "Midnight", hex: "#1C1C2E" },
        { label: "Starlight", hex: "#E8DCC8" },
        { label: "Space Gray", hex: "#5A5A5A" },
        { label: "Silver", hex: "#E8E8E8" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 65,
    name: "MacBook Pro 14-inch (M1 Pro)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 16500,
    description: "The game-changer. M1 Pro chip with 14.2-inch Liquid Retina XDR display. A huge leap in performance and battery life. Still excellent value.",
    images: [
      "https://i.pinimg.com/736x/22/c5/d8/22c5d81e7414ae616e19740239f759fa.jpg",
      "https://i.pinimg.com/736x/1e/0f/22/1e0f229ebfdb7a9428559da0161a90af.jpg"
    ],
    specifications: {
      Display: "14.2-inch Liquid Retina XDR",
      Processor: "Apple M1 Pro Chip",
      RAM: "16GB / 32GB",
      Battery: "Up to 17 hours"
    },
    options: {},
    inStock: true,
    featured: false
  },
  {
    id: 68,
    name: "MacBook Air 13-inch (M1)",
    category: "Laptops",
    brand: "Apple",
    family: "MacBook",
    basePrice: 10500,
    description: "The laptop that started the M-series revolution. Incredibly thin, fanless design for silent performance. Still the best value MacBook for students.",
    images: [
      "https://i.pinimg.com/736x/02/53/96/0253967e9d9bf56c7b4caa1ce4c755aa.jpg",
      "https://i.pinimg.com/736x/a6/7c/bc/a67cbc30e438628ad8e994374f43a416.jpg"
    ],
    specifications: {
      Display: "13.3-inch Retina Display",
      Processor: "Apple M1 Chip",
      RAM: "8GB / 16GB",
      Battery: "Up to 18 hours"
    },
    options: {
      color: [
        { label: "Space Gray", hex: "#5A5A5A" },
        { label: "Silver", hex: "#E8E8E8" },
        { label: "Gold", hex: "#E5D1B2" }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 6,
    name: "Samsung Galaxy S24 Ultra",
    category: "Phones",
    brand: "Samsung",
    family: "Samsung Galaxy",
    basePrice: 8500,
    description: "The Galaxy S24 Ultra is the ultimate Galaxy experience with a built-in S Pen, Galaxy AI features, a 200MP camera, and a titanium frame.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-0.jpg"
    ],
    specifications: {
      Display: "6.8-inch Dynamic AMOLED 2X, 120Hz",
      Processor: "Snapdragon 8 Gen 3 for Galaxy",
      Camera: "200MP Main + 12MP Ultra Wide + 50MP Telephoto",
      Battery: "5,000mAh",
      OS: "Android 14"
    },
    options: {
      storage: [
        { label: "256GB", price: 0 },
        { label: "512GB", price: 1000 },
        { label: "1TB", price: 2000 }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 7,
    name: "Samsung Galaxy S24",
    category: "Phones",
    brand: "Samsung",
    family: "Samsung Galaxy",
    basePrice: 5500,
    description: "The Galaxy S24 brings Galaxy AI to everyone. Featuring a brilliant 6.2-inch Dynamic AMOLED display and powerful triple camera system.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-5g-sm-s921-1.jpg"
    ],
    specifications: {
      Display: "6.2-inch Dynamic AMOLED 2X, 120Hz",
      Processor: "Exynos 2400 / Snapdragon 8 Gen 3",
      Camera: "50MP Main + 12MP Ultra Wide + 10MP Telephoto",
      Battery: "4,000mAh"
    },
    options: {},
    inStock: true,
    featured: false
  },
  {
    id: 8,
    name: "Google Pixel 8 Pro",
    category: "Phones",
    brand: "Google",
    basePrice: 7500,
    description: "The Google Pixel 8 Pro with Tensor G3 chip delivers advanced AI features and a stunning 6.7-inch LTPO OLED display.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-1.jpg"
    ],
    specifications: {
      Display: "6.7-inch LTPO OLED, 120Hz",
      Processor: "Google Tensor G3",
      Camera: "50MP Main + 48MP Ultra Wide + 48MP Telephoto",
      Battery: "5,050mAh"
    },
    options: {},
    inStock: true,
    featured: false
  },
  {
    id: 11,
    name: "Dell XPS 15 (9530)",
    category: "Laptops",
    brand: "Dell",
    basePrice: 18000,
    description: "The Dell XPS 15 features an stunning 15.6-inch OLED display, Intel Core i7/i9 processors, and NVIDIA GeForce RTX graphics.",
    images: [
      "https://i.pinimg.com/1200x/96/b8/19/96b819a2057454cd507198c2a60557e3.jpg",
      "https://i.pinimg.com/736x/e7/8d/bf/e78dbf87bde245241648fdfbcfa56c6d.jpg"
    ],
    specifications: {
      Display: "15.6-inch 3.5K OLED InfinityEdge",
      Processor: "Intel Core i7/i9 13th Gen",
      Graphics: "NVIDIA GeForce RTX 4060",
      RAM: "16GB / 32GB / 64GB"
    },
    options: {},
    inStock: true,
    featured: false
  },
  {
    id: 12,
    name: "HP Spectre x360 2-in-1",
    category: "Laptops",
    brand: "HP",
    basePrice: 15000,
    description: "Premium 2-in-1 convertible laptop with a gorgeous 2.8K OLED display and Intel Core Ultra processors.",
    images: [
      "https://i.pinimg.com/1200x/21/9a/a3/219aa3c31c54dc50891202f917b342f4.jpg",
      "https://i.pinimg.com/1200x/c2/0a/0f/c20a0f042ddb8e17ec3a6670329c8990.jpg"
    ],
    specifications: {
      Display: "14-inch 2.8K OLED touchscreen",
      Processor: "Intel Core Ultra 7",
      Battery: "Up to 15 hours"
    },
    options: {},
    inStock: true,
    featured: false
  },
  {
    id: 13,
    name: "AirPods Pro (2nd generation)",
    category: "Audio",
    brand: "Apple",
    basePrice: 2500,
    description: "AirPods Pro 2 with H2 chip deliver Adaptive Audio and active noise cancellation up to 2x more effective.",
    images: [
      "https://i.pinimg.com/1200x/f6/7d/61/f67d6143be89ca8fb3f2330d4a865111.jpg", 
      "https://i.pinimg.com/736x/24/0f/99/240f99e55347657ab65c5e7dc8777ae1.jpg"
    ],
    specifications: {
      Chip: "Apple H2",
      Audio: "Adaptive Audio, Active Noise Cancellation",
      Battery: "Up to 6 hours listening (ANC on)"
    },
    options: {},
    inStock: true,
    featured: true
  },
  {
    id: 14,
    name: "Apple Watch Series 10",
    category: "Wearables",
    brand: "Apple",
    basePrice: 5500,
    description: "The Apple Watch Series 10 features the largest and most advanced display ever, with a thinner design and faster charging.",
    images: [
      "https://i.pinimg.com/736x/b0/4a/8e/b04a8e5c33a582a69476bea2e0dd8cde.jpg",
      "https://i.pinimg.com/736x/b4/13/09/b41309b400cbb05c3269a4cce302d1ec.jpg",
      "https://i.pinimg.com/736x/82/89/3c/82893cdc22bdfd88c385f74bcc8e5193.jpg"
    ],
    specifications: {
      Display: "LTPO OLED, Always-On Retina",
      Chip: "S10 SiP",
      WaterResistance: "50m"
    },
    options: {
      size: [
        { label: "42mm", price: 0 },
        { label: "46mm", price: 500 }
      ]
    },
    inStock: true,
    featured: true
  },
  {
    id: 15,
    name: "Apple 20W USB-C Power Adapter",
    category: "Chargers",
    brand: "Apple",
    basePrice: 150,
    description: "Fast, efficient charging. Compatible with iPhone, iPad, AirPods, and Apple Watch.",
    images: [
      "https://images.pexels.com/photos/1028674/pexels-photo-1028674.jpeg?w=600&q=80"
    ],
    specifications: {
      Power: "20W USB-C",
      Technology: "USB Power Delivery (PD)"
    },
    options: {},
    inStock: true,
    featured: false
  },
  {
    id: 16,
    name: "Premium Silicone Phone Case",
    category: "Accessories",
    brand: "SwifTek",
    basePrice: 120,
    description: "Premium silicone phone case with microfiber lining. Precise cutouts and raised edges for protection.",
    images: [
      "https://i.pinimg.com/1200x/0f/81/33/0f813328e7c186c44433c59d426c303f.jpg",
      "https://i.pinimg.com/1200x/1a/7e/36/1a7e366f543cf101d58e406ed8ce6d60.jpg",
      "https://i.pinimg.com/736x/98/b8/bd/98b8bd5cdff70e1ce2238bbe53041341.jpg"
    ],
    specifications: {
      Material: "Premium silicone",
      Protection: "Drop protection up to 6ft"
    },
    options: {
      compatibility: [
        { label: "iPhone 16 Pro Max", price: 0 },
        { label: "iPhone 16 Pro", price: 0 },
        { label: "iPhone 16", price: 0 },
        { label: "iPhone 15 Pro Max", price: 0 },
        { label: "Samsung Galaxy S24 Ultra", price: 0 }
      ]
    },
    inStock: true,
    featured: false
  },
  {
    id: 28,
    name: "Nokia 215 4G",
    category: "Keypads",
    brand: "Nokia",
    basePrice: 450,
    description: "Classic design meets 4G connectivity. Long-lasting battery and essential apps.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/nokia/nokia-215-4g-2024-1.jpg"
    ],
    specifications: {
      Display: "2.4-inch QVGA",
      Connectivity: "4G LTE",
      Battery: "1,450 mAh"
    },
    options: {},
    inStock: true,
    featured: false
  },
  {
    id: 30,
    name: "Logitech MX Master 3S",
    category: "IT Accessories",
    brand: "Logitech",
    basePrice: 1200,
    description: "The ultimate productivity mouse with 8K DPI tracking and quiet clicks.",
    images: [
      "https://images.pexels.com/photos/1010490/pexels-photo-1010490.jpeg?w=600&q=80"
    ],
    specifications: {
      Sensor: "8000 DPI Darkfield",
      Buttons: "7 buttons",
      Battery: "Up to 70 days"
    },
    options: {},
    inStock: true,
    featured: true
  },
  {
    id: 37,
    name: "CAT B40 4G Rugged Phone",
    category: "Keypads",
    brand: "CAT",
    basePrice: 750,
    description: "Professional rugged 4G feature phone. Military grade durability.",
    images: [
      "https://fdn2.gsmarena.com/vv/pics/cat/cat-b40-1.jpg"
    ],
    specifications: {
      Durability: "IP68, IP69, MIL-SPEC 810H",
      Battery: "1800mAh"
    },
    options: {},
    inStock: true,
    featured: true
  }
];

// Remove any products the admin deleted or trashed
try {
  const deletedRaw = localStorage.getItem('swiftek_admin_deleted');
  const trashRaw = localStorage.getItem('swiftek_admin_trash');
  const idsToRemove = [];

  if (deletedRaw) {
    const deletedIds = JSON.parse(deletedRaw);
    if (Array.isArray(deletedIds)) idsToRemove.push(...deletedIds);
  }
  if (trashRaw) {
    const trash = JSON.parse(trashRaw);
    if (Array.isArray(trash)) idsToRemove.push(...trash.map(t => t.id));
  }

  if (idsToRemove.length > 0) {
    let i = products.length;
    while (i--) {
      if (idsToRemove.includes(products[i].id)) {
        products.splice(i, 1);
      }
    }
  }
} catch (e) {
  console.warn('Could not load deleted products:', e);
}

// Load admin products from localStorage and merge
// - Admin products with _adminOverride replace static products by ID
// - Admin products with _adminCreated are appended as new products
try {
  const stored = localStorage.getItem('swiftek_admin_products');
  if (stored) {
    const adminProducts = JSON.parse(stored);
    if (Array.isArray(adminProducts)) {
      adminProducts.forEach(ap => {
        if (ap._adminOverride) {
          const idx = products.findIndex(p => p.id === ap.id);
          if (idx >= 0) products[idx] = ap;
        } else {
          const idx = products.findIndex(p => p.id === ap.id);
          if (idx >= 0) products[idx] = ap;
          else products.push(ap);
        }
      });
    }
  }
} catch (e) {
  console.warn('Could not load admin products:', e);
}
