# BUZR — Event Phone Restriction App

> Engineering Final Project · React Native / Expo

BUZR automatically restricts non-essential phone functions while you are inside a registered live event venue, using GPS proximity, event time windows, and optional ticket-gate activation.

---

## What You Will Need (Prerequisites)

| Tool | Where to get it | Notes |
|---|---|---|
| **Node.js 18+** | https://nodejs.org → "LTS" download | Required to install packages and run the dev server |
| **Expo Go** (iOS) | App Store — search "Expo Go" | Free app by Expo — lets you run the app on your iPhone without a build step |
| **Expo Go** (Android) | Google Play — search "Expo Go" | Same, for Android phones |

You do **not** need Xcode, Android Studio, or any other developer tools to preview the app.

---

## Step 1 — Get the Code

Open a terminal on your computer and run:

```bash
git clone https://github.com/landonaubuchon/phone_restriction_app.git
cd phone_restriction_app
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This downloads all the libraries the app needs (takes about 1–2 minutes the first time).

---

## Step 3 — Start the Development Server

```bash
npx expo start
```

After a few seconds you will see a **QR code** printed in your terminal, like this:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## Step 4 — Open the App on Your Phone

### iPhone
1. Open the built-in **Camera** app.
2. Point it at the QR code in the terminal.
3. Tap the banner that appears at the top of the screen — "Open in Expo Go".

### Android
1. Open the **Expo Go** app.
2. Tap **"Scan QR code"**.
3. Point it at the QR code in the terminal.

The app will load on your phone in about 10–20 seconds.

---

## Step 5 — Navigating the App

When the app first opens you will land on the **Welcome / Consent screen**.

![Welcome screen](https://github.com/user-attachments/assets/2c3ae9b2-be7b-47c0-8a73-f03b419aa1ed)

Tap **Accept & Continue** to proceed.

---

### The 5 Tabs at the Bottom

| Tab | Icon | What it does |
|---|---|---|
| **BUZR** | 🔒 lock | Main home screen — the shot clock countdown, quick actions, emergency apps, notifications |
| **Camera** | 📷 | Take photos; 15-minute per-event time limit with a colour progress bar |
| **Phone** | 📞 | Dial pad that opens your phone's native call screen |
| **Messages** | 💬 | Thread list that opens your native SMS app |
| **Ticket** | 🎟️ | Your event tickets with barcode; tap "Activate at Gate" when you scan in at the venue |

---

### Screen-by-Screen Tour

**BUZR Home (Shot Clock)**
The square red clock counts down to your next event restriction window, NBA shot-clock style.
Tap the four quick-action buttons to jump to Flashlight, Emergency Apps, Event List, or your Profile.

**Camera**
Point and shoot. The green bar at the top shows how much of your 15-minute event allowance remains. When it hits zero the camera locks until the event ends.

**Phone**
Full keypad. Tap the green call button to hand off to your device's native dialer — calls always work, even during restrictions.

**Messages**
Lists your recent threads. Tap any thread to open it in your native SMS app — messaging always works during restrictions.

**Ticket**
Shows your registered event tickets. At the venue entrance, tap **"Activate at Gate"** — this confirms you are inside and immediately starts BUZR restrictions without waiting for GPS.

**Flashlight** (accessible from the BUZR home quick-action grid)
One-tap torch toggle that works at all times, including during active restrictions.

**Emergency Apps** (accessible from BUZR home or Profile)
Toggle medical/safety apps (glucose monitor, heart-rate monitor, etc.) that you need during events. Toggled apps are always available even when other apps are restricted.

**Simulation** (accessible from BUZR home header)
Run scripted scenarios to see how the restriction engine behaves at different GPS distances, time phases, and ticket-activation states.

---

## Permissions the App Will Request

| Permission | Why |
|---|---|
| **Location** | Detects whether you are within the venue's building footprint |
| **Camera** | Powers the Camera tab and Flashlight tab |

Both are optional — the app falls back to time-only mode if location is denied.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| QR code does not scan | Make sure your phone and computer are on the **same Wi-Fi network** |
| "Network response timed out" in Expo Go | Restart the server with `npx expo start --tunnel` |
| Module not found error | Run `npm install` again, then `npx expo start --clear` |
| Camera permission denied | Go to Settings → BUZR → allow Camera |
| Location permission denied | Go to Settings → BUZR → allow Location (restrictions fall back to time-only mode) |
