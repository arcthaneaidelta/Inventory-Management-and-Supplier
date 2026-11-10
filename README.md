# SUPPLYFLOW

AI-Powered Supplier, Product Catalog & Inventory Automation Platform (Interactive Frontend Prototype).

## Tech Stack

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Router v7**
- **Recharts** & **Lucide Icons**

## Local Development

```bash
npm install
npm run dev
```

## Production Build & Netlify Hosting

This repository includes `netlify.toml` and `public/_redirects` pre-configured for Netlify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **SPA fallback:** `/* -> /index.html (200)` for React Router sub-routes (`/app`, `/app/suppliers`, `/app/catalog`, etc.)
- **Node version:** `20`

## Prototype Note

This is a frontend-only demonstration using local seeded datasets, simulated AI/workflow delays, and `localStorage` persistence. No external backend APIs, databases, or live Shopify connections are active.
