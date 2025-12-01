# CRM Lead Management System

A comprehensive CRM system for managing leads, campaigns, and WhatsApp integrations.

## 🌟 Features

- **Lead Management:** Import and organize leads from multiple sources
- **Campaign Tracking:** Monitor message delivery and engagement
- **Dynamic Labels:** Organize leads with custom labels synced from WhatsApp
- **Real-time Sync:** Automatic updates via Supabase subscriptions
- **File Processing:** Automated Excel/CSV upload processing via n8n

## 🏗️ Architecture

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Supabase (PostgreSQL + RLS)
- **Automation:** n8n workflows
- **Hosting:** Bolt.new / Netlify

## 🚀 Quick Start

### Prerequisites

- Supabase account (free tier works)
- n8n instance (self-hosted or cloud)
- Node.js 18+ (for local development)

### Installation

1. **Clone this repository**

```bash
git clone <your-repo-url>
cd FULL-CRM-2
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_N8N_WEBHOOK_URL` - Your n8n webhook URL

4. **Run development server**

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 📋 Environment Setup

### Get Supabase Credentials:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

### Get n8n Webhook URL:

1. Open your n8n instance
2. Import the provided workflow JSON
3. Click the Webhook node
4. Copy the webhook URL → `VITE_N8N_WEBHOOK_URL`

## 🗄️ Database Setup

1. Go to Supabase SQL Editor
2. Run the provided `schema.sql` file
3. Verify tables are created in Table Editor

## 📁 Project Structure

```
FULL-CRM-2/
├── src/
│   ├── pages/           # Main application pages
│   │   ├── HomePage.tsx       # Dashboard with upload cards
│   │   ├── LeadsPage.tsx      # Lead database view
│   │   ├── CampaignsPage.tsx  # Campaign management
│   │   └── SettingsPage.tsx   # System configuration
│   ├── components/      # Reusable UI components
│   ├── lib/            # Core logic
│   │   ├── supabase-queries.ts  # Database operations
│   │   └── n8n-webhook.ts       # Upload functions
│   └── assets/         # Static files
├── .env                # Environment configuration
└── package.json        # Dependencies
```

## 🔄 Upload Workflows

### 1. New Scrapes
Upload leads from any source (WhatsApp, Social Media, etc.)

**Expected Excel columns:**
- Phone_1, Name, Last_Name, Nationality, Bio, URL

### 2. Campaign Results
Upload WaBulkSender delivery reports

**Expected Excel columns:**
- Sent successfully, Failed to send, Not sent, Duplicate

### 3. Labels
Upload phone-to-label mappings

**Expected Excel columns:**
- Phone_1, Group

## 🛠️ Development

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Run tests

```bash
npm run test
```

## 📚 Documentation

- **System Architecture:** See `N8N-DATABASE-FLOW.md`
- **Deployment Guide:** See `DEPLOYMENT-GUIDE.md`
- **Progress Summary:** See `PHASE-3-PROGRESS-SUMMARY.md`

## 🐛 Troubleshooting

### White screen on load
- Check browser console (F12) for errors
- Verify all environment variables are set in `.env`
- Ensure Supabase anon key is valid

### Upload fails
- Check n8n workflow is activated
- Verify webhook URL is correct
- Check n8n execution logs for errors

### No data displayed
- Verify Supabase credentials
- Check database has data: `SELECT * FROM leads LIMIT 5;`
- Ensure RLS policies allow read access

## 🔒 Security

**Before production:**
- Enable Supabase Row Level Security (RLS)
- Set up proper authentication
- Use HTTPS only
- Secure n8n with authentication
- Never commit `.env` to git (already in .gitignore)

## 📞 Support

For issues related to:
- **Database:** https://supabase.com/docs
- **Automation:** https://docs.n8n.io
- **Frontend:** https://vitejs.dev/guide

## 📝 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a private project. Contact the repository owner for contribution guidelines.

---

**Version:** 1.0.0
**Last Updated:** 2025-11-24
