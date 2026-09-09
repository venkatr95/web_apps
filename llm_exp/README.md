# UUID Form Filler Agent 🔐

AI-powered form auto-fill application using OpenAI GPT to intelligently map UUIDs to form data.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This full-stack application demonstrates an AI agent that maps UUIDs to objects and automatically fills form fields. The system uses:

- **OpenAI GPT** for intelligent data mapping and formatting
- **FastAPI** for the backend REST API
- **React + TypeScript** for the interactive frontend
- **SQLite** for persistent session storage

## ✨ Features

- 🤖 **AI-Powered Mapping**: OpenAI agent intelligently processes and formats form data
- 🔍 **UUID Lookup**: Search by typing UUID or select from dropdown
- 📝 **Auto-Fill Forms**: Instantly populate all form fields based on UUID
- 💾 **Session Persistence**: Local SQLite database stores all data
- 🎨 **Modern UI**: Clean, responsive React interface
- 🚀 **Fast API**: RESTful backend with automatic API documentation
- 🔄 **Real-time Updates**: Immediate form filling on UUID selection

## 🏗️ Architecture

```
┌─────────────┐      HTTP/REST      ┌──────────────┐      OpenAI API      ┌─────────────┐
│   React     │ ◄─────────────────► │   FastAPI    │ ◄──────────────────► │   OpenAI    │
│  Frontend   │                     │   Backend    │                      │     GPT     │
└─────────────┘                     └──────┬───────┘                      └─────────────┘
                                           │
                                           │ SQLAlchemy
                                           ▼
                                    ┌──────────────┐
                                    │   SQLite DB  │
                                    │  (uuid_forms)│
                                    └──────────────┘
```

## 🛠️ Tech Stack

### Backend

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **OpenAI Python SDK** - GPT integration
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Axios** - HTTP client

### Database

- **SQLite** - Lightweight relational database

## 📁 Project Structure

```
llm_exp/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # SQLAlchemy database models
│   ├── database.py          # Database configuration and seeding
│   ├── agent.py             # OpenAI agent implementation
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── uuid_forms.db        # SQLite database (created on first run)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UUIDComboBox.tsx   # UUID input/dropdown component
│   │   │   └── FormFields.tsx     # Form display component
│   │   ├── api/
│   │   │   └── formApi.ts         # API client functions
│   │   ├── types/
│   │   │   └── FormData.ts        # TypeScript interfaces
│   │   ├── App.tsx                # Main application component
│   │   ├── App.css                # Application styles
│   │   ├── main.tsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── index.html           # HTML template
│   ├── package.json         # Node.js dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   └── vite.config.ts       # Vite configuration
│
├── .github/
│   └── copilot-instructions.md    # GitHub Copilot workspace instructions
│
└── README.md                # This file
```

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Step 1: Clone and Navigate

```bash
cd c:\Users\madhavan\Desktop\llm_exp
```

### Step 2: Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**

   ```bash
   # Windows
   .\venv\Scripts\activate

   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment:**

   ```bash
   # Copy the example file
   copy .env.example .env

   # Edit .env and add your OpenAI API key
   # OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

6. **Run the backend:**

   ```bash
   python main.py
   ```

   The backend will start at `http://localhost:8000`

   ✅ API documentation available at `http://localhost:8000/docs`

### Step 3: Frontend Setup

1. **Open new terminal and navigate to frontend:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   The frontend will start at `http://localhost:5173`

### Step 4: Access the Application

Open your browser and navigate to:

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📖 Usage

### Using the Application

1. **Open the application** in your browser at http://localhost:5173

2. **Select a UUID** in one of two ways:
   - **Type**: Enter a UUID directly in the input field
   - **Select**: Click the dropdown button and choose from available UUIDs

3. **View auto-filled form**: The form fields will automatically populate with:
   - Name
   - Email
   - Phone
   - Address
   - Company
   - Position
   - Notes

### Demo Data

The application includes 5 pre-populated demo records. UUIDs are randomly generated on first run. Check the backend terminal output for the seeded UUIDs, or use the dropdown to see all available options.

### How It Works

1. **User selects UUID** from dropdown or types it in
2. **Frontend sends request** to FastAPI backend
3. **Backend queries SQLite** database for UUID data
4. **OpenAI agent processes** the raw data:
   - Validates field content
   - Formats data professionally
   - Adds context where helpful
5. **Backend returns** formatted data to frontend
6. **Form auto-fills** with processed information

## 📚 API Documentation

### Base URL

```
http://localhost:8000
```

### Endpoints

#### 1. Get All UUIDs

```http
GET /api/uuids
```

**Response:**

```json
[
  "550e8400-e29b-41d4-a716-446655440000",
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  ...
]
```

#### 2. Get Form Data by UUID

```http
POST /api/get-form-data
```

**Request Body:**

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0101",
  "address": "123 Main St, New York, NY 10001",
  "company": "Tech Corp",
  "position": "Software Engineer",
  "notes": "Senior developer with 5+ years experience"
}
```

#### 3. Health Check

```http
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "openai_configured": true
}
```

### Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 Development

### Backend Development

**Run with auto-reload:**

```bash
cd backend
python main.py
```

**Add new dependencies:**

```bash
pip install package-name
pip freeze > requirements.txt
```

**Database operations:**

- Database file: `backend/uuid_forms.db`
- To reset database: Delete `uuid_forms.db` and restart backend
- Models defined in: `backend/models.py`

### Frontend Development

**Development server:**

```bash
cd frontend
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Type checking:**

```bash
npm run lint
```

### OpenAI Agent Customization

The agent behavior can be customized in [backend/agent.py](backend/agent.py):

- **Model selection**: Change `model` parameter (e.g., "gpt-4", "gpt-4o-mini")
- **Temperature**: Adjust creativity (0.0 = deterministic, 1.0 = creative)
- **System prompt**: Modify agent instructions and behavior
- **Response format**: Customize output structure

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**

```bash
# Find and kill process using port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in main.py:
uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
```

**OpenAI API errors:**

- Verify API key in `.env` file
- Check API key validity at https://platform.openai.com/api-keys
- Ensure you have API credits available

**Database errors:**

- Delete `uuid_forms.db` and restart to recreate
- Check file permissions

### Frontend Issues

**Dependencies not installing:**

```bash
# Clear npm cache
npm cache clean --force
npm install
```

**CORS errors:**

- Ensure backend is running on port 8000
- Check CORS middleware configuration in `backend/main.py`

**Build errors:**

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Connection Issues

**Frontend can't reach backend:**

1. Verify backend is running: http://localhost:8000
2. Check Vite proxy configuration in `frontend/vite.config.ts`
3. Ensure both servers are running simultaneously

## 📝 Environment Variables

### Backend (.env)

```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional
APP_ENV=development
DEBUG=True
```

## 🔒 Security Notes

- Never commit `.env` file with real API keys
- Use `.env.example` as template only
- Keep OpenAI API key secure
- SQLite database contains demo data only

## 📄 License

This project is created for educational and experimental purposes.

## 🤝 Contributing

This is an experimental project. Feel free to:

- Report issues
- Suggest improvements
- Fork and modify for your needs

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify API documentation at http://localhost:8000/docs

---

**Built with ❤️ using OpenAI, FastAPI, and React**
