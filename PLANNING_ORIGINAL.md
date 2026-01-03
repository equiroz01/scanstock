# 📦 ScanStock - Inventory & Price List

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A powerful offline-first inventory management app for small businesses**

[Features](#-features) • [Screenshots](#-screenshots) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture)

</div>

---

## 🎯 Overview

ScanStock is a mobile inventory management application designed for small businesses that need a simple, reliable way to track products, prices, and stock levels. Built with an **offline-first** approach, the app works completely without internet connectivity, with optional cloud backup for Pro users.

### Why ScanStock?

- ✅ **Works 100% offline** - No internet required for core functionality
- 🚀 **Fast & Simple** - Built for speed and ease of use
- 📷 **Barcode Scanner** - Scan products instantly with multiple format support
- 💾 **Complete Backups** - Export everything: products, photos, and data
- 💰 **Fair Pricing** - Free tier + affordable Pro options
- 🔒 **Privacy First** - Your data stays on your device

---

## ✨ Features

### Core Features (Free)

- 📦 **Unlimited Products** - Add as many products as your device can store
- 🔍 **Fast Search** - Find products instantly by name or barcode
- 📷 **Barcode Scanner** - Support for EAN-13, UPC, Code 128, and more
- 📸 **Product Photos** - Take or upload photos for visual identification
- 📊 **Stock Management** - Quick +/- buttons for stock adjustments
- 🎨 **Visual Indicators** - Color-coded stock levels (low/out/ok)
- 🌙 **Dark Mode Support** - Automatic theme switching

### Pro Features

#### Pro Local ($2.99 one-time)

- 💾 **Complete Backups** - Export all data and photos to ZIP file
- 📥 **Restore Backups** - Import backups from any device
- 📄 **CSV Export** - Excel-compatible spreadsheet export
- 📑 **PDF Reports** - Professional inventory reports
- 🔓 **Unlimited Everything** - No feature restrictions

#### Pro Cloud ($0.99/month or $9.99/year)

- ☁️ **Cloud Backup** - Automatic backup to secure cloud storage
- 🔄 **Cross-Device Sync** - Access your data on multiple devices
- 📅 **Version History** - Restore from previous backups
- 💾 **100 MB Storage** - Plenty of space for small businesses
- 🔐 **Encrypted** - All cloud data is encrypted in transit

---

## 📱 Screenshots

> Screenshots coming soon - App ready for production!

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.4 or higher
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scanstock.git
   cd scanstock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   npm run ios     # iOS Simulator
   npm run android # Android Emulator
   npm run web     # Web Browser
   ```

### First Run

On first launch, the app will:
1. Initialize the SQLite database
2. Create the photos directory
3. Load with empty inventory
4. Show you the main inventory screen

---

## 🛠️ Tech Stack

### Core Technologies

- **React Native** 0.81.5 - Cross-platform mobile framework
- **Expo** 54 - Development platform and tooling
- **TypeScript** 5.9 - Type-safe JavaScript
- **Expo Router** 6.0 - File-based navigation

### State & Data

- **Zustand** 5.0 - Lightweight state management
- **expo-sqlite** 16.0 - Local SQLite database
- **expo-file-system** - Persistent file storage

### UI & Styling

- **NativeWind** 4.2 - TailwindCSS for React Native
- **TailwindCSS** 4.1 - Utility-first CSS
- **Ionicons** - Beautiful icon set

### Features

- **expo-camera** - Barcode scanning
- **expo-image-picker** - Photo selection
- **expo-print** - PDF generation
- **react-native-iap** - In-app purchases
- **jszip** - ZIP file compression

---

## 🏗️ Architecture

### Project Structure

```
scanstock/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Inventory list
│   │   ├── scanner.tsx    # Barcode scanner
│   │   └── settings.tsx   # Settings
│   ├── product/           # Product screens
│   │   ├── new.tsx        # Create product
│   │   └── [id].tsx       # Edit product
│   └── settings/
│       └── backup.tsx     # Backup & IAP
│
├── src/
│   ├── components/        # Reusable components
│   ├── constants/         # App constants
│   ├── database/          # SQLite setup
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic
│   │   ├── backup/        # Backup services
│   │   ├── iap/          # In-app purchases
│   │   └── photos/       # Photo management
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
│
└── assets/               # Images, fonts, etc.
```

### Database Schema

```sql
-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  barcode TEXT UNIQUE,
  price REAL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  photo_path TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Settings table
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### State Management

```typescript
// Product Store (Zustand)
{
  products: Product[],
  isLoading: boolean,
  searchQuery: string,
  loadProducts: () => Promise<void>,
  addProduct: (input) => Promise<Product>,
  updateProduct: (id, input) => Promise<Product>,
  deleteProduct: (id) => Promise<void>,
  // ... more actions
}

// Plan Store (Zustand)
{
  plan: 'free' | 'pro_local' | 'pro_cloud',
  isProLocal: boolean,
  isProCloud: boolean,
  setPlan: (plan) => void
}
```

---

## 🎨 Design System

### Colors

```javascript
// Primary
primary: {
  50: '#eef2ff',
  100: '#e0e7ff',
  500: '#6366f1',
  600: '#4f46e5',  // Brand color
  700: '#4338ca',
}

// Dark
dark: {
  50: '#f8fafc',
  100: '#f1f5f9',
  500: '#64748b',
  900: '#0f172a',
}
```

### Typography

- **Headlines**: System font, bold
- **Body**: System font, regular
- **Captions**: System font, 12-14px

### Components

All components follow a consistent design pattern:
- Material Design principles
- Rounded corners (8-16px)
- Shadows for elevation
- Active states with opacity
- Loading states with spinners

---

## 📚 Key Features Explained

### Barcode Scanner

The scanner supports multiple formats:
- EAN-13, EAN-8 (Europe)
- UPC-A, UPC-E (North America)
- Code 128, Code 39, Code 93
- Codabar, ITF-14

**Flow:**
1. Scan barcode
2. If product exists → Open detail
3. If not exists → Create new with barcode pre-filled
4. Haptic feedback on successful scan

### Photo Management

Photos are stored persistently in the app's document directory:
```
{DocumentDirectory}/photos/
├── 1234567890_abc123.jpg
├── 1234567891_def456.jpg
└── ...
```

Features:
- Compression (quality 0.8)
- 1:1 aspect ratio (crop)
- Auto-cleanup when product deleted
- Path mapping during restore

### Backup System

**ZIP Structure:**
```
scanstock-backup-2026-01-02.zip
├── manifest.json          # Metadata
├── products.json          # All products
└── photos/
    ├── photo1.jpg
    └── photo2.jpg
```

**Manifest:**
```json
{
  "version": "1.0",
  "appVersion": "1.0.0",
  "createdAt": "2026-01-02T10:30:00.000Z",
  "deviceInfo": {
    "platform": "ios",
    "osVersion": "17.0"
  },
  "productCount": 150,
  "photoCount": 120,
  "totalSize": 15728640
}
```

### In-App Purchases

Product IDs:
```
com.scanstock.app.pro_local          // $2.99 one-time
com.scanstock.app.pro_cloud_monthly  // $0.99/month
com.scanstock.app.pro_cloud_yearly   // $9.99/year
```

See [IAP_SETUP.md](./IAP_SETUP.md) for complete setup guide.

---

## 🧪 Testing

### Unit Testing

```bash
# Run tests (if configured)
npm test
```

### Manual Testing Checklist

- [ ] Create product
- [ ] Edit product
- [ ] Delete product
- [ ] Search products
- [ ] Scan barcode (existing)
- [ ] Scan barcode (new)
- [ ] Add photo (camera)
- [ ] Add photo (gallery)
- [ ] Adjust stock (+/-)
- [ ] Create backup
- [ ] Restore backup
- [ ] Export CSV
- [ ] Export PDF
- [ ] Purchase Pro Local (sandbox)
- [ ] Restore purchase

### IAP Testing

**iOS:**
1. Add Sandbox Test User in App Store Connect
2. Sign out of App Store on device
3. Run app, attempt purchase
4. Sign in with sandbox account
5. Complete purchase (free in sandbox)

**Android:**
1. Add test account in Google Play Console
2. Join internal testing track
3. Install app from Play Store
4. Use test card: 4242 4242 4242 4242

---

## 🚢 Deployment

### iOS (App Store)

1. **Configure App Store Connect**
   - Create app with bundle ID: `com.scanstock.app`
   - Add screenshots and description
   - Configure In-App Purchases (see IAP_SETUP.md)

2. **Build**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit**
   ```bash
   eas submit --platform ios
   ```

### Android (Google Play)

1. **Configure Google Play Console**
   - Create app with package: `com.scanstock.app`
   - Add screenshots and description
   - Configure In-App Products (see IAP_SETUP.md)

2. **Build**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit**
   ```bash
   eas submit --platform android
   ```

---

## 📖 Documentation

- [IAP Setup Guide](./IAP_SETUP.md) - Complete guide for configuring In-App Purchases
- [Planning Document](./plan.md) - Original planning and product vision
- API Documentation - Coming soon
- Contributing Guide - Coming soon

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- TypeScript strict mode
- ESLint for code quality
- Prettier for formatting
- Conventional Commits

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Icons by [Ionicons](https://ionic.io/ionicons)
- Inspired by small business needs
- Community feedback and support

---

## 📊 Project Status

**Current Version:** 1.0.0 (V1 Complete)

### ✅ Completed
- [x] Core inventory management
- [x] Barcode scanner with haptic feedback
- [x] Photo management with persistent storage
- [x] Complete backup & restore (ZIP with photos)
- [x] Export CSV/PDF
- [x] In-App Purchases integration
- [x] Offline-first architecture
- [x] Feature gating (Free/Pro)

### 🚧 In Progress
- [ ] App Store submission
- [ ] Google Play submission

### 🔮 Planned (V1.1+)
- [ ] Cloud backend API
- [ ] Automatic cloud sync
- [ ] Product categories
- [ ] Low stock alerts
- [ ] Advanced reports
- [ ] Multi-store support
- [ ] Web dashboard

---

## 💬 Support

For support, email support@scanstock.app or join our community:

- Discord: Coming soon
- Twitter: [@scanstock_app](https://twitter.com/scanstock_app)
- Website: [www.scanstock.app](https://scanstock.app)

---

<div align="center">

**Made with ❤️ for small businesses**

[⬆ Back to top](#-scanstock---inventory--price-list)

</div>
