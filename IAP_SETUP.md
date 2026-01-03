# In-App Purchase Setup Guide

This document describes how to configure In-App Purchases for ScanStock in App Store Connect and Google Play Console.

## Product IDs

All product IDs follow the format: `com.scanstock.app.{product_name}`

### Products to Create

#### 1. Pro Local (One-time Purchase)

**Product ID**: `com.scanstock.app.pro_local`

**Type**:
- iOS: Non-Consumable
- Android: One-Time Product

**Pricing**:
- USD: $2.99
- Localized pricing as appropriate

**Display Information**:
- **Name**: ScanStock Pro Local
- **Description**: Unlock local backup and export features. Create backups, restore your data, and export to CSV/PDF.

**Features**:
- Local backup to file
- Restore from backup
- Export to CSV
- Export to PDF
- Unlimited products

---

#### 2. Pro Cloud Monthly (Auto-Renewable Subscription)

**Product ID**: `com.scanstock.app.pro_cloud_monthly`

**Type**:
- iOS: Auto-Renewable Subscription
- Android: Subscription

**Pricing**:
- USD: $0.99/month
- Localized pricing as appropriate

**Subscription Duration**: 1 month

**Display Information**:
- **Name**: ScanStock Pro Cloud (Monthly)
- **Description**: All Pro Local features plus automatic cloud backup, cross-device sync, and version history.

**Features**:
- All Pro Local features
- Automatic cloud backup
- Restore on any device
- Version history
- 100 MB cloud storage

---

#### 3. Pro Cloud Yearly (Auto-Renewable Subscription)

**Product ID**: `com.scanstock.app.pro_cloud_yearly`

**Type**:
- iOS: Auto-Renewable Subscription
- Android: Subscription

**Pricing**:
- USD: $9.99/year (Save 17%)
- Localized pricing as appropriate

**Subscription Duration**: 1 year

**Display Information**:
- **Name**: ScanStock Pro Cloud (Yearly)
- **Description**: All Pro Local features plus automatic cloud backup, cross-device sync, and version history. Best value!

**Features**:
- All Pro Local features
- Automatic cloud backup
- Restore on any device
- Version history
- 100 MB cloud storage

---

## iOS Setup (App Store Connect)

### Prerequisites
1. Apple Developer Account
2. App created in App Store Connect
3. Bundle ID: `com.scanstock.app`

### Steps

1. **Navigate to App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Select your app (ScanStock)

2. **Create In-App Purchases**
   - Go to Features → In-App Purchases
   - Click the "+" button to create new products

3. **For Pro Local (Non-Consumable)**:
   - Select "Non-Consumable"
   - Reference Name: `Pro Local`
   - Product ID: `com.scanstock.app.pro_local`
   - Add pricing ($2.99)
   - Add localizations
   - Upload screenshot (optional)
   - Submit for review

4. **For Pro Cloud Subscriptions**:
   - Create Subscription Group: `Pro Cloud`
   - Create two subscriptions:
     - Monthly: `com.scanstock.app.pro_cloud_monthly`
     - Yearly: `com.scanstock.app.pro_cloud_yearly`
   - Configure pricing
   - Add localizations
   - Configure subscription details:
     - Subscription Group Display Name: "Pro Cloud"
     - Review information
   - Submit for review

5. **Important Settings**:
   - ✅ Enable "Family Sharing" for subscriptions
   - ✅ Set subscription renewal to "Auto-renewable"
   - ✅ Configure intro offers if desired (e.g., 7-day free trial)

---

## Android Setup (Google Play Console)

### Prerequisites
1. Google Play Developer Account
2. App created in Google Play Console
3. Package name: `com.scanstock.app`

### Steps

1. **Navigate to Google Play Console**
   - Go to https://play.google.com/console
   - Select your app (ScanStock)

2. **Create In-App Products**
   - Go to Monetize → Products → In-app products
   - Click "Create product"

3. **For Pro Local (One-Time Product)**:
   - Product ID: `com.scanstock.app.pro_local`
   - Name: `ScanStock Pro Local`
   - Description: (same as above)
   - Default price: $2.99 USD
   - Set pricing template
   - Activate product

4. **Create Subscriptions**:
   - Go to Monetize → Products → Subscriptions
   - Click "Create subscription"

5. **For Pro Cloud Monthly**:
   - Product ID: `com.scanstock.app.pro_cloud_monthly`
   - Name: `ScanStock Pro Cloud (Monthly)`
   - Description: (same as above)
   - Billing period: 1 month
   - Default price: $0.99 USD
   - Free trial: Optional (e.g., 7 days)
   - Grace period: 3 days (recommended)
   - Activate subscription

6. **For Pro Cloud Yearly**:
   - Product ID: `com.scanstock.app.pro_cloud_yearly`
   - Name: `ScanStock Pro Cloud (Yearly)`
   - Description: (same as above)
   - Billing period: 1 year
   - Default price: $9.99 USD
   - Activate subscription

7. **Important Settings**:
   - ✅ Enable "Account hold" for subscriptions
   - ✅ Configure "Grace period" (3-7 days)
   - ✅ Set up base plans and offers

---

## Testing

### iOS TestFlight
1. Create a Sandbox Test User in App Store Connect
2. Sign out of your Apple ID on the test device
3. Install app via TestFlight
4. Attempt purchase - sign in with sandbox account when prompted
5. Purchases are free in sandbox

### Android Internal Testing
1. Add test users in Google Play Console
2. Join internal testing track
3. Install app from Play Store (internal track)
4. Purchases use test cards automatically
5. Use test card: 4242 4242 4242 4242

---

## Important Notes

### For Both Platforms:
- ✅ Products must be approved before going live
- ✅ Test thoroughly in sandbox/internal testing
- ✅ Verify receipt validation works
- ✅ Test restore purchases functionality
- ✅ Ensure proper error handling

### Subscription Specific:
- Configure billing retry for failed payments
- Set up subscription notifications (webhooks)
- Handle subscription lifecycle events:
  - Renewal
  - Cancellation
  - Billing issue
  - Reactivation

### Legal Requirements:
- Privacy Policy URL (required for subscriptions)
- Terms of Service URL
- Clear subscription terms
- Cancellation policy

---

## Product ID Reference

Copy/paste these exact IDs when creating products:

```
com.scanstock.app.pro_local
com.scanstock.app.pro_cloud_monthly
com.scanstock.app.pro_cloud_yearly
```

---

## Support Resources

- **iOS IAP**: https://developer.apple.com/in-app-purchase/
- **Android Billing**: https://developer.android.com/google/play/billing
- **react-native-iap**: https://github.com/dooboolab-community/react-native-iap
