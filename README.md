# ⚙️ ShopNow — Admin Panel

The internal admin dashboard for managing the ShopNow e-commerce store.

## Features
- Secure JWT-based admin login
- Product management (add, edit, delete, image upload via Cloudinary)
- Category management
- Order management & status updates
- Customer accounts overview
- Dashboard with sales analytics

## Development

```bash
npm install
npm run dev
# → http://localhost:5174
```

## Environment Variables

Create a `.env` file in this directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_STORE_URL=http://localhost:5173
```

For production, replace with your hosted backend and storefront URLs.

## Build for Production

```bash
npm run build
# Output → dist/
```

## Deploy to Vercel

1. Push this folder as a **separate** Vercel project (different from the website)
2. Set the two environment variables above in Vercel dashboard
3. The `vercel.json` handles SPA routing automatically

## Security Notes
- This app should ideally have IP-allowlisting or Basic Auth at the Vercel/CDN level
- JWT tokens expire after 24 hours
- Change the default admin credentials immediately after first deploy
