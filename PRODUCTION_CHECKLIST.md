# 🚀 ScanStock - Production Checklist

Complete checklist for launching ScanStock to App Store and Google Play.

---

## 📋 Pre-Launch Checklist

### ✅ Phase 1: Code & Documentation (COMPLETED)

- [x] All V1 features implemented
- [x] TypeScript strict mode enabled
- [x] Database schema optimized with indexes
- [x] Error handling implemented
- [x] Loading states for all async operations
- [x] README.md with complete documentation
- [x] IAP_SETUP.md guide
- [x] CONTRIBUTING.md
- [x] LICENSE file
- [x] CHANGELOG.md
- [x] .gitignore configured

---

### 🎨 Phase 2: Assets & Branding

#### App Icon (REQUIRED)
- [ ] Design app icon (1024x1024px)
- [ ] Export at required sizes:
  - iOS: 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt (@1x, @2x, @3x)
  - Android: 48dp, 72dp, 96dp, 144dp, 192dp
- [ ] Use transparent background for iOS (or solid color)
- [ ] Test icon on different backgrounds
- [ ] Save as `assets/icon.png`

**Tool recommendations:**
- Figma, Sketch, Adobe Illustrator
- Use [makeappicon.com](https://makeappicon.com) for size generation

#### Splash Screen (REQUIRED)
- [ ] Design splash screen (1242x2688px for iPhone)
- [ ] Use brand colors (#4f46e5 - primary blue)
- [ ] Include app logo/name
- [ ] Keep it simple and fast-loading
- [ ] Save as `assets/splash-icon.png`

**Current config in app.json:**
```json
"splash": {
  "image": "./assets/splash-icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#1a1a2e"
}
```

#### Screenshots (REQUIRED - Minimum 3, Recommended 5)

**iOS Requirements:**
- iPhone (6.5" display): 1242 x 2688 pixels
- iPhone (5.5" display): 1242 x 2208 pixels
- iPad Pro: 2048 x 2732 pixels

**Android Requirements:**
- Phone: 1080 x 1920 pixels minimum
- Tablet (optional): 1920 x 1080 pixels

**Screenshots to capture:**
1. [ ] **Main inventory screen** (with products, search bar)
2. [ ] **Barcode scanner** (in action with scan frame)
3. [ ] **Product detail** (showing photo, price, stock controls)
4. [ ] **Backup screen** (showing Pro features)
5. [ ] **Create/Edit product** (with photo picker)

**Tips:**
- Use actual data, not lorem ipsum
- Show the app looking good with 5-10 realistic products
- Highlight key features in each screenshot
- Consider adding text overlays explaining features
- Use device frames for marketing

#### Feature Graphic (Android REQUIRED)
- [ ] Design feature graphic (1024 x 500px)
- [ ] Highlight main value proposition
- [ ] Include app name and tagline
- [ ] Use brand colors

#### App Preview Video (OPTIONAL - Highly Recommended)
- [ ] Record 15-30 second demo
- [ ] Show: scan → add product → backup
- [ ] Max size: 500 MB
- [ ] Formats: MOV, M4V, MP4

---

### 📱 Phase 3: App Store Connect (iOS)

#### Account Setup
- [ ] Apple Developer Account ($99/year)
- [ ] Payment and Tax info configured
- [ ] Agreements accepted

#### App Creation
- [ ] Create new app in App Store Connect
- [ ] App Information:
  - **Name**: ScanStock
  - **Bundle ID**: com.scanstock.app
  - **SKU**: scanstock-v1
  - **Primary Language**: English

#### App Details
- [ ] **Subtitle** (30 chars max):
  ```
  Inventory & Price List
  ```

- [ ] **Description** (4000 chars max):
  ```
  ScanStock is the simplest way to manage your inventory.
  Built for small businesses, markets, and shops.

  WORKS COMPLETELY OFFLINE
  No internet required. Your data stays on your device.

  KEY FEATURES:
  • Barcode Scanner - Scan products instantly
  • Product Photos - Visual identification
  • Stock Management - Quick +/- adjustments
  • Fast Search - Find anything in seconds
  • Color-coded Alerts - Low stock warnings

  PRO FEATURES:
  Upgrade to Pro Local ($2.99 one-time) for:
  • Complete Backups (ZIP with all photos)
  • Restore on any device
  • CSV Export (Excel compatible)
  • PDF Reports (Professional)

  Upgrade to Pro Cloud ($0.99/month) for:
  • Automatic Cloud Backup
  • Cross-device Sync
  • Version History
  • 100 MB Cloud Storage

  PERFECT FOR:
  • Small retail stores
  • Market vendors
  • Online sellers
  • Warehouse managers
  • Anyone tracking inventory

  PRIVACY FIRST:
  Your data never leaves your device unless you choose
  Pro Cloud. No tracking, no ads, no surprises.

  Download ScanStock today and take control of your inventory!
  ```

- [ ] **Keywords** (100 chars max):
  ```
  inventory,barcode,scanner,stock,price,catalog,business,retail,warehouse
  ```

- [ ] **Promotional Text** (170 chars - can be updated anytime):
  ```
  Now with complete backup & restore! Export to CSV and PDF.
  Upgrade to Pro and never lose your data again.
  ```

- [ ] **Support URL**: https://scanstock.app/support
- [ ] **Marketing URL**: https://scanstock.app

#### Privacy & Compliance
- [ ] Privacy Policy URL: **REQUIRED**
  - Create at: https://www.freeprivacypolicy.com
  - Host at: https://scanstock.app/privacy

- [ ] **Privacy Practices** declaration:
  - [ ] We do NOT collect data
  - [ ] Camera (for barcode scanning and photos)
  - [ ] Photo Library (for product images)
  - [ ] All data stored locally

- [ ] Age Rating: 4+ (no sensitive content)

#### Pricing & Availability
- [ ] Price: Free
- [ ] Availability: All territories
- [ ] Pre-orders: No

#### In-App Purchases (CRITICAL)
- [ ] Create IAP products (see IAP_SETUP.md):
  1. [ ] Pro Local (Non-Consumable)
     - Product ID: `com.scanstock.app.pro_local`
     - Reference Name: Pro Local
     - Price: $2.99 USD
     - Localize in major languages

  2. [ ] Pro Cloud Monthly (Auto-Renewable Subscription)
     - Product ID: `com.scanstock.app.pro_cloud_monthly`
     - Subscription Group: Pro Cloud
     - Price: $0.99 USD / month
     - Free trial: 7 days (optional)

  3. [ ] Pro Cloud Yearly (Auto-Renewable Subscription)
     - Product ID: `com.scanstock.app.pro_cloud_yearly`
     - Subscription Group: Pro Cloud
     - Price: $9.99 USD / year

- [ ] Configure subscription group details
- [ ] Add intro offers (optional 7-day free trial)
- [ ] Submit IAPs for review

#### Build & Submit
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Configure build: `eas build:configure`
- [ ] Create production build:
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Upload screenshots (all required sizes)
- [ ] Set version: 1.0.0 (Build 1)
- [ ] Submit for review

#### Review Information
- [ ] Contact Information (your details)
- [ ] Demo Account (if login required - N/A for us)
- [ ] Notes for Reviewer:
  ```
  ScanStock is an offline-first inventory management app.

  To test:
  1. Tap + to add a product
  2. Use Scanner tab to scan barcodes (or skip)
  3. Tap Settings → Backup & Export to see Pro features

  For IAP testing:
  - Products are free in sandbox
  - All features work offline
  - No server/backend required for V1

  Thank you!
  ```

---

### 🤖 Phase 4: Google Play Console (Android)

#### Account Setup
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Payment profile set up
- [ ] Tax info configured

#### App Creation
- [ ] Create new app
- [ ] App Details:
  - **App name**: ScanStock
  - **Default language**: English (United States)
  - **App or Game**: App
  - **Free or Paid**: Free

#### Store Listing
- [ ] **Short description** (80 chars max):
  ```
  Simple offline inventory management with barcode scanner & backup
  ```

- [ ] **Full description** (4000 chars max):
  ```
  ScanStock - Your Pocket Inventory Manager

  Manage your inventory completely offline. Perfect for small
  businesses, market vendors, and online sellers.

  ✨ KEY FEATURES

  📷 BARCODE SCANNER
  Scan products instantly with support for all major formats:
  EAN-13, UPC, Code 128, and more.

  📦 INVENTORY MANAGEMENT
  • Unlimited products
  • Quick stock adjustments (+/-)
  • Product photos
  • Fast search
  • Color-coded stock alerts

  🔒 PRIVACY FIRST
  All your data stays on your device. No cloud required
  unless you choose it.

  💾 PRO FEATURES

  Upgrade to Pro Local ($2.99 one-time):
  • Complete backups (ZIP with photos)
  • Restore on any device
  • CSV export (Excel compatible)
  • PDF professional reports

  Upgrade to Pro Cloud ($0.99/month):
  • All Pro Local features
  • Automatic cloud backup
  • Cross-device sync
  • Version history
  • 100 MB cloud storage

  🎯 PERFECT FOR
  • Retail stores
  • Market vendors
  • E-commerce sellers
  • Warehouse managers
  • Anyone managing inventory

  ⚡ WHY SCANSTOCK?
  • Works 100% offline
  • Fast and simple
  • No subscription required (Free forever)
  • Affordable Pro options
  • Professional features

  Download now and take control of your inventory!
  ```

- [ ] **Screenshots**: Upload 2-8 screenshots
- [ ] **Feature graphic**: 1024 x 500px
- [ ] **App icon**: 512 x 512px (auto-generated from assets)

#### Categorization
- [ ] **App category**: Business
- [ ] **Tags**: inventory, barcode, scanner, business
- [ ] **Content rating**: Everyone

#### Store Settings
- [ ] **Contact details**:
  - Email: support@scanstock.app
  - Phone: (optional)
  - Website: https://scanstock.app

- [ ] **Privacy Policy**: https://scanstock.app/privacy

#### In-App Products
- [ ] Create products (see IAP_SETUP.md):
  1. [ ] Pro Local
     - Product ID: `com.scanstock.app.pro_local`
     - Price: $2.99 USD
     - Status: Active

  2. [ ] Pro Cloud Monthly
     - Product ID: `com.scanstock.app.pro_cloud_monthly`
     - Base plan: $0.99/month
     - Billing period: Monthly
     - Free trial: 7 days (optional)
     - Status: Active

  3. [ ] Pro Cloud Yearly
     - Product ID: `com.scanstock.app.pro_cloud_yearly`
     - Base plan: $9.99/year
     - Billing period: Yearly
     - Status: Active

#### Build & Release
- [ ] Create production build:
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Create internal testing release first
- [ ] Test with internal track
- [ ] Promote to production when ready
- [ ] Set rollout percentage (start with 10%, then 50%, then 100%)

---

### 🧪 Phase 5: Testing

#### Device Testing
- [ ] **iOS Real Device**:
  - [ ] iPhone 13/14/15
  - [ ] iPad (if supporting tablets)
  - [ ] Test all features
  - [ ] Test IAP in sandbox

- [ ] **Android Real Device**:
  - [ ] Samsung/Google Pixel
  - [ ] Tablet (if supporting)
  - [ ] Test all features
  - [ ] Test IAP in internal track

#### Feature Testing Checklist
- [ ] Create product (with photo)
- [ ] Create product (without photo)
- [ ] Edit product (change photo)
- [ ] Edit product (remove photo)
- [ ] Delete product (verify photo deleted)
- [ ] Scan barcode (existing product)
- [ ] Scan barcode (new product)
- [ ] Search products
- [ ] Adjust stock (+/-)
- [ ] Create backup ZIP
- [ ] Restore backup ZIP
- [ ] Export CSV (verify format)
- [ ] Export PDF (verify layout)
- [ ] Purchase Pro Local (sandbox)
- [ ] Restore purchase
- [ ] Kill app and reopen (verify persistence)
- [ ] Fill database with 100+ products (test performance)
- [ ] Test with poor network (should work offline)
- [ ] Test airplane mode

#### IAP Testing
- [ ] **iOS Sandbox**:
  - [ ] Create sandbox test user
  - [ ] Sign out of App Store
  - [ ] Test purchase flow
  - [ ] Verify plan updates
  - [ ] Test restore purchases

- [ ] **Android Internal Testing**:
  - [ ] Add test account
  - [ ] Join internal track
  - [ ] Test purchase flow
  - [ ] Test with test cards
  - [ ] Verify plan updates

#### Bug Fixing
- [ ] Fix all critical bugs
- [ ] Fix all major bugs
- [ ] Document known minor bugs
- [ ] Update CHANGELOG.md

---

### 📄 Phase 6: Legal & Compliance

#### Privacy Policy (REQUIRED)
- [ ] Create privacy policy
- [ ] Cover these points:
  - Data we collect (camera, photos - local only)
  - How data is used (local storage only)
  - Data sharing (none for Free/Pro Local)
  - Cloud data (for Pro Cloud users)
  - User rights
  - Contact information

- [ ] Host at: https://scanstock.app/privacy
- [ ] Update link in app.json
- [ ] Link in App Store Connect
- [ ] Link in Google Play Console

#### Terms of Service (Recommended)
- [ ] Create terms of service
- [ ] Cover subscription terms
- [ ] Cancellation policy
- [ ] Refund policy
- [ ] Host at: https://scanstock.app/terms

#### Support Infrastructure
- [ ] Create support email: support@scanstock.app
- [ ] Set up auto-responder
- [ ] Create FAQ page
- [ ] Create contact form (optional)

---

### 🌐 Phase 7: Web Presence (Optional but Recommended)

#### Landing Page
- [ ] Domain: scanstock.app
- [ ] Simple landing page with:
  - App description
  - Screenshots
  - Download badges (App Store, Play Store)
  - Features list
  - Pricing
  - Contact info

- [ ] Tools: Webflow, Framer, or simple HTML

#### Social Media (Optional)
- [ ] Twitter: @scanstock_app
- [ ] Instagram: @scanstock_app
- [ ] Facebook page
- [ ] Set up basic branding

---

### 🚀 Phase 8: Launch

#### Pre-Launch
- [ ] Final build with correct version (1.0.0)
- [ ] All screenshots uploaded
- [ ] All store details finalized
- [ ] IAP products approved
- [ ] Privacy policy live
- [ ] Support email working

#### iOS Launch
- [ ] Submit for review
- [ ] Wait for approval (1-3 days typical)
- [ ] Set release date (manual or automatic)
- [ ] Monitor for rejections
- [ ] Respond to any feedback from Apple

#### Android Launch
- [ ] Submit to production
- [ ] Start with 10% rollout
- [ ] Monitor crash reports
- [ ] Increase to 50% after 24h
- [ ] Increase to 100% after 48h

#### Post-Launch
- [ ] Monitor reviews
- [ ] Respond to user feedback
- [ ] Track downloads
- [ ] Monitor crash reports (Sentry/Crashlytics)
- [ ] Plan V1.1 updates

---

### 📊 Phase 9: Marketing (Optional)

#### Launch Announcement
- [ ] Product Hunt launch
- [ ] Hacker News post
- [ ] Reddit communities (r/entrepreneur, r/smallbusiness)
- [ ] Twitter announcement
- [ ] LinkedIn post

#### Content Marketing
- [ ] Write blog post about building ScanStock
- [ ] Create tutorial videos
- [ ] Share on indie hacker communities

---

## 🎯 Priority Checklist (Do This First)

### Critical Path to Launch:

1. **Assets** (1-2 days)
   - [ ] App icon
   - [ ] Splash screen
   - [ ] 5 screenshots

2. **Legal** (1 day)
   - [ ] Privacy policy
   - [ ] Terms of service
   - [ ] Support email

3. **App Store Connect** (2 hours)
   - [ ] Create app
   - [ ] Configure IAP
   - [ ] Upload screenshots
   - [ ] Write descriptions

4. **Google Play Console** (2 hours)
   - [ ] Create app
   - [ ] Configure IAP
   - [ ] Upload screenshots
   - [ ] Write descriptions

5. **Build** (1 hour)
   - [ ] iOS production build
   - [ ] Android production build

6. **Test** (2-3 days)
   - [ ] Test on real devices
   - [ ] Test IAP in sandbox/internal
   - [ ] Fix critical bugs

7. **Submit** (1 hour)
   - [ ] Submit iOS for review
   - [ ] Submit Android to production

8. **Wait** (1-7 days)
   - [ ] iOS review: 1-3 days
   - [ ] Android review: Usually instant
   - [ ] Monitor status

---

## ✅ Launch Criteria

**DO NOT launch until:**
- [x] All V1 features working
- [ ] Tested on real devices
- [ ] IAP working in sandbox/test
- [ ] No critical bugs
- [ ] Privacy policy live
- [ ] Support email set up
- [ ] All store assets ready

---

## 📞 Support

Need help? Resources:
- Expo docs: https://docs.expo.dev
- App Store Connect: https://developer.apple.com/help/app-store-connect/
- Google Play Console: https://support.google.com/googleplay/android-developer/

---

**Last Updated**: 2026-01-02
**Version**: 1.0.0
