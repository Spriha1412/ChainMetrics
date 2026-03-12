# ChainMetrics

A production-style cryptocurrency tracking web app inspired by CoinMarketCap, with a cleaner architecture and a premium beige/brown UI.

## Stack

- React (Vite) frontend
- Plain CSS styling
- Node.js + Express backend
- CoinGecko public API integration
- Axios for HTTP requests

## Features

- Live market table (rank, logo, name, symbol, price, 24h change, market cap, volume, sparkline)
- Auto refresh every 45 seconds
- Instant search
- Coin detail pages with charts for 24h, 7d, 30d
- Watchlist stored in Local Storage
- Trending coins section
- Top gainers and losers
- Portfolio tracker (local)
- Price alerts (local, auto-evaluated)
- Loading skeleton animations
- Light/Dark beige mode toggle
- Responsive sticky-navbar layout
- Backend caching to reduce API load and avoid rate-limit pressure

## Project Structure

```
cryptotracker/
├── client/   # React frontend
└── server/   # Express backend
```

## Backend API Routes

- `GET /api/coins`
- `GET /api/coin/:id`
- `GET /api/coin/:id/chart`
- `GET /api/trending`
- `GET /api/markets`
- `GET /api/health`

## Setup

1. Install dependencies:

```bash
cd /Users/jaipandey/Desktop/cryptotracker
npm install
cd client && npm install
cd ../server && npm install
```

2. Configure backend env (optional):

```bash
cd /Users/jaipandey/Desktop/cryptotracker/server
cp .env.example .env
```

Add `COINGECKO_API_KEY` in `.env` if you have one.

## Run

From project root:

```bash
cd /Users/jaipandey/Desktop/cryptotracker
npm start
```

This starts:

- Backend on `http://localhost:5001`
- Frontend on `http://localhost:5173`

## Notes

- Watchlist, portfolio, and alerts are persisted in browser Local Storage.
- Backend responses are cached in-memory with short TTLs for fast refresh and API protection.
