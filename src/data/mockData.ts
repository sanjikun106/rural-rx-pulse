import { Medicine, Pharmacy, ForecastData, Alert, WeatherData, Vendor, Order } from '@/types';

export const mockMedicines: Medicine[] = [
  {
    medicine_id: 'M001',
    name: 'Paracetamol',
    brand: 'Crocin',
    form: 'Tablet',
    quantity: 120,
    unit: 'tablets',
    expiry_date: '2026-06-30',
    batch: 'B123',
    last_sold_date: '2025-10-28',
    avg_daily_sales: 5,
    category: 'Antipyretic',
  },
  {
    medicine_id: 'M002',
    name: 'Amoxicillin',
    brand: 'Mox',
    form: 'Capsule',
    quantity: 45,
    unit: 'capsules',
    expiry_date: '2025-12-15',
    batch: 'B456',
    last_sold_date: '2025-10-25',
    avg_daily_sales: 3,
    category: 'Antibiotic',
  },
  {
    medicine_id: 'M003',
    name: 'Cetirizine',
    brand: 'Zyrtec',
    form: 'Tablet',
    quantity: 80,
    unit: 'tablets',
    expiry_date: '2026-03-20',
    batch: 'B789',
    last_sold_date: '2025-10-27',
    avg_daily_sales: 4,
    category: 'Antihistamine',
  },
  {
    medicine_id: 'M004',
    name: 'Ibuprofen',
    brand: 'Brufen',
    form: 'Tablet',
    quantity: 15,
    unit: 'tablets',
    expiry_date: '2025-11-30',
    batch: 'B234',
    last_sold_date: '2025-10-26',
    avg_daily_sales: 6,
    category: 'Anti-inflammatory',
  },
  {
    medicine_id: 'M005',
    name: 'Azithromycin',
    brand: 'Azee',
    form: 'Tablet',
    quantity: 30,
    unit: 'tablets',
    expiry_date: '2026-08-15',
    batch: 'B567',
    last_sold_date: '2025-10-24',
    avg_daily_sales: 2,
    category: 'Antibiotic',
  },
  {
    medicine_id: 'M006',
    name: 'Omeprazole',
    brand: 'Omez',
    form: 'Capsule',
    quantity: 60,
    unit: 'capsules',
    expiry_date: '2026-05-10',
    batch: 'B890',
    last_sold_date: '2025-10-28',
    avg_daily_sales: 3,
    category: 'Antacid',
  },
  {
    medicine_id: 'M007',
    name: 'Dextromethorphan',
    brand: 'Benadryl',
    form: 'Syrup',
    quantity: 25,
    unit: 'bottles',
    expiry_date: '2025-12-31',
    batch: 'B345',
    last_sold_date: '2025-10-27',
    avg_daily_sales: 4,
    category: 'Cough Suppressant',
  },
  {
    medicine_id: 'M008',
    name: 'Metformin',
    brand: 'Glycomet',
    form: 'Tablet',
    quantity: 100,
    unit: 'tablets',
    expiry_date: '2026-09-20',
    batch: 'B678',
    last_sold_date: '2025-10-28',
    avg_daily_sales: 8,
    category: 'Antidiabetic',
  },
];

export const mockPharmacies: Pharmacy[] = [
  {
    id: 'P001',
    name: 'Health Plus Pharmacy',
    location: 'Pune Rural',
    lat: 18.5204,
    lng: 73.8567,
    distance: 2.5,
    rating: 4.5,
    inventory: [],
  },
  {
    id: 'P002',
    name: 'Care Medical Store',
    location: 'Satara District',
    lat: 17.6869,
    lng: 73.9896,
    distance: 15.3,
    rating: 4.2,
    inventory: [],
  },
  {
    id: 'P003',
    name: 'Wellness Pharmacy',
    location: 'Kolhapur',
    lat: 16.7050,
    lng: 74.2433,
    distance: 8.7,
    rating: 4.8,
    inventory: [],
  },
  {
    id: 'P004',
    name: 'Community Health Store',
    location: 'Sangli',
    lat: 16.8524,
    lng: 74.5815,
    distance: 12.1,
    rating: 4.3,
    inventory: [],
  },
];

export const generateForecast = (medicine: Medicine): ForecastData[] => {
  const forecast: ForecastData[] = [];
  const baseValue = medicine.avg_daily_sales;
  
  for (let i = 1; i <= 14; i++) {
    const randomFactor = 0.8 + Math.random() * 0.4;
    const predicted = Math.round(baseValue * randomFactor * (1 + Math.sin(i / 3) * 0.2));
    const variance = predicted * 0.2;
    
    forecast.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predicted,
      lower: Math.round(predicted - variance),
      upper: Math.round(predicted + variance),
      confidence: variance < predicted * 0.15 ? 'High' : variance < predicted * 0.25 ? 'Medium' : 'Low',
    });
  }
  
  return forecast;
};

