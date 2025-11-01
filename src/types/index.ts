export interface Medicine {
  medicine_id: string;
  name: string;
  brand: string;
  form: 'Tablet' | 'Liquid' | 'Capsule' | 'Syrup' | 'Injection';
  quantity: number;
  unit: string;
  expiry_date: string;
  batch: string;
  last_sold_date: string;
  avg_daily_sales: number;
  category: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  distance?: number;
  rating: number;
  inventory: Medicine[];
}

export interface ForecastData {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'outbreak' | 'request' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  medicine?: string;
  depletionDate?: string;
  recommendedQuantity?: number;
}

export interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  searchTrend: number;
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  distance: number;
  costPerUnit: number;
  availability: number;
  reliability: number;
  deliveryTimeHrs: number;
  phone: string;
}

export interface Order {
  id: string;
  date: string;
  medicine: string;
  totalQuantity: number;
  vendors: Array<{
    vendorId: string;
    vendorName: string;
    quantity: number;
    cost: number;
  }>;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  totalCost: number;
  estimatedDeliveryHrs: number;
}
