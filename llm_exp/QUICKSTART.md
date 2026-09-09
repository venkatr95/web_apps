# UUID Form Filler Agent - Quick Reference

## 🚀 Quick Start (One Command)

### Windows

```bash
start.bat
```

This script will:

1. Create `.env` file (if needed)
2. Install backend dependencies
3. Install frontend dependencies
4. Start both servers
5. Open application in browser

### Manual Start

**Terminal 1 - Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## 📍 URLs

- **Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## ⚙️ First Time Setup

1. Get OpenAI API key: https://platform.openai.com/api-keys
2. Copy `backend/.env.example` to `backend/.env`
3. Add your key: `OPENAI_API_KEY=sk-your-key-here`

## 🎯 How to Use

1. Open http://localhost:5173
2. Select UUID from dropdown OR type UUID
3. Form auto-fills with AI-processed data

## 📦 What's Included

✅ FastAPI backend with OpenAI integration
✅ React + TypeScript frontend
✅ SQLite database with 5 demo records
✅ Auto-fill form functionality
✅ UUID combobox (input + dropdown)
✅ Session persistence
✅ Complete documentation

## 🔧 Troubleshooting

**OpenAI errors?**

- Check `.env` file has valid API key
- Verify key at https://platform.openai.com/api-keys

**Port conflicts?**

- Backend: Edit `main.py` port setting
- Frontend: Edit `vite.config.ts` port setting

**Database issues?**

- Delete `backend/uuid_forms.db`
- Restart backend (auto-recreates with demo data)

## 📚 Full Documentation

See [README.md](README.md) for complete documentation.

## 🛠️ Tech Stack

- Backend: FastAPI + SQLAlchemy + OpenAI
- Frontend: React + TypeScript + Vite
- Database: SQLite
- AI: OpenAI GPT-4o-mini

---

**Need help?** Check the main README.md or API docs at http://localhost:8000/docs