export const mockAlerts: Alert[] = [
  {
    id: 'A001',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Ibuprofen predicted to run out by Nov 4, 2025',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    medicine: 'Ibuprofen',
    depletionDate: '2025-11-04',
    recommendedQuantity: 100,
  },
  {
    id: 'A002',
    type: 'outbreak',
    title: 'Disease Trend Alert',
    message: 'Fever medicines usage ↑ 3x in last 3 days - Potential local outbreak',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 'A003',
    type: 'request',
    title: 'Stock Request Accepted',
    message: 'Health Plus Pharmacy accepted your request for Paracetamol (50 tablets)',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'A004',
    type: 'low_stock',
    title: 'Low Stock Warning',
    message: 'Dextromethorphan running low - 25 bottles remaining',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: false,
    medicine: 'Dextromethorphan',
    depletionDate: '2025-11-10',
    recommendedQuantity: 50,
  },
];

export const mockWeatherData: WeatherData[] = Array.from({ length: 90 }, (_, i) => ({
  date: new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  temperature: 25 + Math.sin(i / 10) * 8 + (Math.random() - 0.5) * 4,
  humidity: 60 + Math.sin(i / 7) * 20 + (Math.random() - 0.5) * 10,
  searchTrend: 50 + Math.sin(i / 5) * 30 + (Math.random() - 0.5) * 20,
}));

export const mockVendors: Vendor[] = [
  {
    id: 'V001',
    name: 'Medico Distributors',
    location: 'Pune City',
    lat: 18.5204,
    lng: 73.8567,
    distance: 12.5,
    costPerUnit: 22,
    availability: 500,
    reliability: 4.5,
    deliveryTimeHrs: 2.5,
    phone: '+91-9876543210',
  },
  {
    id: 'V002',
    name: 'PharmaNet Supplies',
    location: 'Mumbai',
    lat: 19.0760,
    lng: 72.8777,
    distance: 25.0,
    costPerUnit: 20,
    availability: 800,
    reliability: 4.0,
    deliveryTimeHrs: 4.0,
    phone: '+91-9876543211',
  },
  {
    id: 'V003',
    name: 'HealthCare Wholesale',
    location: 'Nashik',
    lat: 19.9975,
    lng: 73.7898,
    distance: 45.3,
    costPerUnit: 18,
    availability: 1200,
    reliability: 4.8,
    deliveryTimeHrs: 6.0,
    phone: '+91-9876543212',
  },
  {
    id: 'V004',
    name: 'MediSource India',
    location: 'Aurangabad',
    lat: 19.8762,
    lng: 75.3433,
    distance: 32.8,
    costPerUnit: 24,
    availability: 300,
    reliability: 3.8,
    deliveryTimeHrs: 5.5,
    phone: '+91-9876543213',
  },
  {
    id: 'V005',
    name: 'SwiftMed Logistics',
    location: 'Satara',
    lat: 17.6869,
    lng: 73.9896,
    distance: 18.5,
    costPerUnit: 26,
    availability: 450,
    reliability: 4.2,
    deliveryTimeHrs: 3.0,
    phone: '+91-9876543214',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'O001',
    date: '2025-10-25',
    medicine: 'Paracetamol',
    totalQuantity: 300,
    vendors: [
      { vendorId: 'V001', vendorName: 'Medico Distributors', quantity: 300, cost: 6600 },
    ],
    status: 'Delivered',
    totalCost: 6600,
    estimatedDeliveryHrs: 2.5,
  },
  {
    id: 'O002',
    date: '2025-10-28',
    medicine: 'Amoxicillin',
    totalQuantity: 500,
    vendors: [
      { vendorId: 'V002', vendorName: 'PharmaNet Supplies', quantity: 300, cost: 6000 },
      { vendorId: 'V003', vendorName: 'HealthCare Wholesale', quantity: 200, cost: 3600 },
    ],
    status: 'In Transit',
    totalCost: 9600,
    estimatedDeliveryHrs: 4.0,
  },
  {
    id: 'O003',
    date: '2025-10-20',
    medicine: 'Cetirizine',
    totalQuantity: 200,
    vendors: [
      { vendorId: 'V005', vendorName: 'SwiftMed Logistics', quantity: 200, cost: 5200 },
    ],
    status: 'Delivered',
    totalCost: 5200,
    estimatedDeliveryHrs: 3.0,
  },
];

export const calculateVendorScore = (vendor: Vendor): number => {
  return (
    vendor.reliability * 2 +
    1 / (vendor.distance / 10) +
    vendor.availability / 100 -
    vendor.costPerUnit / 50
  );
};

export const generateHistoricalSales = (medicine: Medicine, days: number = 30): Array<{ date: string; sales: number }> => {
  const historicalData: Array<{ date: string; sales: number }> = [];
  const baseValue = medicine.avg_daily_sales;
  
  for (let i = days; i >= 1; i--) {
    const randomFactor = 0.7 + Math.random() * 0.6;
    const sales = Math.round(baseValue * randomFactor * (1 + Math.sin(i / 4) * 0.3));
    
    historicalData.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sales: Math.max(0, sales),
    });
  }
  
  return historicalData;
};
