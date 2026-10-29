export type ServiceItem = {
  name: string;
  slug: string;
  icon: string; // lucide icon name
  count: number;
  color: string;
  price: number; // approximate starting price in ₹
};

export const SERVICES: ServiceItem[] = [
  { name: "Pet Care", slug: "pet-care", icon: "PawPrint", count: 38, color: "from-amber-400 to-orange-500", price: 350 },
  { name: "Pest Control", slug: "pest-control", icon: "Bug", count: 67, color: "from-red-400 to-rose-600", price: 800 },
  { name: "Car Washing", slug: "car-washing", icon: "Car", count: 54, color: "from-sky-400 to-blue-500", price: 300 },
  { name: "House Cleaning", slug: "house-cleaning", icon: "Sparkles", count: 156, color: "from-yellow-300 to-amber-400", price: 500 },
  { name: "Movers & Packers", slug: "movers-packers", icon: "Truck", count: 29, color: "from-violet-400 to-purple-500", price: 1500 },
  { name: "Cook Service", slug: "cook-service", icon: "ChefHat", count: 47, color: "from-orange-400 to-red-500", price: 400 },
  { name: "Water Tank Cleaning", slug: "water-tank-cleaning", icon: "Droplets", count: 23, color: "from-blue-400 to-cyan-500", price: 1200 },
  { name: "Laundry & Ironing", slug: "laundry-ironing", icon: "Shirt", count: 44, color: "from-indigo-400 to-blue-500", price: 250 },
  { name: "Plant Maintenance", slug: "plant-maintenance", icon: "Trees", count: 26, color: "from-green-400 to-emerald-500", price: 300 },
  { name: "Housekeeping", slug: "housekeeping", icon: "Home", count: 48, color: "from-emerald-400 to-teal-500", price: 500 },
  { name: "Home Organizing Service", slug: "home-organizing", icon: "Boxes", count: 20, color: "from-fuchsia-400 to-pink-500", price: 600 },
  { name: "Bathroom Deep Cleaning", slug: "bathroom-deep-cleaning", icon: "ShowerHead", count: 34, color: "from-cyan-400 to-sky-500", price: 700 },
];
