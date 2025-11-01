import { Medicine, Alert } from '@/types';

const STORAGE_KEYS = {
  INVENTORY: 'medilink_inventory',
  ALERTS: 'medilink_alerts',
  PHARMACY_NAME: 'medilink_pharmacy_name',
  LANGUAGE: 'medilink_language',
};

export const storage = {
  getInventory: (): Medicine[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : [];
  },
  
  setInventory: (inventory: Medicine[]) => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  },
  
  getAlerts: (): Alert[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
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
};
