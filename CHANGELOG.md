# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-02

### Added

#### Core Features
- ✨ Complete offline-first inventory management system
- 📦 Unlimited product storage
- 🔍 Fast search with indexed database queries
- 📊 Stock management with quick +/- adjustments
- 🎨 Visual stock indicators (color-coded: red/yellow/green)

#### Barcode Scanner
- 📷 Barcode scanner with support for multiple formats:
  - EAN-13, EAN-8
  - UPC-A, UPC-E
  - Code 128, Code 39, Code 93
  - Codabar, ITF-14
- ✨ Animated scan line
- ✅ Visual feedback (green checkmark)
- 📳 Haptic feedback (vibration)
- 🎯 Smart navigation (existing product vs. new product)

#### Photo Management
- 📸 Take photos with camera
- 🖼️ Select from photo library
- ✂️ 1:1 aspect ratio cropping
- 💾 Persistent storage in FileSystem
- 🗑️ Auto-cleanup when product deleted
- 🔄 Path mapping during restore

#### Backup & Export (Pro Features)
- 💾 Complete ZIP backup with:
  - All products data
  - All photos
  - Metadata manifest
- 📥 Restore from ZIP backup
- 📄 CSV export (Excel-compatible)
- 📑 PDF professional reports with:
  - Executive summary
  - Detailed product table
  - Branded design

#### In-App Purchases
- 💰 Pro Local ($2.99 one-time)
  - Local backups
  - CSV/PDF export
  - Restore functionality
- ☁️ Pro Cloud ($0.99/month or $9.99/year)
  - All Pro Local features
  - Cloud backup (future)
  - Cross-device sync (future)
- 🔄 Restore purchases
- 🔐 Feature gating
- 📱 Native purchase flows (iOS/Android)

#### UI/UX
- 🎨 Clean, modern interface
- 🌙 Automatic dark mode support
- ⚡ Pull-to-refresh
- 📱 Responsive design
- ⌨️ Proper keyboard handling
- 🔄 Loading states for all actions
- ❌ Error handling with user-friendly messages
- ✅ Success confirmations

#### Technical
- 💪 TypeScript strict mode
- 🗄️ SQLite with WAL mode
- 📊 Optimized database indexes
- 🔍 Repository pattern for data access
- 🎯 Clean architecture
- 📦 Zustand for state management
- 🎨 NativeWind (TailwindCSS)

### Documentation
- 📚 Comprehensive README.md
- 📖 IAP setup guide
- 🤝 Contributing guidelines
- 📄 MIT License
- 📝 Changelog

### Known Limitations
- Cloud backup requires backend (planned for V1.1)
- No multi-user support (planned for V2.0)
- No product categories (planned for V1.2)

---

## [Unreleased]

### Planned for V1.1
- [ ] Cloud backend API
- [ ] Manual cloud backup/restore
- [ ] Account creation with Apple/Google Sign-In

### Planned for V1.2
- [ ] Automatic daily cloud backups
- [ ] Version history management
- [ ] Product categories
- [ ] Low stock alerts

### Planned for V2.0
- [ ] Multi-store support
- [ ] Advanced reporting
- [ ] Web dashboard
- [ ] Real-time sync
- [ ] Team collaboration

---

## Version History

- **1.0.0** - Initial release (2026-01-02)

---

[1.0.0]: https://github.com/yourusername/scanstock/releases/tag/v1.0.0
[Unreleased]: https://github.com/yourusername/scanstock/compare/v1.0.0...HEAD
