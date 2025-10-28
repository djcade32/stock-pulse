<p align="center">
  <img src="./public/stock_pulse_logo.png" alt="Stock Pulse Logo" width="180" />
</p>

<h1 align="center">🧠 Stock Pulse</h1>
<p align="center">
  <strong>AI-powered stock insight dashboard</strong> that analyzes and compares 10-Q filings, tracks watchlists, and provides real-time (30-second-delayed) market data — built for everyday investors who want institutional-grade clarity.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/React_Query-FF4154?logo=reactquery&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-593D88?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel" />
</p>

---

## 🌐 Overview

**Stock Pulse** makes financial analysis accessible, fast, and intelligent.
It uses AI to interpret and compare 10-Q filings, summarize sentiment and risk, and track watchlist performance in one seamless dashboard.

---

## ⚡️ Features

- 📊 **AI-Powered 10-Q Analysis & Comparison** — Compare filings between companies or quarters to reveal shifts in tone, risk, and guidance.
- 💼 **Watchlist Dashboard** — Track your favorite stocks with clean, real-time (30-second-delayed) quote updates.
- 📰 **Stock News Aggregation** — Stay updated with the latest headlines affecting your tracked companies.
- 🤖 **Sentiment Detection** — AI identifies tone, confidence, and risk signals in filings.
- 🔒 **Secure Authentication** — Sign in with Google, X (Twitter), or Email/Password via Firebase Auth.
- ☁️ **Data Persistence** — User preferences, watchlists, and settings stored securely with Firestore.
- 🧩 **Modern UI** — Fast, responsive, and designed for clarity and focus.
- 🚀 **Deployed on Vercel** for speed and reliability.

---

## 🧰 Tech Stack

| Category                    | Tools / Libraries                |
| --------------------------- | -------------------------------- |
| **Framework**               | Next.js (App Router)             |
| **Language**                | TypeScript                       |
| **State Management**        | Zustand                          |
| **Server/Client Data Sync** | TanStack React Query             |
| **Database & Auth**         | Firebase (Firestore, Auth)       |
| **Charts**                  | Recharts                         |
| **APIs**                    | Finnhub API (30s-delayed quotes) |
| **Deployment**              | Vercel                           |

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/djcade32/stock-pulse.git
cd stock-pulse
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory and add the following (replace values as needed):

```bash
# Client Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_WS_URL="ws://localhost:8081"
NEXT_PUBLIC_API_URL="http://localhost:8080"
NEXT_PUBLIC_FINNHUB_KEY=""

# Server Environment Variables
LOGO_DEV_API_KEY=""
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""
FINNHUB_KEY=""
OPENAI_API_KEY=""
SEC_USER_AGENT="StockPulse/1.0 (contact: your_email@example.com)"
```

> ⚠️ **Note:** Never commit your `.env.local` file.
> The Finnhub API key is public for free-tier data but should be proxied for production or paid tiers.

### 4. Run the Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 AI Insights

Stock Pulse uses proprietary AI models to:

- Parse and summarize SEC 10-Q filings
- Highlight sentiment, tone, and risk language
- Compare filings between companies or time periods
- Summarize MD&A and Risk Factors sections

---

## 🚀 Deployment

The app is deployed via **Vercel**.
Simply connect your GitHub repository and add the environment variables in your project settings.

---

## 🤝 Contributing

Pull requests are welcome!
If you’d like to contribute:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🌎 Portfolio

Built by **Norman Cade** — [View Portfolio →](https://normancadedev.netlify.app/)

---

## 💡 Future Roadmap

- 🎧 **Earnings Call Sentiment Analysis**
- 📱 **Mobile Optimization (PWA and responsive UI)**
- 📈 **Expanded Financial Metrics and Charts**
