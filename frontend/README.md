# FDR SmartTrack – Frontend Web Application

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

The frontend client for **FDR SmartTrack**, delivering a responsive, real-time interface for regulatory deposit management, interactive OCR discrepancy comparisons, maturity calendars, and live guided application tours.

---

## 🎨 User Experience & Features

* **Role-Adaptive Interface**: Automatically adjusts navigation, action buttons, and summaries based on user role (`admin`, `official`, or `institution`).
* **Interactive Verification Queue**: Official review screen featuring side-by-side OCR certificate preview, highlighted discrepancy badges, and instant approval/rejection modal.
* **Maturity Tracker & Visual Alerts**: Real-time maturity status meters, countdown days, and color-coded expiration urgency indicators.
* **Live Product Tour Overlay**: Built-in step-by-step interactive walkthrough (`TourContext`) demonstrating system capabilities to new stakeholders.
* **Analytics & Graphs**: Recharts-powered distribution breakdowns by bank, portfolio value, and renewal velocity.

---

## 📁 Source Code Organization

```text
frontend/src/
├── assets/                 # Graphics, icons, logos
├── components/
│   ├── common/             # Modal dialogs, StatsCard, StatusBadge, Tables
│   ├── demo/               # LiveAppTourOverlay, VirtualCursor, demo scene data
│   └── layout/             # Top Navbar, responsive Sidebar, App Shell Layout
├── context/
│   ├── AuthContext.tsx     # JWT token lifecycle, login/logout, user permissions
│   └── TourContext.tsx     # Interactive tour state management
├── pages/
│   ├── AuditTrail.tsx      # Immutable system log inspection & filters
│   ├── Dashboard.tsx       # Role-specific analytics, KPIs, and recent activities
│   ├── FDRCreate.tsx       # Deposit submission form with file upload
│   ├── FDRDetail.tsx       # Comprehensive deposit view, history, OCR inspection
│   ├── FDRList.tsx         # Searchable, filterable deposit registry
│   ├── LiveDemo.tsx        # Self-running demo showcase with scripted scenarios
│   ├── Login.tsx           # Authentication portal with 1-click test credentials
│   ├── MaturityTracker.tsx # Deposit countdown & timeline calendar
│   ├── Releases.tsx        # Release request review & approval workflow
│   ├── Renewals.tsx        # Deposit renewal petition pipeline
│   ├── Reports.tsx         # Compliance summaries & PDF/Excel export triggers
│   └── VerificationQueue.tsx # Regulatory verification queue with OCR diffs
├── services/
│   └── api.ts              # Axios interceptors, JWT refresh, typed API endpoints
├── types/
│   └── index.ts            # TypeScript data models and interfaces
├── App.tsx                 # Client routing with role-based Route Guards
├── index.css               # Design tokens, typography, glassmorphism utilities
└── main.tsx                # React root bootstrap
```

---

## ⚙️ Environment Configuration

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Production Backend API URL | `https://fdr-smarttrack-backend.onrender.com/api/v1` |

> *In local development, if `VITE_API_BASE_URL` is omitted, requests default to `/api/v1` and are proxied automatically via `vite.config.ts` to `http://127.0.0.1:8000`.*

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite dev server with Hot Module Replacement (HMR)
npm run dev

# 3. Production build & type check
npm run build
```
