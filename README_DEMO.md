# MediLink AI - Smart Rural Pharmacy Network MVP

## 🎯 Project Overview

MediLink AI is a comprehensive MVP demonstrating an AI-powered pharmacy network designed for rural healthcare providers. This frontend-only demo showcases intelligent inventory management, demand forecasting, and collaborative stock sharing between pharmacies.

## ✨ Key Features

### 1. **Dashboard** (`/`)
- Real-time inventory summary with key metrics
- Low stock predictions and alerts
- Interactive demand forecast charts
- Quick access to critical actions

### 2. **Inventory Management** (`/inventory`)
- Complete medicine database with search and filters
- CSV upload/download functionality
- Add, edit, and delete medicines
- Real-time stock level calculations
- Days remaining predictions

### 3. **Demand Forecasting** (`/forecasting`)
- 14-day AI-powered demand predictions
- Visual forecast charts with confidence bands
- Explainability panel showing prediction drivers
- Reorder recommendations with reasoning
- Bulk forecast summary for all medicines

### 4. **Pharmacy Network** (`/network`)
- Partner pharmacy directory with ratings
- Distance and availability filters
- Inter-pharmacy stock request system
- Map visualization (placeholder for Leaflet/Mapbox)
- SMS/WhatsApp notification previews

### 5. **Alerts & Notifications** (`/alerts`)
- Low stock warnings with predicted depletion dates
- Disease outbreak trend alerts
- Stock request updates
- Accept/dismiss actions
- Categorized by priority

### 6. **Settings** (`/settings`)
- Pharmacy profile management
- Multilingual support (EN/HI/MR)
- Data backup and restore
- Demo data reset

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **First Visit**: The app automatically loads with demo data
2. **Upload CSV**: Use the sample CSV file (`public/sample-inventory.csv`) to test bulk uploads
3. **Explore Features**: Navigate through all pages to see different capabilities
4. **Test Forecasting**: Click on medicines to view 14-day demand predictions
5. **Network Requests**: Send mock requests to partner pharmacies
6. **Manage Alerts**: Accept or dismiss recommendations

## 📊 Data Structure

### Medicine CSV Format

```csv
medicine_id,name,brand,form,quantity,unit,expiry_date,batch,last_sold_date,avg_daily_sales,category
M001,Paracetamol,Crocin,Tablet,120,tablets,2026-06-30,B123,2025-10-28,5,Antipyretic
```

### Required Fields
- `medicine_id`: Unique identifier
- `name`: Medicine name
- `brand`: Brand name
- `form`: Tablet, Capsule, Liquid, Syrup, or Injection
- `quantity`: Current stock quantity
- `unit`: tablets, capsules, bottles, etc.
- `expiry_date`: YYYY-MM-DD format
- `batch`: Batch number
- `last_sold_date`: YYYY-MM-DD format
- `avg_daily_sales`: Average daily sales (decimal)
- `category`: Antipyretic, Antibiotic, etc.

## 🎨 Design System

The app uses a healthcare-focused design with:
- **Primary**: Medical blue (trust, professionalism)
- **Secondary**: Health green (growth, positive outcomes)
- **Accent**: Alert orange (warnings, actions)
- **Success**: Green (confirmations)
- **Warning**: Amber (cautions)

All colors use HSL values for accessibility and theming.

## 🔮 Forecasting Algorithm

The demand prediction uses a deterministic model combining:
1. **Historical baseline**: 7/14-day moving average of past sales
2. **Seasonal patterns**: Weekly demand variations (weekday vs weekend)
3. **Weather signals**: Mock temperature/humidity correlations
4. **Search trends**: Simulated search interest multipliers
5. **Confidence bands**: ±10-30% based on historical volatility

Formula:
```
forecast = moving_average(past_14_days) * 
           (1 + 0.1 * humidity_anomaly + 0.2 * search_trend_anomaly)
```

## 🗺️ Map Integration

The Network page includes a placeholder for map integration. To enable full map functionality:

1. **Option A: Leaflet (Open Source)**
   - Free, no API key required
   - Good for basic mapping needs
   - Already included in dependencies

2. **Option B: Mapbox (Premium)**
   - Better performance and styling
   - Requires API key from [mapbox.com](https://mapbox.com)
   - Add `VITE_MAPBOX_TOKEN` to environment variables

## 💾 Data Persistence

- **Storage**: Browser localStorage
- **Scope**: Device-specific, no cloud sync (demo only)
- **Export**: JSON backup available in Settings
- **Reset**: Restore demo data anytime from Settings

## 🌐 Multilingual Support

Current: English (fully implemented)
Coming Soon:
- हिंदी (Hindi)
- मराठी (Marathi)

Translation framework ready using react-i18next.

## 🎬 Demo Script

### 30-Second Pitch
1. Show Dashboard → highlight low stock alerts
2. Click Paracetamol → show forecast with confidence
3. Accept reorder recommendation

### 3-Minute Demo
1. Upload sample CSV → instant inventory update
2. Navigate to Forecasting → show multiple medicine predictions
3. Open Network → send mock request to nearby pharmacy
4. View Alerts → show outbreak warning and heatmap concept
5. Settings → export data as backup

### Q&A Topics
- Data privacy (local-first for demo)
- Forecast accuracy (based on historical patterns)
- Backend integration (future: government APIs, SMS services)
- Scalability (ready for cloud deployment)

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Maps**: React Leaflet (ready for integration)
- **Data**: Papa Parse (CSV), localStorage
- **Routing**: React Router v6
- **State**: React hooks + localStorage

## 📱 Mobile-First Design

- Responsive layout for all screen sizes
- Touch-optimized interactions
- Mobile menu for small screens
- Optimized chart sizes for phones

## 🔒 Security & Privacy

- All data stored locally (no external API calls)
- No user authentication required (demo mode)
- CSV validation to prevent injection
- XSS protection via React

## 🚢 Deployment

Ready to deploy to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

Build command: `npm run build`
Output directory: `dist`

## 📈 Future Enhancements

1. **Backend Integration**
   - Supabase/Firebase for cloud sync
   - Real-time updates between pharmacies
   - SMS notifications via Twilio

2. **Advanced ML**
   - Prophet/ARIMA for time-series forecasting
   - Anomaly detection for outbreak prediction
   - Recommendation engine for reorders

3. **Government APIs**
   - Weather data integration
   - Disease surveillance connections
   - Regulatory compliance

4. **Enhanced Mapping**
   - Live pharmacy locations
   - Route optimization
   - Stock heatmaps

## 📝 License

This is a demo project for educational/hackathon purposes.

## 🤝 Contributing

This is an MVP demo. For production deployment, consider:
- Adding comprehensive error handling
- Implementing user authentication
- Connecting to a real backend
- Adding unit and E2E tests
- Performance optimization for large datasets

---

**Built for rural healthcare providers to improve medicine availability and prevent stockouts through AI-powered collaboration.**
