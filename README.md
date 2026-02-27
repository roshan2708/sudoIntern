# 🚀 sudoIntern

A production-ready **internship discovery** mobile application built with **React Native**, **Expo**, **TypeScript**, **Firebase**, and **Zustand**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Email/password registration, login, logout, persistent session |
| 🏠 **Internship Feed** | Live data from Remotive API with pull-to-refresh & infinite scroll |
| 🔍 **Search & Filter** | Search internships + filter by category |
| 📄 **Detail View** | Full job description, company details, apply & save buttons |
| ❤️ **Save Internships** | Persist to Firestore with optimistic UI updates |
| 📊 **Application Tracker** | Track application status (Applied/Interview/Rejected/Selected) |
| 📈 **Analytics Dashboard** | Visual stats of your applications |
| 👤 **Profile** | Update name, skills, GitHub, LinkedIn |
| 💀 **Skeleton Loaders** | Animated loading states |

---

## 🛠 Tech Stack

- **Framework:** React Native + Expo (SDK 55)
- **Routing:** Expo Router (file-based, app directory)
- **Language:** TypeScript (strict mode)
- **State:** Zustand
- **Backend:** Firebase (Auth + Firestore, Modular SDK v9+)
- **API Calls:** Axios
- **Styling:** StyleSheet (no inline styles)

---

## 📁 Project Structure

```
sudoIntern/
├── app/
│   ├── _layout.tsx          # Root layout (auth guard)
│   ├── index.tsx            # Entry redirect
│   ├── (auth)/
│   │   ├── _layout.tsx      # Auth stack
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Bottom tabs
│   │   ├── home.tsx         # Internship feed
│   │   ├── saved.tsx        # Saved internships
│   │   ├── applications.tsx # Application tracker
│   │   └── profile.tsx      # User profile
│   └── internship/
│       └── [id].tsx         # Internship detail
├── src/
│   ├── api/                 # Axios client & API services
│   ├── components/          # Reusable UI components
│   ├── constants/           # Theme, colors, spacing
│   ├── firebase/            # Firebase config & services
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   └── utils/               # Utility helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npx expo`)
- A Firebase project

### 1. Install Dependencies

```bash
cd sudoIntern
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Email/Password sign-in method
4. Enable **Cloud Firestore** in production/test mode
5. Go to **Project Settings** → **General** → scroll to "Your apps" → add a **Web app**
6. Copy the `firebaseConfig` object
7. Replace the placeholder values in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 3. Firestore Rules (Development)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{subcollection}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 4. Run the App

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan QR with Expo Go.

---

## 📱 Firestore Data Model

```
users/{uid}
  ├── name: string
  ├── email: string
  ├── skills: string[]
  ├── github: string
  ├── linkedin: string
  └── createdAt: string

users/{uid}/saved/{internshipId}
  ├── internship: Internship
  └── savedAt: string

users/{uid}/applications/{applicationId}
  ├── internshipId: number
  ├── internship: Internship
  ├── status: 'Applied' | 'Interview' | 'Rejected' | 'Selected'
  └── appliedAt: string
```

---

## 📝 License

MIT
# sudoIntern
