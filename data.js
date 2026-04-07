// ===== PURE CLARA – DATA STORE =====
// This file acts as the dynamic data layer.
// Admin panel reads/writes here via localStorage.

const CLARA_KEY = 'claraData';

const defaultData = {
  hero: {
    tagline: "Feel The Purity in every drop — sourced from pristine river origins, purified to perfection.",
    badge: "Premium Packaged Drinking Water",
    image: "images/clara_real_bottle.png"
  },
  about: {
    description: "Pure CLARA is born from nature's finest water sources — pristine rivers untouched by industrial pollution. Every drop undergoes our 7-stage purification process, ensuring you receive water in its most natural and pure form.",
    image: "images/clara_river_source.png"
  },
  products: [
    {
      id: 1,
      image: "images/clara_real_bottle.png",
      badge: "Bestseller",
      name: "Clara 750ml",
      shortDesc: "Non-Carbonated | Packaged Drinking Water",
      description: "Our signature 750ml bottle. Perfect companion for travel, gym, and daily use. Purified from pristine river sources using advanced 7-stage filtration. BIS certified, zero additives.",
      specs: [
        { label: "Volume", value: "750 ml" },
        { label: "Type", value: "Non-Carbonated" },
        { label: "pH Level", value: "7.0 – 7.5" },
        { label: "TDS", value: "< 50 ppm" },
        { label: "Certification", value: "BIS Certified" },
        { label: "Packaging", value: "PET Bottle" }
      ],
      price: "₹20",
      available: true
    },
    {
      id: 2,
      image: "images/clara_products_lineup.png",
      badge: "Popular",
      name: "Clara 200ml",
      shortDesc: "Compact | Travel Friendly",
      description: "Portable 200ml bottle ideal for events, functions, offices, and travel. Same purity, convenient size. Great for bulk orders and events.",
      specs: [
        { label: "Volume", value: "200 ml" },
        { label: "Type", value: "Non-Carbonated" },
        { label: "pH Level", value: "7.0 – 7.5" },
        { label: "TDS", value: "< 50 ppm" },
        { label: "Certification", value: "BIS Certified" },
        { label: "Packaging", value: "PET Bottle" }
      ],
      price: "₹10",
      available: true
    },
    {
      id: 3,
      image: "images/clara_products_lineup.png",
      badge: "Value Pack",
      name: "Clara 1000ml",
      shortDesc: "Family Size | Best Value",
      description: "1-litre family pack. Ideal for home, office, and restaurants. Long-lasting hydration with superior purity guaranteed.",
      specs: [
        { label: "Volume", value: "1000 ml" },
        { label: "Type", value: "Non-Carbonated" },
        { label: "pH Level", value: "7.0 – 7.5" },
        { label: "TDS", value: "< 50 ppm" },
        { label: "Certification", value: "BIS Certified" },
        { label: "Packaging", value: "PET Bottle" }
      ],
      price: "₹30",
      available: true
    },
    {
      id: 4,
      image: "images/clara_products_lineup.png",
      badge: "Bulk",
      name: "Clara 20L Jar",
      shortDesc: "Office & Home Delivery",
      description: "20-litre water jar for home and office dispensers. Our most economical option for continuous hydration needs.",
      specs: [
        { label: "Volume", value: "20 Litres" },
        { label: "Type", value: "Non-Carbonated" },
        { label: "pH Level", value: "7.0 – 7.5" },
        { label: "TDS", value: "< 50 ppm" },
        { label: "Certification", value: "BIS Certified" },
        { label: "Packaging", value: "PC Jar" }
      ],
      price: "₹60",
      available: true
    }
  ],
  benefits: [
    { icon: "🌊", title: "Direct River Source", desc: "Sourced from pristine mountain rivers, ensuring the purest water at origin." },
    { icon: "🔬", title: "7-Stage Purification", desc: "Advanced multi-stage filtration removes all impurities, bacteria, and contaminants." },
    { icon: "✅", title: "BIS Certified", desc: "Approved by Bureau of Indian Standards. Quality you can trust." },
    { icon: "💧", title: "Zero Additives", desc: "100% natural — no artificial minerals, flavors, or preservatives added." },
    { icon: "♻️", title: "Eco Packaging", desc: "Food-grade PET bottles that are 100% recyclable for a greener planet." },
    { icon: "🏔️", title: "Natural Minerals", desc: "Rich in naturally occurring minerals essential for daily health and wellness." }
  ],
  gallery: [
    {
      image: "images/clara_real_bottle.png",
      title: "Clara, Your Ultimate",
      subtitle: "Hydration Partner"
    },
    {
      image: "images/clara_river_source.png",
      title: "Purified By Direct",
      subtitle: "River"
    },
    {
      image: "images/clara_products_lineup.png",
      title: "Feel The Purity",
      subtitle: "in every drop"
    }
  ],
  testimonials: [
    { name: "Rahul M.", role: "Fitness Trainer", rating: 5, text: "Clara water has become part of my daily routine. The purity is exceptional — you can taste the difference compared to other brands." },
    { name: "Priya S.", role: "Restaurant Owner", rating: 5, text: "We switched all our tables to Clara bottles. Our customers love it and always ask about the brand. Highly recommend for businesses." },
    { name: "Jatin P.", role: "Event Organizer", rating: 5, text: "Bulk ordered 200ml bottles for our corporate event. Perfect packaging, on-time delivery, and everyone appreciated the quality." },
    { name: "Meera K.", role: "Health Blogger", rating: 5, text: "After researching dozens of water brands, Clara stands out for its low TDS, natural minerals, and transparent sourcing. Love it!" }
  ],
  contact: {
    phone: "+91 96625 50051",
    email: "info@pureclarawater.com",
    address: "Gujarat, India",
    instagram: "@purewater_clara",
    whatsapp: "919662550051"
  },
  dealer: {
    phone: "9662550051",
    email: "info@pureclarawater.com",
    text: "Join our growing network of dealerships. A simple way to boost your health business. For dealership inquiry, contact us today."
  },
  footer: {
    description: "Your Ultimate Hydration Partner. Pure water from pristine river sources, delivered with care.",
    copyright: "© 2024 Pure CLARA. All Rights Reserved. | Non-Carbonated Packaged Drinking Water"
  }
};

// Load data from localStorage or use defaults
function getClaraData() {
  try {
    const stored = localStorage.getItem(CLARA_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Deep merge to ensure new fields are present
      return deepMerge(defaultData, parsed);
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultData));
}

function saveClaraData(data) {
  localStorage.setItem(CLARA_KEY, JSON.stringify(data));
}

function deepMerge(target, source) {
  const result = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// Expose globally
window.getClaraData = getClaraData;
window.saveClaraData = saveClaraData;
window.defaultClaraData = defaultData;
