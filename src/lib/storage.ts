import { Medicine, Alert, Order } from '@/types';
import { mockMedicines, mockAlerts, mockOrders } from '@/data/mockData';

const STORAGE_KEYS = {
  INVENTORY: 'medilink_inventory',
  ALERTS: 'medilink_alerts',
  PHARMACY_NAME: 'medilink_pharmacy_name',
  LANGUAGE: 'medilink_language',
  ORDERS: 'medilink_orders',
};

export const storage = {
  getInventory: (): Medicine[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : mockMedicines;
  },
  
  setInventory: (inventory: Medicine[]) => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  },
  
  getAlerts: (): Alert[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : mockAlerts;
  },
  
  setAlerts: (alerts: Alert[]) => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },
  
  getPharmacyName: (): string => {
    return localStorage.getItem(STORAGE_KEYS.PHARMACY_NAME) || 'Demo Pharmacy';
  },
  
  setPharmacyName: (name: string) => {
    localStorage.setItem(STORAGE_KEYS.PHARMACY_NAME, name);
  },
  
  getLanguage: (): string => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  },
  
  setLanguage: (language: string) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  getOrders: (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : mockOrders;
  },

  setOrders: (orders: Order[]) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  addOrder: (order: Order) => {
    const orders = storage.getOrders();
    orders.unshift(order);
    storage.setOrders(orders);
  },
};

// Export individual functions for convenience
export const getInventory = storage.getInventory;
export const setInventory = storage.setInventory;
export const getAlerts = storage.getAlerts;
export const setAlerts = storage.setAlerts;
export const getPharmacyName = storage.getPharmacyName;
export const setPharmacyName = storage.setPharmacyName;
export const getLanguage = storage.getLanguage;
export const setLanguage = storage.setLanguage;
export const getOrders = storage.getOrders;
export const setOrders = storage.setOrders;
export const addOrder = storage.addOrder;
