# MD Tours WhatsApp Bot

Automated WhatsApp enquiry bot for **MD Tours (Matrubhoomi Darshan Tours)**, Pune.  
Customers send a message → AI (Gemini) replies in their language → Lead saved to MySQL.

## Features

- 🤖 AI-powered replies via **Google Gemini 2.0 Flash**
- 🌐 **5 languages**: English, Hindi, Marathi, Hinglish, Minglish
- 💾 **Conversation memory** per user (MySQL)
- 📋 **Lead capture** — auto-extracts name, destination, dates, group size
- 🔒 **Signature validation** — rejects fake webhook requests
- 🛑 **Duplicate message guard** — handles Meta's retry behaviour
- 📊 **Admin dashboard** at `/admin` to view all leads
- 📝 **Structured logging** with timestamps

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Create database tables
```bash
npm run setup
```

### 4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## Deployment (Railway)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a MySQL plugin
4. Set all `.env` variables in Railway dashboard
5. Railway gives you a permanent HTTPS URL — set it as your Meta webhook

## Meta Webhook Setup

1. Go to Meta for Developers → Your App → WhatsApp → Configuration
2. **Callback URL**: `https://your-domain.com/webhook`
3. **Verify Token**: same as `META_VERIFY_TOKEN` in your `.env`

## Admin Dashboard

Visit `https://your-domain.com/admin`  
Password = `ADMIN_PASSWORD` from your `.env`

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `META_APP_SECRET` | From Meta App Dashboard → Settings → Basic |
| `META_VERIFY_TOKEN` | You invent this, paste same in Meta Dashboard |
| `META_WHATSAPP_TOKEN` | From Meta → WhatsApp → API Setup |
| `META_PHONE_NUMBER_ID` | From Meta → WhatsApp → API Setup |
| `GEMINI_API_KEY` | From [aistudio.google.com](https://aistudio.google.com) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default: 3306) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `ADMIN_PASSWORD` | Password for `/admin` dashboard |
