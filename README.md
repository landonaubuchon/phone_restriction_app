# BUZR Phone Restriction App

A React Native (Expo) iOS app that enables venue-based phone restriction with in-app messaging, contacts access, and an admin map interface.

## Features

### 🎨 BUZR Logo
Vibrant centered logo featuring a bold "B" letterform with an integrated lightning-bolt accent, rendered as an SVG for crisp display at all sizes.

### 👥 Contacts Import (with Consent)
- Displays BUZR's own consent dialog before requesting OS permissions
- Requests `expo-contacts` permission to access the device contact list
- Searches and filters imported contacts
- One-tap "Message" button to start an in-app thread with any contact

### 💬 In-App Messaging
- View and compose messages without leaving the app
- **Import from iOS Messages** – imports existing conversation threads so users don't need to re-enter contacts
- In-app message composer using `expo-sms` (uses native `MessageUI` framework on iOS – no app-switching required)
- New conversation prompt for texting outside users by phone number

### 🗺️ Admin Map
- Interactive map powered by `react-native-maps`
- **Long-press** anywhere on the map to drop a venue pin
- Adjustable proximity radius (50 m – 5 km) shown as a circle overlay
- "Start Event at Pin" modal to name the event and engage BUZR Lock
- Active event banner with one-tap "End Event" control

### 🔒 BUZR Lock (LockDown Browser-style)
- Full-screen lock overlay when a venue event is active
- **Android**: hardware back button intercepted via `BackHandler`
- **iOS**: integrates with `expo-keep-awake` to keep display on; native Guided Access / MDM kiosk mode can be layered on top via a custom dev-client build
- Lock can only be released by the admin (via Admin Map "End Event" or the admin PIN override)
- In-app messaging remains available while locked

## Project Structure

```
buzr-app/
├── App.js                          # Root – navigation + VenueProvider
├── app.json                        # Expo config with iOS permissions
├── src/
│   ├── components/
│   │   └── BuzrLogo.js             # SVG logo component
│   ├── context/
│   │   └── VenueContext.js         # Shared venue/lock state
│   └── screens/
│       ├── HomeScreen.js           # Centered logo + nav tiles
│       ├── ContactsScreen.js       # Contacts import + search
│       ├── MessagesScreen.js       # Thread list + in-app chat
│       ├── AdminMapScreen.js       # Map with pin + proximity
│       └── LockStatusScreen.js     # Lock overlay
```

## Getting Started

```bash
cd buzr-app
npm install
npm run ios      # Requires macOS + Xcode
# or
npm run start    # Scan with Expo Go
```
