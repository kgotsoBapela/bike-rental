# 🚲 BikeRent Admin

A full-featured bike rental management system built with React + Supabase.

## Features
- 🔐 Admin & Read-only user roles
- 🚲 Bike fleet management with photos & component tracking
- 📋 Rental management (linked to customer profiles)
- 🔧 Maintenance scheduling
- 📅 Calendar view of bookings
- 👥 Customer & system user management

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `schema_v2.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

### 2. Environment Variables
Create a `.env` file in the root:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run locally
```bash
npm install
npm start
```

### 4. Deploy to Vercel
Push to GitHub, import in Vercel, add the two env variables above.

## Default Logins
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bikerent.com | admin123 |
| Viewer | viewer@bikerent.com | viewer123 |
